import { fetchRawApi } from "@/lib/client/useApi";
import { toastStyles } from "@/lib/client/useTheme";
import { Box, Button, Chip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useCallback } from "react";
import toast from "react-hot-toast";

export function Task({ task, mutateRoutine, setCurrentIndex }) {
  const handleClick = useCallback(() => {
    setCurrentIndex((index) => index + 1);
    fetchRawApi("user/coach/goals/markAsDone", {
      date: dayjs().format("YYYY-MM-DD"),
      progress:
        task.progress && parseInt(task.progress)
          ? task.progress + 1 > task.durationDays
            ? task.durationDays
            : task.progress + 1
          : 1,
      id: task.id,
    })
      .then(() => mutateRoutine())
      .catch(() =>
        toast.error(
          "Yikes! Something went wrong while trying to mark your routine as done",
          toastStyles
        )
      );
  }, [
    task.durationDays,
    task.id,
    task.progress,
    setCurrentIndex,
    mutateRoutine,
  ]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h2"
        className="font-heading"
        gutterBottom
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {task.stepName}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          my: 2,
          "& .MuiChip-root": {
            background: "hsl(240,11%,20%)!important",
            color: "hsl(240,11%,90%)!important",
          },
        }}
      >
        <Chip label={task.category} size="small" />
        <Chip
          size="small"
          label={`${~~((task.progress / task.durationDays) * 100)}% complete`}
        />
        <Chip
          size="small"
          label={
            task.time === "any"
              ? "Daily"
              : task.time === "morning"
              ? "Every morning"
              : task.time === "afternoon"
              ? "Every afternoon"
              : task.time === "evening"
              ? "Every evening"
              : "Nightly"
          }
        />
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: "70px",
          width: "100%",
          left: 0,
          gap: 1,
          p: 4,
          display: "flex",
          flexDirection: "column",
          pb: 2,
        }}
      >
        <Button
          disabled={task.lastCompleted === dayjs().format("YYYY-MM-DD")}
          variant="contained"
          fullWidth
          sx={{
            "&,&:hover": { background: "hsl(240,11%,14%)!important" },
            color: "#fff!important",
            transition: "transform .2s!important",
            "&:active": {
              transform: "scale(.95)",
            },
          }}
          size="large"
          onClick={handleClick}
        >
          {task.lastCompleted === dayjs().format("YYYY-MM-DD") ? (
            <>
              <span>🔥</span> Completed today!
            </>
          ) : (
            <>
              <span>🎯</span> I worked towards it!
            </>
          )}
        </Button>
      </Box>
    </Box>
  );
}