import { prisma } from "../../../../lib/client";
import { validatePermissions } from "../../../../lib/validatePermissions";

const handler = async (req: any, res: any) => {
  // Validate permissions
  const permissions = await validatePermissions(
    req.query.property,
    req.query.accessToken
  );
  if (!permissions || permissions === "read-only") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Update note

  const data = await prisma.maintenanceReminder.update({
    where: {
      id: req.query.id,
    },
    data: {
      note: req.query.note,
    },
  });

  res.json(data);
};
export default handler;
