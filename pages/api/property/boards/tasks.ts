import { prisma } from "../../../../lib/prismaClient";
import { validatePermissions } from "../../../../lib/validatePermissions";

/**
 * API handler
 * @param {any} req
 * @param {any} res
 * @returns {any}
 */
const handler = async (req, res) => {
  const permissions = await validatePermissions(
    req.query.property,
    req.query.accessToken
  );
  if (!permissions) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  //  List all tasks for a board from the column
  const data = await prisma.column.findMany({
    where: {
      board: {
        id: req.query.id,
      },
    },
    include: {
      tasks: {
        include: {
          subTasks: true,
          parentTasks: true,
        },
      },
    },
  });

  res.json(data);
};

export default handler;
