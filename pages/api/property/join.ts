import { prisma } from "../../../lib/client";

/**
 * API handler for the /api/property/updateInfo endpoint
 * @param {any} req
 * @param {any} res
 * @returns {any}
 */
const handler = async (req: any, res: any) => {
  //   Set selected to false for all other properties of the user email
  await prisma.propertyInvite.updateMany({
    where: {
      user: {
        email: req.query.email,
      },
      selected: true,
    },
    data: {
      selected: false,
    },
  });

  const data: any | null = await prisma.propertyInvite.update({
    where: {
      accessToken: req.query.accessToken,
    },
    data: {
      selected: true,
      accepted: true,
    },
    include: {
      profile: { select: { name: true } },
    },
  });

  res.json(data);
};
export default handler;
