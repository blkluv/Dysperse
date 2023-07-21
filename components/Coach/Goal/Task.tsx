import { ShareGoal } from "@/components/Coach/Goal/Share";
import { useSession } from "@/lib/client/session";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { useStatusBar } from "@/lib/client/useStatusBar";
import { toastStyles } from "@/lib/client/useTheme";
import useWindowDimensions from "@/lib/client/useWindowDimensions";
import {
  Box,
  Button,
  Chip,
  Dialog,
  Icon,
  IconButton,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import { GoalActivity } from "./Activity";

export function GoalTask({ goal, setSlide, mutationUrl, open, setOpen }) {
  const session = useSession();
  const palette = useColor(session.themeColor, useDarkMode(session.darkMode));
  const { width, height } = useWindowDimensions();

  const [loading, setLoading] = useState<boolean>(false);
  const [stepTwoOpen, setStepTwoOpen] = useState<boolean>(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  const isCompleted = goal.progress === goal.durationDays;

  const [disabled, setDisabled] = useState<boolean>(false);

  useStatusBar(palette[2]);

  const [initialTouchY, setInitialTouchY] = useState<any>(null);

  const handleTouchStart = (event) => {
    setInitialTouchY(event.touches[0].clientY);
  };

  const handleTouchEnd = (event) => {
    const currentTouchY = event.changedTouches[0].clientY;
    const touchDistance = initialTouchY - currentTouchY;
    const swipeThreshold = 100; // Adjust this value based on your requirements

    if (touchDistance > swipeThreshold) {
      document.getElementById("activity")?.click();
    }
    setInitialTouchY(null);
  };

  const handleNext = () => {
    if (goal.progress === goal.durationDays) {
      setStepTwoOpen(true);
    } else {
      setSlide((s) => s + 1);
      setDisabled(true);
      fetchRawApi(session, "user/coach/goals/markAsDone", {
        date: dayjs().toISOString(),
        progress:
          goal.progress && parseInt(goal.progress)
            ? goal.progress + 1 > goal.durationDays
              ? goal.durationDays
              : goal.progress + 1
            : 1,
        id: goal.id,
      })
        .then(async () => await mutate(mutationUrl))
        .catch(() => {
          toast.error(
            "Yikes! Something went wrong while trying to mark your routine as done",
            toastStyles
          );
          setDisabled(false);
        });
    }
  };

  useEffect(() => {
    if (isCompleted && !alreadyPlayed) {
      new Audio("/sfx/confetti.mp3").play();
      setAlreadyPlayed(true);
    }
  }, [isCompleted, alreadyPlayed]);

  useEffect(() => {
    window.location.hash = `#${goal.id}`;
  });

  const handleTrophyEarn = async (icon) => {
    try {
      setLoading(true);
      await fetchRawApi(session, "user/coach/goals/complete", {
        daysLeft: goal.durationDays - goal.progress,
        feedback: icon,
        id: goal.id,
      });
      await mutate(mutationUrl);
      setStepTwoOpen(false);
      toast.success("You earned a trophy! Thanks for your feedback!", {
        ...toastStyles,
        icon: "🎉",
      });
      setLoading(false);
    } catch (e) {
      toast.error("An error occurred. Please try again later.", toastStyles);
      setLoading(false);
    }
  };

  return (
    <Box
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        ...(open && {
          transform: "scale(0.9)",
        }),
        transformOrigin: "top center",
        transition: "transform 0.3s",
        display: "flex",
        height: "100vh",
        mx: "auto",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        "& .goal-task": {
          flexGrow: 1,
          px: 3,
          background: palette[2],
          overflow: "hidden",
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
          width: "100%",
          display: "flex",
          maxWidth: "700px",
          flexDirection: "column",
          justifyContent: "center",
        },
      }}
    >
      <Dialog
        open={stepTwoOpen}
        onClose={() => setStepTwoOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 5,
          },
        }}
        maxWidth="xs"
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Are you satisfied with your progress?
          </Typography>
          <Typography>
            We&apos;d love to hear your feedback so we can improve our platform!
          </Typography>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {[
              "sentiment_dissatisfied",
              "sentiment_neutral",
              "sentiment_satisfied",
            ].map((icon) => (
              <IconButton
                key={icon}
                onClick={() => handleTrophyEarn(icon)}
                disabled={loading}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "50px",
                  }}
                >
                  {icon}
                </span>
              </IconButton>
            ))}
          </Box>
        </Box>
      </Dialog>
      <motion.div
        className="goal-task"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        {!isCompleted && (
          <Box sx={{ mt: "auto" }}>
            <Chip label={`${goal.timeOfDay}:00`} sx={{ mb: 2 }} />
            <Typography
              variant="h1"
              sx={{
                lineHeight: "85px",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
              className="font-heading"
            >
              {goal.stepName}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              {~~((goal.progress / goal.durationDays) * 100)}% complete
            </Typography>
          </Box>
        )}
        {isCompleted && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mt: "auto",
            }}
          >
            <Confetti
              friction={1}
              width={width}
              height={height}
              style={{
                zIndex: 1,
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              style={{
                width: 100,
                height: 100,
              }}
            >
              <picture>
                <img
                  alt="trophy"
                  src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3c6.png"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </picture>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.7 }}
              style={{
                maxWidth: "calc(100% - 20px)",
                textAlign: "center",
              }}
            >
              <Typography className="font-heading" variant="h3">
                {goal.name}
              </Typography>
              <Typography>
                After {goal.durationDays} days of hard work, you earned a
                trophy!
              </Typography>
            </motion.div>
          </Box>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: !isCompleted ? 0.1 : 1.5 }}
          style={{
            marginTop: "auto",
            width: "100%",
          }}
        >
          <Button
            sx={{
              zIndex: 999999999,
              mb: 2,
              background: palette[3],
            }}
            variant="contained"
            fullWidth
            onClick={handleNext}
            disabled={
              disabled ||
              dayjs(goal.lastCompleted).format("YYYY-MM-DD") ==
                dayjs().format("YYYY-MM-DD")
            }
          >
            {isCompleted ? "Claim" : "Done"} <Icon>east</Icon>
          </Button>
        </motion.div>
      </motion.div>
      <Box
        sx={{
          mt: "auto",
          width: "100%",
          p: 1,
          display: "flex",
          zIndex: 999,
          maxWidth: "700px",
        }}
      >
        <GoalActivity goal={goal} open={open} setOpen={setOpen}>
          <Button sx={{ color: "#fff" }} size="small" id="activity">
            <Icon>local_fire_department</Icon>
            Activity
          </Button>
        </GoalActivity>
        <ShareGoal goal={goal}>
          <IconButton sx={{ ml: "auto" }}>
            <Icon>ios_share</Icon>
          </IconButton>
        </ShareGoal>
      </Box>
    </Box>
  );
}
