import { Puller } from "@/components/Puller";
import { addHslAlpha } from "@/lib/client/addHslAlpha";
import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { useSession } from "@/lib/client/session";
import { useAccountStorage } from "@/lib/client/useAccountStorage";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { colors } from "@/lib/colors";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Icon,
  IconButton,
  TextField,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { useHotkeys } from "react-hotkeys-hook";
import { Virtuoso } from "react-virtuoso";
import { RRule } from "rrule";
import { parseEmojis } from ".";
import { Task, taskAlgorithm } from "..";
import { ConfirmationModal } from "../../../../../components/ConfirmationModal";
import { CreateTask } from "../Create";
import SelectDateModal from "../DatePicker";
import { ColorPopover } from "./ColorPopover";
import { useTaskContext } from "./Context";
import { LinkedContent } from "./LinkedContent";
import { RescheduleModal } from "./Snooze";
import { TaskDetailsSection } from "./TaskDetailsSection";

export default function DrawerContent({
  isPlan,
  setCreateSubTaskOpen,
  createSubTaskOpen,
  parentRef,
  isDisabled,
  handleDelete,
}) {
  const { session } = useSession();
  const task = useTaskContext();
  const storage = useAccountStorage();
  const isMobile = useMediaQuery("(max-width: 600px)");

  const isDark = useDarkMode(session.darkMode);
  const isSubTask = task.parentTasks.length !== 0;
  const isRecurring = task.recurrenceRule !== null;
  const isCompleted = task.completionInstances.length > 0;

  const greenPalette = useColor("green", isDark);
  const orangePalette = useColor("orange", isDark);
  const palette = useColor(session.themeColor, isDark);

  useEffect(() => {
    if (createSubTaskOpen) {
      document.getElementById("createSubTask")?.click();
      setCreateSubTaskOpen(false);
    }
  }, [createSubTaskOpen, setCreateSubTaskOpen]);
  const handlePriorityChange = useCallback(async () => {
    task.edit(task.id, "pinned", !task.pinned);

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          fetchRawApi(session, "space/tasks/task", {
            method: "PUT",
            params: {
              id: task.id,
              pinned: task.pinned ? "false" : "true",
            },
          });
          resolve("");
        } catch (e) {
          reject(e);
        }
      }),
      {
        loading: task.pinned ? "Changing priority..." : "Marking important...",
        success: task.pinned ? "Task unpinned!" : "Task pinned!",
        error: "Failed to change priority",
      }
    );
  }, [task, session]);

  useHotkeys(
    "shift+1",
    (e) => {
      e.preventDefault();
      document.getElementById("pinTask")?.click();
    },
    []
  );

  const handleComplete = useCallback(async () => {
    if (isRecurring) {
      const startDate = dayjs(task.recurringInstance)
        .utc()
        .startOf("day")
        .toDate();
      const endDate = dayjs(task.recurringInstance).utc().endOf("day").toDate();
      const rule = RRule.fromString(
        task.recurrenceRule.replace(/^EXDATE.*$/, "")
      );
      const dates = rule.between(startDate, endDate);
      const iteration = dayjs(dates[0]).startOf("day").utc();

      const newInstance = {
        id: "",
        completedAt: dayjs().toISOString(),
        iteration: iteration,
        taskId: task.id,
      };

      task.set(
        (oldData) => {
          const d = {
            ...oldData,
            completionInstances: isCompleted
              ? oldData.completionInstances.filter(
                  (instance) =>
                    !dayjs(instance.iteration).startOf("day").isSame(iteration)
                )
              : [...task.completionInstances, newInstance],
          };
          task.editCallback(d);
          return d;
        },
        { revalidate: false }
      );

      await fetchRawApi(session, "space/tasks/task/complete", {
        method: "PUT",
        params: {
          id: task.id,
          isRecurring,
          iteration: iteration.toISOString(),
          completedAt: dayjs().toISOString(),
          isCompleted: isCompleted ? "false" : "true",
        },
      });
    } else {
      const newInstance = {
        id: "",
        completedAt: dayjs().toISOString(),
        taskId: task.id,
      };

      task.set(
        (oldData) => {
          const d = {
            ...oldData,
            completionInstances: isCompleted ? [] : [newInstance],
          };
          task.editCallback(d);
          return d;
        },
        { revalidate: false }
      );
      task.close();

      await fetchRawApi(session, "space/tasks/task/complete", {
        method: "PUT",
        params: {
          id: task.id,
          completedAt: dayjs().toISOString(),
          isCompleted: !isCompleted ? "true" : "false",
        },
      });
    }
  }, [session, isRecurring, task, isCompleted]);

  const handlePostpone: any = useCallback(
    async (count, type) => {
      task.set((prev) => {
        const d = {
          ...prev,
          due: dayjs(task.due).add(count, type).toISOString(),
        };
        task.editCallback(d);
        return d;
      });
      await task.edit(
        task.id,
        "due",
        dayjs(task.due).add(count, type).toISOString()
      );

      toast(
        <span>
          <b>{dayjs(task.due).add(count, type).format("dddd, MMMM D")}</b>{" "}
          {dayjs(task.due).add(count, type).format("HHmm") !== "0000" && (
            <>
              {" "}
              at <b>{dayjs(task.due).add(count, type).format("h:mm A")}</b>
            </>
          )}
        </span>
      );
      task.close();
    },
    [task]
  );

  const styles = {
    section: {
      background: { xs: palette[3], sm: palette[2] },
      borderRadius: 5,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      mb: 3,
      "& .item": {
        "&:active": {
          background: { xs: palette[4], sm: palette[3] },
        },
        color: palette[12],
        borderRadius: 0,
        "&.MuiListItem-root, &.MuiListItemButton-root": {
          px: 3,
        },
      },
      "& .item:not(:last-child)": {
        borderBottom: "2px solid",
        borderColor: { xs: palette[4], sm: palette[3] },
      },
    },

    button: {
      color: palette[11],
      background: palette[3],
    },
  };

  const shouldDisable =
    storage?.isReached === true ||
    session.permission === "read-only" ||
    isDisabled;
  const subTasks = task.subTasks.sort(taskAlgorithm);
  return (
    <Box
      sx={{
        "& .Mui-disabled": {
          opacity: "1!important",
        },
      }}
    >
      {isMobile && (
        <Puller
          sx={{
            mb: 0,
            "& .puller": {
              background: palette[6],
            },
          }}
        />
      )}
      <AppBar
        sx={{
          border: 0,
          background: { xs: palette[2], sm: addHslAlpha(palette[1], 0.9) },
        }}
      >
        <Toolbar
          sx={{
            px: { xs: 3, sm: "12px" },
          }}
        >
          <IconButton onClick={task.close} sx={styles.button}>
            <Icon>close</Icon>
          </IconButton>
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              disableRipple
              onClick={handleComplete}
              disabled={shouldDisable}
              sx={{
                "& .text": {
                  display: { xs: "none", sm: "inline" },
                },
                px: 1.5,
                ...styles.button,
                ...(isCompleted && {
                  background: greenPalette[6] + "!important",
                  color: greenPalette[11] + "!important",
                  "&:hover": {
                    background: { sm: greenPalette[4] + "!important" },
                  },
                }),
              }}
            >
              <Icon className={isCompleted ? "" : "outlined"}>
                check_circle
              </Icon>
              <span className="text">
                {isCompleted ? "Completed" : "Complete"}
              </span>
            </Button>
            {!isSubTask &&
              !isRecurring &&
              !isPlan &&
              (task.due ? (
                <RescheduleModal handlePostpone={handlePostpone}>
                  <Button
                    variant="contained"
                    disableRipple
                    disabled={shouldDisable}
                    sx={{
                      px: 1.5,
                      ...styles.button,
                      "& .text": {
                        display: { xs: "none", sm: "inline" },
                      },
                    }}
                  >
                    <Icon className="outlined">bedtime</Icon>
                    <span className="text">Snooze</span>
                  </Button>
                </RescheduleModal>
              ) : null)}
            {!isPlan && (
              <IconButton
                id="pinTask"
                onClick={handlePriorityChange}
                sx={{
                  flexShrink: 0,
                  ...styles.button,
                  ...(task.pinned && {
                    background: orangePalette[3],
                    color: orangePalette[11],
                    "&:hover": {
                      background: orangePalette[4],
                    },
                    "&:active": {
                      background: orangePalette[5],
                    },
                  }),
                }}
                disabled={shouldDisable}
              >
                <Icon
                  {...(!task.pinned && { className: "outlined" })}
                  sx={{
                    ...(task.pinned && {
                      transform: "rotate(-20deg)",
                    }),

                    transition: "transform .2s",
                  }}
                >
                  push_pin
                </Icon>
              </IconButton>
            )}
            <ConfirmationModal
              title="Delete task?"
              question={
                isRecurring
                  ? "This task is recurring. Deleting this task will also delete future ones. Continue?"
                  : `This task has ${task.subTasks.length} subtasks, which will also be deleted, and cannot be recovered.`
              }
              disabled={!isRecurring && task.subTasks.length === 0}
              callback={async () => {
                await handleDelete(task.id);
              }}
            >
              <IconButton
                sx={{
                  flexShrink: 0,
                  ...styles.button,
                }}
              >
                <Icon className="outlined">delete</Icon>
              </IconButton>
            </ConfirmationModal>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          pt: 4,
          px: { xs: 3, sm: 2 },
          pb: { sm: 1 },
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <ColorPopover disabled={shouldDisable} />
          {!isSubTask && (
            <SelectDateModal
              date={task.due}
              disabled={isRecurring}
              isDateOnly={task.dateOnly}
              setDateOnly={(dateOnly) => {
                task.set((prev) => ({
                  ...prev,
                  dateOnly: dateOnly,
                }));
                task.editCallback(task);
                task.edit(task.id, "dateOnly", dateOnly ? "true" : "false");
              }}
              setDate={(d) => {
                task.close();
                task.set((prev) => ({
                  ...prev,
                  due: d ? null : d?.toISOString(),
                }));
                task.editCallback(task);
                task.edit(task.id, "due", d.toISOString());
              }}
            >
              <Chip
                variant="outlined"
                label={
                  isRecurring
                    ? capitalizeFirstLetter(
                        RRule.fromString(
                          task.recurrenceRule.replace(/^EXDATE.*$/, "")
                        ).toText()
                      )
                    : task.due
                    ? dayjs(task.due)
                        .utc()
                        .format(
                          task.dateOnly
                            ? "MMMM D, YYYY"
                            : "MMMM D, YYYY [at] h:mm A"
                        )
                    : "Tap to schedule"
                }
                disabled={shouldDisable}
                {...(task.column &&
                  task.due && {
                    onDelete: () => {
                      task.set((prev) => ({
                        ...prev,
                        due: "",
                        dateOnly: true,
                      }));
                      task.editCallback(task);
                      task.edit(task.id, "due", "");
                      task.edit("dateOnly", true, "");
                    },
                  })}
              />
            </SelectDateModal>
          )}
        </Box>
        <TextField
          disabled={shouldDisable}
          multiline
          placeholder="Task name"
          fullWidth
          defaultValue={parseEmojis(task.name.trim())}
          variant="standard"
          onBlur={(e) => {
            if (e.target.value.trim() !== "") {
              task.edit(task.id, "name", e.target.value);
            }
          }}
          onChange={(e: any) =>
            (e.target.value = e.target.value.replaceAll("\n", ""))
          }
          onKeyDown={(e: any) => e.key === "Enter" && e.target.blur()}
          margin="dense"
          InputProps={{
            disableUnderline: true,
            className: "font-heading",
            sx: {
              "&:focus-within": {
                "&, & *": { textTransform: "none!important" },
                background: palette[2],
                px: 1,
                borderRadius: 5,
              },
              fontSize: { xs: "50px", sm: "var(--bottom-nav-height)" },
              color: colors[task.color][isDark ? "A200" : 800],
            },
          }}
        />

        <TaskDetailsSection
          data={task}
          shouldDisable={shouldDisable}
          styles={styles}
        />

        <Box sx={styles.section}>
          {!isSubTask && !shouldDisable && (
            <>
              <CreateTask
                isSubTask
                parentId={task.id}
                onSuccess={() => {
                  task.mutate();
                  document.getElementById("taskMutationTrigger")?.click();
                }}
                boardData={
                  task.column
                    ? {
                        boardId: "",
                        columnId: task.column.id,
                        columnName: task.column.name,
                        columnEmoji: task.column.emoji,
                      }
                    : undefined
                }
                defaultDate={task.due ? new Date(task.due) : null}
                sx={{ width: "100%" }}
              >
                <Box
                  sx={{ p: task.subTasks.length == 0 ? 0 : 2, width: "100%" }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    id="createSubTask"
                    sx={{ background: palette[4] + "!important" }}
                  >
                    <Icon>add_circle</Icon>Subtask
                  </Button>
                </Box>
              </CreateTask>
              <Virtuoso
                useWindowScroll
                customScrollParent={parentRef.current}
                totalCount={subTasks.length}
                itemContent={(index) => {
                  const subTask = subTasks[index];
                  return (
                    <Task
                      key={subTask.id}
                      isSubTask
                      sx={{
                        pl: { xs: 2.6, sm: 1.7 },
                        "& .date": {
                          display: "none",
                        },
                      }}
                      board={subTask.board || false}
                      columnId={subTask.column ? subTask.column.id : -1}
                      handleMutate={task.mutate}
                      task={subTask}
                    />
                  );
                }}
              />
            </>
          )}
        </Box>
        <LinkedContent data={task} styles={styles} />
      </Box>
    </Box>
  );
}
