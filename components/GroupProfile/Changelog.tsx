import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import {
  Box,
  CircularProgress,
  Icon,
  IconButton,
  SwipeableDrawer,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import hexToRgba from "hex-to-rgba";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useApi } from "../../hooks/useApi";
import { useStatusBar } from "../../hooks/useStatusBar";
import { colors } from "../../lib/colors";
import { ErrorHandler } from "../Error";

export function Changelog() {
  const [open, setOpen] = React.useState(false);
  useStatusBar(open);
  const { error, data } = useApi("property/inbox");
  useHotkeys(
    "ctrl+i",
    (e) => {
      e.preventDefault();
      setOpen(false);
      setOpen(!open);
    },
    [open]
  );
  return (
    <>
      <SwipeableDrawer
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        anchor="bottom"
        PaperProps={{
          sx: {
            borderRadius: "20px 20px 0px 0px",
            maxWidth: "500px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            position: "sticky",
            top: 0,
            left: 0,
            p: 5,
            px: 4,
            pb: 1,
            zIndex: 9,
            width: "100%",
            background: hexToRgba(
              colors[themeColor][global.user.darkMode ? 900 : 50],
              0.9
            ),
          }}
        >
          <Typography
            variant="h5"
            className="font-secondary"
            gutterBottom
            sx={{ flexGrow: 1 }}
          >
            Changelog
          </Typography>
          <IconButton
            disableRipple
            color="inherit"
            onClick={() => setOpen(false)}
            sx={{
              color: colors[themeColor][global.user.darkMode ? 50 : 900],
            }}
          >
            <Icon>close</Icon>
          </IconButton>
        </Box>
        <Box
          sx={{
            p: 4,
            pt: 2,
            maxHeight: "70vh",
            overflowY: "scroll",
          }}
        >
          {error && (
            <ErrorHandler error="An error occurred while trying to fetch your inbox" />
          )}
          {!data && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <Timeline
            sx={{
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            {data &&
              data.map((item) => (
                <TimelineItem key={item.id}>
                  <TimelineSeparator>
                    <TimelineDot
                      sx={{
                        background:
                          colors[themeColor][global.user.darkMode ? 900 : 200],
                      }}
                    />
                    <TimelineConnector
                      sx={{
                        background:
                          colors[themeColor][global.user.darkMode ? 900 : 100],
                      }}
                    />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography gutterBottom>
                      <b>{item.who === global.user.name ? "You" : item.who}</b>{" "}
                      {item.what}
                    </Typography>
                    <Typography variant="body2">
                      {dayjs(item.when).fromNow()}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
          </Timeline>

          {data && data.length === 0 && (
            <Typography
              variant="body1"
              sx={{
                mt: 2,
                background: colors[themeColor][100],
                p: 3,
                borderRadius: 5,
              }}
            >
              No recent activity
            </Typography>
          )}
        </Box>
      </SwipeableDrawer>
      <IconButton
        sx={{
          color: "inherit",
          zIndex: 1,
          mr: 1,
          position: "absolute",
          right: "55px",

          mt: 0.2,
        }}
        onClick={() => setOpen(true)}
      >
        <Icon>history</Icon>
      </IconButton>
    </>
  );
}