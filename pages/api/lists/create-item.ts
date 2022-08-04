import executeQuery from "../../../lib/db";
import { validatePerms } from "../../../lib/check-permissions";
import type { NextApiResponse } from "next";

const handler = async (req: any, res: NextApiResponse<any>) => {
  const perms = await validatePerms(
    req.query.propertyToken,
    req.query.accessToken
  );
  if (!perms || perms === "read-only") {
    res.json({
      error: "INSUFFICIENT_PERMISSIONS",
    });
    return;
  }

  try {
    const result = await executeQuery({
      query:
        "INSERT INTO ListItems (parent, user, title, description) VALUES (?, ?, ?, ?)",
      values: [
        req.query.parent ?? -1,
        req.query.propertyToken ?? false,
        req.query.title ?? "",
        req.query.description ?? "",
      ],
    });
    console.log(result.insertId);
    res.json({
      data: {
        id: result.insertId,
        title: req.query.title,
        description: req.query.description,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
export default handler;
