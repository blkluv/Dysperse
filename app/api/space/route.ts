import {
  getApiParam,
  getIdentifiers,
  getSessionToken,
  handleApiError,
} from "@/lib/server/helpers";
import { prisma } from "@/lib/server/prisma";
import { NextRequest } from "next/server";
import { createInboxNotification } from "./inbox/createInboxNotification";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = await getSessionToken();
    const propertyId = req.nextUrl.searchParams.get("propertyId");
    if (!propertyId) throw new Error("Missing parameters");
    const { userIdentifier, spaceId } = await getIdentifiers(sessionToken);

    const space = await prisma.propertyInvite.findFirstOrThrow({
      where: {
        profile: { id: spaceId },
      },
      include: {
        profile: {
          include: {
            members: {
              select: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    color: true,
                    Profile: { select: { picture: true } },
                  },
                },
              },
            },
            _count: true,
          },
        },
      },
    });

    return Response.json(space);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionId = await getSessionToken();
    const { spaceId } = await getIdentifiers(sessionId);
    const userName = await getApiParam(req, "userName", true);
    const changedKey = await getApiParam(req, "changedKey", true);
    const changedValue = await getApiParam(req, "changedValue", true);
    const timestamp = await getApiParam(req, "timestamp", true);
    const type = await getApiParam(req, "type", false);
    const name = await getApiParam(req, "name", false);
    const color = await getApiParam(req, "color", false);
    const vanishingTasks = await getApiParam(req, "vanishingTasks", false);

    await createInboxNotification(
      userName,
      `changed the ${changedKey} of the group to "${changedValue}"`,
      new Date(timestamp),
      spaceId
    );

    const data = await prisma.property.update({
      where: {
        id: spaceId,
      },
      data: {
        name: name || undefined,
        type: type || undefined,
        color: color || undefined,
        vanishingTasks: vanishingTasks === "true",
      },
    });

    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
