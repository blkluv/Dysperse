import type { Item } from "@prisma/client";
import CryptoJS from "crypto-js";
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

  const data = await prisma.item.findMany({
    where: {
      room: req.query.room,
      trash: false,
      property: {
        id: req.query.property,
      },
    },
  });

  let categories: any = [];
  const raw = data.map((item: Item) => {
    return JSON.parse(
      CryptoJS.AES.decrypt(
        item.category,
        process.env.INVENTORY_ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8)
    );
  });
  raw.forEach((item) => {
    categories = [...categories, ...item];
  });
  res.json(categories);
};

export default handler;