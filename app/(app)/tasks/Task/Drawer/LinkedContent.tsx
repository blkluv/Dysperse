import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useSession } from "@/lib/client/session";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  Avatar,
  Box,
  Icon,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-hot-toast";
import { useTaskContext } from "./Context";

export const LinkedContent = React.memo(function LinkedContent({
  styles,
}: any) {
  const router = useRouter();
  const task = useTaskContext();
  const { session } = useSession();
  const palette = useColor(session.themeColor, useDarkMode(session.darkMode));

  const isTaskImported = task.id.includes("-event-assignment");
  const isBoardPublic = task?.column?.board?.public !== false;
  const groupName = task.property.name;
  const isGroupVisible = !(task?.column?.board?.public === false);

  const handleGroupClick = () => {
    router.push(`/spaces/${task.property.id}`);
  };

  const handleBoardClick = () => {
    router.push(`/tasks/boards/${task.column.board.id}`);
  };

  const handleRemoveBoard = async () => {
    if (!task.due) {
      toast.error("Set a due date to remove this task from a board");
      return;
    }

    task.set((prev) => ({ ...prev, column: null, columnId: null }));
    task.edit(task.id, "column", null);

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          fetchRawApi(session, "space/tasks/task", {
            method: "PUT",
            params: {
              id: task.id,
              columnId: "null",
            },
          });
          await task.mutate();
          resolve("");
        } catch (e) {
          reject(e);
        }
      }),
      {
        loading: "Removing task from board...",
        success: "Task moved to agenda!",
        error: "Couldn't remove task from board",
      }
    );
  };

  return (
    <Box sx={styles.section}>
      {task.createdBy && (
        <ListItemButton
          className="item"
          onClick={() => {
            router.push(`/users/${task.createdBy.email}`);
          }}
        >
          <Avatar
            src={task.createdBy?.Profile?.picture}
            sx={{ width: 25, height: 25 }}
          />
          <ListItemText primary={`Created by ${task.createdBy?.name}`} />
        </ListItemButton>
      )}
      {task.column && (
        <ListItemButton className="item" onClick={handleBoardClick}>
          <Icon className="outlined">view_kanban</Icon>
          <ListItemText
            secondary={task.column.name}
            primary={`Found in "${task.column.board.name}"`}
          />
          <ConfirmationModal
            callback={handleRemoveBoard}
            title="Remove task from board?"
            question="It won't show up in your board anymore but will appear in perspectives"
          >
            <IconButton
              sx={{
                ml: "auto",
                mr: -0.5,
                background: palette[3] + "!important",
              }}
              className="outlined"
            >
              <Icon>close</Icon>
            </IconButton>
          </ConfirmationModal>
        </ListItemButton>
      )}
      <ListItemButton className="item" onClick={handleGroupClick}>
        <Icon className="outlined">{isBoardPublic ? "group" : "lock"}</Icon>
        <ListItemText
          primary={isGroupVisible ? groupName : "Only visible to you"}
          secondary={isGroupVisible ? "Visible to group" : undefined}
        />
      </ListItemButton>
      <ListItem className="item">
        <Icon className="outlined">access_time</Icon>
        <ListItemText
          primary={`Edited ${dayjs(task.lastUpdated).fromNow()}`}
          secondary={
            task.completedAt && `Completed ${dayjs(task.completedAt).fromNow()}`
          }
        />
      </ListItem>
      {isTaskImported && (
        <ListItem className="item">
          <Box
            sx={{
              background: "linear-gradient(45deg, #ff0f7b, #f89b29)",
              color: "#000",
              width: 13,
              height: 13,
              borderRadius: "50%",
            }}
          />
          <ListItemText primary={`Imported from Canvas LMS`} />
        </ListItem>
      )}
    </Box>
  );
});
