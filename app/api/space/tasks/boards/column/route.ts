import {
  getApiParam,
  getIdentifiers,
  getSessionToken,
  handleApiError,
} from "@/lib/server/helpers";
import { DispatchGroupNotification } from "@/lib/server/notification";
import { prisma } from "@/lib/server/prisma";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = await getSessionToken();
    const { spaceId, userIdentifier } = await getIdentifiers(sessionToken);
    const id = getApiParam(req, "id", true);
    const boardName = getApiParam(req, "boardName", false);
    const who = getApiParam(req, "who", false);
    const emoji = getApiParam(req, "emoji", false);
    const columnName = getApiParam(req, "columnName", false);

    await DispatchGroupNotification(spaceId, {
      title: boardName,
      body: `${who} deleted a column: "${columnName}"`,
      icon: `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emoji}.png`,
    });

    // Delete column, and all tasks in it
    await prisma.task.deleteMany({
      where: {
        AND: [
          { columnId: id },
          {
            OR: [
              { createdBy: { identifier: userIdentifier } },
              { property: { id: spaceId } },
            ],
          },
        ],
      },
    });

    const data = await prisma.column.deleteMany({
      where: {
        AND: [
          { id },
          {
            board: {
              OR: [
                { property: { id: spaceId } },
                { user: { identifier: userIdentifier } },
              ],
            },
          },
        ],
      },
    });

    return Response.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
