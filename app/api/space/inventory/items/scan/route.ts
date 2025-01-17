import { handleApiError } from "@/lib/server/helpers";
import { NextRequest } from "next/server";

async function query(url) {
  const data = new Buffer(url.split(",")[1], "base64");

  const response = await fetch(
    "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
    {
      headers: {
        Authorization: "Bearer " + process.env.AI_AUTH_TOKEN,
      },
      method: "POST",
      body: data,
    }
  );
  const result = await response.json();
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const body = await req.json();
    const imageUrl = JSON.parse(body.imageUrl);

    const response = await query(imageUrl);

    return Response.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
