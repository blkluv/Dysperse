import { prisma } from "../../../../lib/client";
import { validatePermissions } from "../../../../lib/validatePermissions";

/**
 * API handler
 * @param {any} req
 * @param {any} res
 * @returns {any}
 */
const handler = async (req, res) => {
  const permissions: null | string = await validatePermissions(
    req.query.property,
    req.query.accessToken
  );
  if (!permissions || permissions !== "owner") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  //   Delete user from `propertyInvite` table
  const data = await prisma.propertyInvite.delete({
    where: {
      id: parseInt(req.query.id),
    },
  });

  res.json(data);
};
export default handler;
