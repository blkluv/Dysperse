import { prisma } from "../../../prisma/client";

// Query returns User or null
export const getUserData = async (token: string) => {
  const session: any | null = await prisma.session.findUnique({
    where: {
      id: token,
    },
    select: {
      user: {
        select: {
          avatar: true,
          budgetDaily: true,
          budgetMonthly: true,
          budgetWeekly: true,
          color: true,
          currentProperty: true,
          financePlan: true,
          name: true,
          currency: true,
          darkMode: true,
          email: true,
          financeToken: true,
          onboardingComplete: true,
          verifiedEmail: true,
          properties: true,
        },
      },
    },
  });
  return session;
};

const handler = async (req: any, res: any) => {
  res.send(process.env.DATABASE_URL);
  return;
  const session = await getUserData(req.query.token);
  if (session) {
    res.json(session);
  } else {
    res.status(401).json({ message: "Invalid token" });
  }
};
export default handler;
