import { Masonry } from "@mui/lab";
import {
  AppBar,
  Box,
  Icon,
  IconButton,
  Skeleton,
  SwipeableDrawer,
  Toolbar,
  Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useSession } from "../../pages/_app";
import { ErrorHandler } from "../Error";
import { Goal } from "./Goal";

const ExploreGoals = dynamic(() => import("./ExploreGoals"));

export function MyGoals({ setHideRoutine }): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const session = useSession();

  //
  const { data, error, url } = useApi("user/routines");
  useEffect(() => {
    const tag: any = document.querySelector(`meta[name="theme-color"]`);
    tag.setAttribute(
      "content",
      open ? "#814f41" : session?.user?.darkMode ? "hsl(240,11%,10%)" : "#fff"
    );
  });

  useEffect(() => {
    if (data && data.length === 0) {
      setHideRoutine(true);
    } else {
      setHideRoutine(false);
    }
  }, [data, setHideRoutine]);
  return (
    <>
      <SwipeableDrawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        PaperProps={{
          sx: {
            width: "100vw",
            maxWidth: "700px",
            ...(session?.user?.darkMode && {
              backgroundColor: "hsl(240,11%,15%)",
            }),
          },
        }}
      >
        <AppBar>
          <Toolbar sx={{ height: "64px" }}>
            <IconButton color="inherit" onClick={() => setOpen(false)}>
              <span
                className="material-symbols-rounded"
                style={{ color: "#fff" }}
              >
                west
              </span>
            </IconButton>
            <Typography
              sx={{
                mx: "auto",
                fontWeight: "600",
                color: "#fff",
              }}
            >
              Explore
            </Typography>
            <IconButton
              color="inherit"
              onClick={() =>
                document.getElementById("createBlankGoalTrigger")?.click()
              }
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#fff" }}
              >
                add_circle
              </span>
            </IconButton>
          </Toolbar>
        </AppBar>
        <ExploreGoals setOpen={setOpen} mutationUrl={url} />
      </SwipeableDrawer>

      {data ? (
        <>
          {data.length !== 0 && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 7, mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "900",
                  mb: 1,
                }}
              >
                Progress
              </Typography>
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 0.5,
                  borderRadius: 999,
                  gap: "10px",
                  backgroundColor: session?.user?.darkMode
                    ? "hsl(240,11%,14%)"
                    : "rgba(200,200,200,.3)",
                }}
              >
                <picture>
                  <img
                    src="https://ouch-cdn2.icons8.com/nTJ88iDOdCDP2Y6YoAuNS1gblZ8t0jwB_LVlkpkkBeo/rs:fit:256:321/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9wbmcvOTU0/L2RmYmM2MGJkLWUz/ZWMtNDVkMy04YWIy/LWJiYmY1YjM1ZDJm/NS5wbmc.png"
                    alt="trophy"
                    width={20}
                    height={20}
                    style={{
                      transform: "rotate(-15deg)",
                    }}
                  />
                </picture>
                <span>{session?.user?.trophies}</span>
              </Box>
            </Box>
          )}
          {data.length === 0 ? (
            <div
              className="mb-4 flex w-full flex-col items-center rounded-xl bg-gray-200 p-8 px-5 text-gray-900 dark:bg-gray-900 dark:text-white sm:flex-row"
              style={{ gap: "30px" }}
            >
              <picture>
                <img
                  src="https://i.ibb.co/ZS3YD9C/casual-life-3d-target-and-dart.png"
                  alt="casual-life-3d-target-and-dart"
                  width="100px"
                />
              </picture>
              <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                <Typography variant="h5" gutterBottom>
                  You haven&apos;t created any goals yet.
                </Typography>
                <Typography variant="body1">
                  Dysperse Coach helps you achieve your goals by adding small
                  tasks to enrich your daily routine.
                </Typography>
              </Box>
            </div>
          ) : (
            <>
              {
                // if goals are completed
                data.filter(
                  (goal) =>
                    goal.progress >= goal.durationDays && !goal.completed
                ).length > 0 && (
                  <Typography
                    sx={{
                      color: "warning.main",
                      fontWeight: "600",
                      mb: 2,
                    }}
                  >
                    You completed{" "}
                    {
                      data.filter(
                        (goal) =>
                          goal.progress >= goal.durationDays && !goal.completed
                      ).length
                    }{" "}
                    goal
                    {data.filter(
                      (goal) =>
                        goal.progress >= goal.durationDays && !goal.completed
                    ).length > 1 && "s"}
                    ! Scroll down to claim your trophy.
                  </Typography>
                )
              }
              <Box sx={{ mr: { sm: -2 } }}>
                <Masonry columns={{ xs: 1, sm: 2 }} spacing={{ xs: 0, sm: 2 }}>
                  {
                    // Sort goals by days left (goal.progress  / goal.durationDays). Sort in reverse order, and move `goal.progress === goal.durationDays` to the end
                    data
                      .sort((a, b) => {
                        if (a.progress === a.durationDays) {
                          return 1;
                        }
                        if (b.progress === b.durationDays) {
                          return -1;
                        }
                        return (
                          b.progress / b.durationDays -
                          a.progress / a.durationDays
                        );
                      })
                      .map((goal) => (
                        <Goal key={goal.id} goal={goal} mutationUrl={url} />
                      ))
                  }
                </Masonry>
              </Box>
            </>
          )}
        </>
      ) : error ? (
        <ErrorHandler error="An error occured while trying to fetch your routines" />
      ) : (
        <Box>
          {[...new Array(10)].map((_, i) => (
            <Skeleton
              variant="rectangular"
              width="100%"
              key={i.toString()}
              height={70}
              animation="wave"
              sx={{ borderRadius: 5, my: 4 }}
            />
          ))}
        </Box>
      )}
      <button
        onClick={() => setOpen(true)}
        className={
          "mb-3 flex w-full select-none items-center rounded-2xl border p-4 shadow-md transition-transform hover:bg-[hsl(240,11%,95%)] active:scale-[.98] active:transition-none dark:bg-gray-900" +
          (data &&
            data.length === 0 &&
            "dark:hover:bg-gray-[hsl(240,11%,20%)] bg-gray-200")
        }
        style={{
          textAlign: "left",
          cursor: "unset",
          ...(session?.user?.darkMode && {
            border: "1px solid hsl(240,11%,20%)",
          }),
          color: session?.user?.darkMode ? "#fff" : "#000",
        }}
      >
        <div>
          <h3 className="font-bold">Set a goal</h3>
          <h4 className="font-sm font-light">
            Set a goal to get started with your routine
          </h4>
        </div>
        <Icon className="outlined" sx={{ ml: "auto" }}>
          add_circle
        </Icon>
      </button>
    </>
  );
}
