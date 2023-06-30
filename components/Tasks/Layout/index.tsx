import { openSpotlight } from "@/components/Layout/Navigation/Search";
import { addHslAlpha } from "@/lib/client/addHslAlpha";
import { useSession } from "@/lib/client/session";
import { useAccountStorage } from "@/lib/client/useAccountStorage";
import { useApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { useDocumentTitle } from "@/lib/client/useDocumentTitle";
import { vibrate } from "@/lib/client/vibration";
import {
  Box,
  Button,
  Chip,
  Divider,
  Icon,
  IconButton,
  InputAdornment,
  SwipeableDrawer,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { mutate } from "swr";
import { ErrorHandler } from "../../Error";
import { Puller } from "../../Puller";
import { CreateTask } from "../Task/Create";
import { Tab } from "./Tab";

function SearchTasks({ setOpen }) {
  const ref: any = useRef();
  const router = useRouter();
  const session = useSession();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.user.color, isDark);

  useEffect(() => {
    if (
      router.asPath.includes("/search") &&
      decodeURIComponent(router.asPath.split("/search/")[1]) !== "[query]"
    ) {
      setQuery(decodeURIComponent(router.asPath.split("/search/")[1]));
    }
  }, [router.asPath]);

  const input = (
    <TextField
      inputRef={ref}
      size="small"
      variant="outlined"
      placeholder="Search tasks..."
      {...(query.trim() && { label: "Search tasks..." })}
      onKeyDown={(e: any) => e.code === "Enter" && e.target.blur()}
      onBlur={() =>
        query.trim() !== "" &&
        router.push(`/tasks/search/${encodeURIComponent(query)}`)
      }
      value={query}
      sx={{
        transition: "all .2s",
        zIndex: 999,
        cursor: "default",
        ...(Boolean(query.trim()) && {
          mr: -6,
        }),
      }}
      onChange={(e) => setQuery(e.target.value)}
      InputProps={{
        sx: {
          cursor: "default",
          borderRadius: 4,
        },
        endAdornment: (
          <InputAdornment position="end">
            {query.trim() && (
              <IconButton size="small">
                <Icon>east</Icon>
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
    />
  );

  const createTask = (
    <Box sx={{ display: "none" }}>
      <CreateTask
        closeOnCreate
        column={{ id: "-1", name: "" }}
        defaultDate={dayjs().startOf("day")}
        label="New task"
        placeholder="Create a task..."
        mutationUrl={""}
        boardId={1}
      />
    </Box>
  );
  return isMobile ? (
    <>
      <SwipeableDrawer
        anchor="top"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { borderRadius: "0 0 20px 20px" } }}
      >
        <Box sx={{ p: 2, pt: 3 }}>
          <Button
            onClick={() => {
              openSpotlight();
              vibrate(50);
              setMobileOpen(false);
            }}
            size="small"
            sx={{ mb: 2 }}
            variant="contained"
          >
            <Icon>arrow_back_ios_new</Icon>Search
          </Button>
          {input}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            overflowX: "auto",
            opacity: 0.3,
          }}
        >
          <Chip sx={{ ml: 2 }} icon={<Icon>push_pin</Icon>} label="Important" />
          <Chip icon={<Icon>priority_high</Icon>} label="Completed" />
          <Chip icon={<Icon>palette</Icon>} label="Has color?" />
          <Chip icon={<Icon>image</Icon>} label="Has attachment?" />
        </Box>
        <Puller sx={{ mb: 0 }} />
      </SwipeableDrawer>
      <IconButton
        sx={{ ml: "auto", color: palette[8] }}
        onClick={() => {
          setMobileOpen(true);
          setTimeout(() => ref?.current?.focus(), 100);
        }}
      >
        <Icon>search</Icon>
      </IconButton>
      {createTask}
    </>
  ) : (
    <Box
      sx={{
        display: "flex",
        mb: { xs: 2, sm: 1.5 },
        gap: 1,
        alignItems: "center",
      }}
    >
      {input}
      {createTask}

      <Tooltip
        placement="right"
        title={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            New task
            <span
              style={{
                background: `hsla(240,11%,${isDark ? 90 : 10}%, .1)`,
                padding: "0 10px",
                borderRadius: "5px",
              }}
            >
              /
            </span>
          </Box>
        }
      >
        <IconButton
          onClick={() => {
            document.getElementById("createTask")?.click();
            setOpen(false);
          }}
          sx={{
            ...(Boolean(query.trim()) && {
              transform: "scale(0)",
            }),
            cursor: "default",
            transition: "transform .2s",
            background: palette[4],
            color: palette[12],
            "&:hover": {
              background: palette[5],
            },
            "&:active": {
              background: palette[6],
            },
          }}
        >
          <Icon>add</Icon>
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export const taskStyles = (palette) => {
  return {
    subheading: {
      my: { xs: 1, sm: 1.5 },
      mt: { xs: 1, sm: 1 },
      textTransform: "uppercase",
      fontWeight: 700,
      opacity: 0.5,
      fontSize: "13px",
      px: 1.5,
      color: palette[12],
      userSelect: "none",
    },
    menu: {
      transition: "transform .2s",
      "&:active": { transform: "scale(0.95)" },
      position: "fixed",
      bottom: {
        xs: "70px",
        md: "30px",
      },
      left: "10px",
      zIndex: 9,
      background: addHslAlpha(palette[3], 0.9),
      backdropFilter: "blur(10px)",
      border: "1px solid",
      borderColor: addHslAlpha(palette[3], 0.5),
      fontWeight: "700",
      display: { md: "none" },
      fontSize: "15px",
      color: palette[12],
    },
  };
};

export function TasksLayout({ open, setOpen, children }) {
  const { data, url, error } = useApi("property/boards");
  const isMobile = useMediaQuery("(max-width: 600px)");

  const storage = useAccountStorage();
  const router = useRouter();
  const session = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.user.color, isDark);

  useHotkeys(["c", "/"], (e) => {
    e.preventDefault();
    document.getElementById("createTask")?.click();
  });

  const sharedBoards =
    data && data.filter((x) => x.propertyId !== session.property.propertyId);

  useHotkeys("d", () => router.push("/tasks/agenda/day"));
  useHotkeys("w", () => router.push("/tasks/agenda/week"));
  useHotkeys("m", () => router.push("/tasks/agenda/month"));
  useHotkeys("y", () => router.push("/tasks/agenda/year"));

  const styles = (condition: boolean) => ({
    cursor: { sm: "unset!important" },
    transition: "none!important",
    px: 1.5,
    gap: 1.5,
    py: 0.8,
    mr: 1,
    mb: 0.3,
    width: "100%",
    fontSize: "15px",
    justifyContent: "flex-start",
    borderRadius: 4,
    "&:hover, &:focus": {
      background: palette[3],
    },
    ...(isDark && {
      color: palette[11],
    }),
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    ...(!condition
      ? {
          color: addHslAlpha(palette[12], 0.7),
          "&:hover": {
            background: palette[3],
          },
        }
      : {
          color: "#fff",
          background: palette[4],
          "&:hover, &:focus": {
            background: palette[5],
          },
        }),
  });

  const ref: any = useRef();
  const title = useDocumentTitle();

  const menuChildren = (
    <>
      {error && (
        <ErrorHandler
          callback={() => mutate(url)}
          error="An error occurred while loading your tasks"
        />
      )}
      {!isMobile && <SearchTasks setOpen={setOpen} />}
      <Typography sx={taskStyles(palette).subheading}>Perspectives</Typography>
      <Box onClick={() => setOpen(false)}>
        {[
          !isMobile && {
            hash: "agenda/day",
            icon: "calendar_today",
            label: "Days",
          },
          {
            hash: "agenda/week",
            icon: isMobile ? "calendar_today" : "view_week",
            label: isMobile ? "Days" : "Weeks",
          },
          {
            hash: "agenda/month",
            icon: "calendar_view_month",
            label: "Months",
          },
          {
            hash: "agenda/year",
            icon: "calendar_month",
            label: "Years",
          },
        ]
          .filter((b) => b)
          .map((button: any) => (
            <Link
              href={`/tasks/${button.hash}`}
              key={button.hash}
              style={{ cursor: "default" }}
            >
              <Button
                size="large"
                id={`__agenda.${button.hash}`}
                sx={styles(router.asPath === `/tasks/${button.hash}`)}
              >
                <Icon
                  className={
                    router.asPath === `/tasks/${button.hash}` ? "" : "outlined"
                  }
                >
                  {button.icon}
                </Icon>
                {button.label}
              </Button>
            </Link>
          ))}

        <Divider
          sx={{
            my: 1,
            width: { sm: "90%" },
            mx: "auto",
            opacity: 0.5,
          }}
        />
        {[
          { href: "/tasks/upcoming", icon: "east", label: "Upcoming" },
          { href: "/tasks/color-coded", icon: "palette", label: "Color coded" },
          { href: "/tasks/backlog", icon: "west", label: "Backlog" },
        ].map((link, index) => (
          <Link key={index} href={link.href} style={{ cursor: "default" }}>
            <Button size="large" sx={styles(router.asPath === link.href)}>
              <Icon className={router.asPath === link.href ? "" : "outlined"}>
                {link.icon}
              </Icon>
              {link.label}
            </Button>
          </Link>
        ))}
      </Box>

      {sharedBoards?.length > 0 && (
        <Divider
          sx={{
            mt: 1,
            mb: 2,
            width: { sm: "90%" },
            mx: "auto",
            opacity: 0.5,
          }}
        />
      )}
      {sharedBoards?.length > 0 && (
        <Typography sx={taskStyles(palette).subheading}>Shared</Typography>
      )}
      {sharedBoards?.map((board) => (
        <Tab
          setDrawerOpen={setOpen}
          key={board.id}
          styles={styles}
          board={board}
        />
      ))}
      <Divider
        sx={{
          mt: 1,
          mb: 2,
          width: { sm: "90%" },
          mx: "auto",
          opacity: 0.5,
        }}
      />
      <Typography sx={taskStyles(palette).subheading}>Boards</Typography>
      {data &&
        data
          .filter((x) => !x.archived)
          .filter((x) => x.propertyId == session.property.propertyId)
          .map((board) => (
            <Tab
              setDrawerOpen={setOpen}
              key={board.id}
              styles={styles}
              board={board}
            />
          ))}
      <Link
        href={
          Boolean(storage?.isReached) ||
          data?.filter((board) => !board.archived).length >= 7 ||
          session.permission === "read-only"
            ? "/tasks"
            : "/tasks/boards/create"
        }
        style={{ width: "100%" }}
      >
        <Button
          fullWidth
          disabled={
            Boolean(storage?.isReached) ||
            data?.filter((board) => !board.archived).length >= 7 ||
            session.permission === "read-only"
          }
          ref={ref}
          size="large"
          onClick={() => setOpen(false)}
          sx={{
            ...styles(router.asPath == "/tasks/boards/create"),
            px: 2,
            cursor: "default",
            ...((storage?.isReached === true ||
              (data &&
                data.filter((board) => !board.archived).length >= 7)) && {
              opacity: 0.5,
            }),
            justifyContent: "start",
          }}
        >
          <Icon
            className={router.asPath == "/tasks/create" ? "" : "outlined"}
            sx={{ ml: -0.5 }}
          >
            add_circle
          </Icon>
          New board
        </Button>
      </Link>
      <Box>
        {data && data.filter((x) => x.archived).length !== 0 && (
          <>
            <Divider
              sx={{
                mt: 1,
                mb: 2,
                width: { sm: "90%" },
                mx: "auto",
                opacity: 0.5,
              }}
            />
            <Typography sx={taskStyles(palette).subheading}>
              Archived
            </Typography>
          </>
        )}
        {data &&
          data
            .filter((x) => x.archived)
            .map((board) => (
              <Tab
                setDrawerOpen={setOpen}
                key={board.id}
                styles={styles}
                board={board}
              />
            ))}
      </Box>
    </>
  );

  const isBoard = router.asPath.includes("/tasks/boards/");

  return (
    <>
      {isMobile && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        >
          <Box
            sx={{
              display: "flex",
              px: "7px",
              alignItems: "center",
              position: "fixed",
              width: "calc(100vw - 20px)",
              height: 55,
              zIndex: 999,
              background: addHslAlpha(palette[2], 0.9),
              backdropFilter: "blur(10px)",
              top: "10px",
              borderRadius: 999,
              left: "10px",
            }}
          >
            <Button
              sx={{
                color: palette[8],
                px: 1,
                ...(!title.includes("•") && {
                  minWidth: 0,
                }),
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              size="large"
              onClick={() => {
                vibrate(50);
                setOpen(true);
              }}
            >
              <Icon>expand_all</Icon>
              <Box
                sx={{
                  overflow: "hidden",
                  maxWidth: "100%",
                  textOverflow: "ellipsis",
                  "& .MuiTypography-root": {
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    overflow: "hidden",
                  },
                  textAlign: "left",
                  minWidth: 0,
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>
                  {title.includes("•") ? title.split("•")[0] : ""}
                </Typography>
                {title.includes("•") && (
                  <Typography variant="body2" sx={{ mt: -0.5 }}>
                    {title.split("•")[1]}
                  </Typography>
                )}
              </Box>
            </Button>
            {!isBoard && <SearchTasks setOpen={setOpen} />}
            <IconButton
              sx={{
                color: palette[8],
                background: addHslAlpha(palette[3], 0.5),
                "&:active": {
                  transform: "scale(0.9)",
                },
                ...(isBoard && {
                  ml: "auto",
                }),
                transition: "all .2s",
              }}
              onClick={() => {
                document
                  .getElementById(isBoard ? "boardInfoTrigger" : "createTask")
                  ?.click();
              }}
            >
              <Icon className="outlined">{isBoard ? "more_horiz" : "add"}</Icon>
            </IconButton>
          </Box>
        </motion.div>
      )}
      {isMobile && <Box sx={{ height: "65px" }} />}
      <Box sx={{ display: "flex" }}>
        <SwipeableDrawer
          anchor="bottom"
          onClose={() => {
            setOpen(false);
            vibrate(50);
          }}
          open={open}
          PaperProps={{
            sx: {
              pb: 2,
              maxHeight: "90vh",
            },
          }}
          sx={{ zIndex: 999999999999 }}
        >
          <Puller />
          <Box sx={{ p: 1, pt: 0, mt: -2 }}>{menuChildren}</Box>
        </SwipeableDrawer>
        <Box
          sx={{
            width: { xs: "100%", md: 300 },
            flex: { xs: "100%", md: "0 0 250px" },
            ml: -1,
            p: 3,
            px: 2,
            background: addHslAlpha(palette[3], 0.5),
            display: { xs: "none", md: "flex" },
            minHeight: "100vh",
            height: { md: "100vh" },
            overflowY: { md: "scroll" },
            flexDirection: "column",
          }}
        >
          {menuChildren}
        </Box>
        <Box
          sx={{
            maxHeight: { md: "100vh" },
            minHeight: { md: "100vh" },
            height: { md: "100vh" },
            overflowY: { md: "auto" },
            flexGrow: 1,
          }}
          id="boardContainer"
        >
          {children}
        </Box>
      </Box>
    </>
  );
}
