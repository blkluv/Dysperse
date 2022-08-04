import executeQuery from "../../../../lib/db";
import type { NextApiResponse } from "next";

const handler = async (req: any, res: NextApiResponse<any>) => {
  try {
    const allowedValues = ["houseName", "houseType"];

    const specifiedValues = Object.keys(JSON.parse(req.query.data));
    let intersection = specifiedValues.filter((x) => allowedValues.includes(x));
    intersection.forEach(async (setting) => {
      await executeQuery({
        query:
          "UPDATE SyncTokens SET " + setting + " = ? WHERE accessToken = ?",
        values: [JSON.parse(req.query.data)[setting], req.query.token ?? false],
      });
    });
    res.json({
      data: true,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
export default handler;
