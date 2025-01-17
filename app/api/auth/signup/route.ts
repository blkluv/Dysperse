import { WelcomeEmail } from "@/emails/welcome";
import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { validateCaptcha } from "@/lib/server/captcha";
import { prisma } from "@/lib/server/prisma";
import argon2 from "argon2";
import { NextRequest } from "next/server";
import { Resend } from "resend";
import { createSession } from "../login/route";

export async function sendEmail(name, email) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  resend.sendEmail({
    from: "Dysperse <hello@dysperse.com>",
    to: email,
    subject: "Welcome to the #dysperse family 👋",
    react: WelcomeEmail({ name, email }),
  });
}

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

/**
 * API handler for the /api/signup endpoint
 * @param {any} req
 * @param {any} res
 */
export async function POST(req: NextRequest) {
  const requestBody = await req.json();

  if (process.env.NODE_ENV === "production") {
    try {
      // Validate captcha
      const data = await validateCaptcha(requestBody.captchaToken);
      if (!data.success) {
        return Response.json({ error: true, message: "Invalid Captcha" });
      }
    } catch (e) {
      return Response.json({ error: true, message: "Invalid Captcha" });
    }
  }

  if (!validateEmail(requestBody.email.toLowerCase())) {
    return Response.json({
      error: true,
      message: "Please type in a valid email address",
    });
  }
  if (requestBody.password !== requestBody.confirmPassword) {
    return Response.json({ error: true, message: "Passwords do not match" });
  }
  //  Find if email is already in use
  const emailInUse = await prisma.user.findUnique({
    where: {
      email: requestBody.email.toLowerCase(),
    },
  });

  if (emailInUse) {
    return Response.json({
      error: true,
      message: "Email already in use",
    });
  }
  // Get the user's email and password from the request body
  const { name, email, password } = requestBody;

  // Hash the password
  const hashedPassword = await argon2.hash(password);

  // Create the user in the database
  const user = await prisma.user.create({
    data: {
      Profile: {
        create: {
          birthday: new Date(requestBody.birthday),
          picture: requestBody.picture,
          bio: requestBody.bio,
        },
      },
      name,
      color: requestBody.color,
      darkMode: requestBody.darkMode,
      email: email.toLowerCase(),
      ...(requestBody.username && { username: requestBody.username }),
      agreeTos: true,
      password: hashedPassword,
    },
  });

  //   Get user id from user
  const id = user.id;
  const ip = "Unknown";

  // Create a session token in the session table
  const session = createSession(id, ip);

  //   Create a property
  const property = await prisma.property.create({
    data: {
      name: "My home",
      color: "cyan",
    },
  });
  //   Get property id from property
  const propertyId = property.id;

  // Create boards
  if (requestBody.templates.length > 0) {
    requestBody.templates.forEach(async (template) => {
      try {
        await prisma.board.create({
          data: {
            propertyId,
            name: template.name,
            userId: user.identifier,
            description: template.description,
            columns: {
              createMany: {
                data: template.columns.map((column, index) => ({
                  emoji: column.emoji,
                  name: column.name,
                  order: index,
                })),
              },
            },
          },
        });
      } catch (e) {}
    });
  }

  //   Create a property invite
  await prisma.propertyInvite.create({
    data: {
      selected: true,
      accepted: true,
      permission: "owner",
      profile: {
        connect: {
          id: propertyId,
        },
      },
      user: { connect: { id: id } },
    },
  });

  try {
    await sendEmail(capitalizeFirstLetter(name), email.toLowerCase());
  } catch (e) {
    console.error("Something happened when trying to send the email", e);
  }
  return Response.json({ message: "Success", session });
}
