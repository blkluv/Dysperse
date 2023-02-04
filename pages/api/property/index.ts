import { prisma } from "../../../lib/prismaClient";
import { validatePermissions } from "../../../lib/validatePermissions";

const handler = async (req, res) => {
  const permissions = await validatePermissions(
    req.query.property,
    req.query.accessToken
  );
  if (!permissions) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  console.log(req.query);
  const data = await prisma.propertyInvite.findMany({
    where: {
      AND: [
        { propertyId: req.query.id },
        { accepted: true },
        {
          accessToken: req.query.propertyAccessToken,
        },
      ],
    },
    include: {
      profile: {
        include: {
          members: { select: { id: true } },
        },
      },
    },
    take: 1,
  });

  res.json(data[0]);
};
export default handler;