import { prisma } from "../../../../../lib/prismaClient";
import { validatePermissions } from "../../../../../lib/validatePermissions";

const handler = async (req, res) => {
  const permissions = await validatePermissions(
    req.query.property,
    req.query.accessToken
  );
  if (!permissions) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const data = await prisma.column.create({
    data: {
      name: req.query.title,
      emoji: req.query.emoji,
      board: {
        connect: {
          id: req.query.id,
        },
      },
    },
  });
  res.json(data);
};

export default handler;