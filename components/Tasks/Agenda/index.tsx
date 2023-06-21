import { addHslAlpha } from "@/lib/client/addHslAlpha";
import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { useApi } from "@/lib/client/useApi";
import { useColor } from "@/lib/client/useColor";
import { useSession } from "@/lib/client/useSession";
import { vibrate } from "@/lib/client/vibration";
import {
  Box,
  Button,
  Icon,
  IconButton,
  useMediaQuery,
  useScrollTrigger,
} from "@mui/material";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import Head from "next/head";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Column } from "./Column";

export function Agenda({
  setDrawerOpen,
  view,
}: {
  setDrawerOpen: any;
  view: "day" | "week" | "month" | "year";
}) {
  const [navigation, setNavigation] = useState(
    window.location.hash ? parseInt(window.location.hash.replace("#", "")) : 0
  );

  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      if (hash) setNavigation(parseInt(hash));
    }
  }, []);

  useEffect(() => {
    window.location.hash = `#${navigation}`;
  }, [navigation]);

  useHotkeys("alt+n", (e) => {
    e.preventDefault();
    setNavigation((n) => n + 1);
  });
  useHotkeys("alt+p", (e) => {
    e.preventDefault();
    setNavigation((n) => n - 1);
  });
  useHotkeys("alt+t", (e) => {
    e.preventDefault();
    setNavigation(0);
  });
  const trigger1 = useScrollTrigger({
    threshold: 0,
    target: window ? window : undefined,
  });

  const trigger = useDeferredValue(trigger1);

  const isMobile = useMediaQuery("(max-width: 600px)");

  const e = useMemo(() => {
    if (view === "week" || view === "day") return "day";
    if (view === "month") return "month";
    return "year";
  }, [view]);

  const startOfWeek = useMemo(() => {
    const modifier = isMobile ? e : view;
    return dayjs().add(navigation, modifier).startOf(modifier);
  }, [navigation, e, isMobile, view]);

  const endOfWeek = useMemo(() => {
    const modifier = isMobile ? e : view;
    let endOfWeek = dayjs().add(navigation, modifier).endOf(modifier);

    switch (view) {
      case "month":
        endOfWeek = endOfWeek.add(isMobile ? 0 : 2, "month");
        break;
      case "year":
        endOfWeek = endOfWeek.add(isMobile ? 0 : 3, "year");
        break;
    }

    return endOfWeek;
  }, [navigation, e, isMobile, view]);

  const days: any = [];

  for (let i = 0; i <= endOfWeek.diff(startOfWeek, e); i++) {
    const currentDay = startOfWeek.add(i, e);
    const heading =
      view === "week" || view === "day"
        ? "dddd"
        : view === "month"
        ? "MMMM"
        : "YYYY";

    days.push({
      unchanged: currentDay,
      heading,
      date: currentDay.format(heading),
      day: currentDay.format("dddd"),
    });
  }

  const handlePrev = useCallback(() => {
    setNavigation(navigation - 1);
    document.getElementById("agendaContainer")?.scrollTo(0, 0);
  }, [navigation]);

  const handleNext = useCallback(() => {
    setNavigation(navigation + 1);
    document.getElementById("agendaContainer")?.scrollTo(0, 0);
  }, [navigation]);

  const handleToday = useCallback(() => {
    setNavigation(0);
    setTimeout(() => {
      const activeHighlight = document.getElementById("activeHighlight");
      if (activeHighlight)
        activeHighlight.scrollIntoView({
          block: "nearest",
          inline: "center",
        });
      window.scrollTo(0, 0);
    }, 1);
  }, []);

  const { data, loading, url } = useApi("property/tasks/agenda", {
    startTime: startOfWeek.toISOString(),
    endTime: endOfWeek.toISOString(),
  });

  const [alreadyScrolled, setAlreadyScrolled] = useState(false);

  useEffect(() => {
    if (navigation === 0 && data && !alreadyScrolled) {
      setTimeout(() => {
        setAlreadyScrolled(true);
        const activeHighlight = document.getElementById("activeHighlight");
        if (activeHighlight)
          activeHighlight.scrollIntoView({
            block: "nearest",
            inline: "center",
          });
        window.scrollTo(0, 0);
      }, 1);
    }
  }, [data, navigation, alreadyScrolled]);

  const session = useSession();
  const handleOpen = () => {
    vibrate(50);
    setDrawerOpen(true);
  };
  const palette = useColor(session.themeColor, session.user.darkMode);

  return (
    <>
      <Head>
        <title>
          {capitalizeFirstLetter(view == "week" ? "day" : view)} &bull; Agenda
        </title>
      </Head>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.4 }}
      >
        <Box
          sx={{
            position: "fixed",
            bottom: {
              xs: "70px",
              md: "30px",
            },
            opacity: trigger ? 0 : 1,
            transform: trigger
              ? "translateY(20px) scale(0.9)"
              : "translateY(0px) scale(1)",
            mr: {
              xs: 1.5,
              md: 3,
            },
            zIndex: 9,
            background: addHslAlpha(palette[3], 0.5),
            border: "1px solid",
            transition: "transform .2s, opacity .2s",
            backdropFilter: "blur(10px)",
            borderRadius: 999,
            borderColor: addHslAlpha(palette[3], 0.5),
            right: "0",
            color: session.user.darkMode ? "#fff" : "#000",
            display: "flex",
            alignItems: "center",
            p: 0.5,
          }}
        >
          <IconButton
            onClick={handlePrev}
            disabled={navigation === 0 && view === "month"}
            sx={{ color: palette[9] }}
          >
            <Icon>west</Icon>
          </IconButton>
          <motion.div
            animate={{
              opacity: navigation === 0 ? 0 : 1,
              width: navigation === 0 ? 0 : "auto",
            }}
          >
            <Button
              onClick={handleToday}
              disableRipple
              sx={{
                "&:active": {
                  background: `${
                    session.user.darkMode
                      ? "hsla(240,11%,25%, 0.3)"
                      : "rgba(0,0,0,0.1)"
                  }`,
                },
                color: palette[9],
                px: 1,
                minWidth: "unset",
              }}
              color="inherit"
            >
              Today
            </Button>
          </motion.div>
          <IconButton onClick={handleNext} sx={{ color: palette[9] }}>
            <Icon>east</Icon>
          </IconButton>
        </Box>
      </motion.div>

      <Box
        id="agendaContainer"
        sx={{
          scrollSnapType: { xs: "x mandatory", sm: "unset" },
          display: "flex",
          maxWidth: "100vw",
          overflowX: "scroll",
          height: { md: "100vh" },
          ...(loading && { pointerEvents: "none", filter: "blur(10px)" }),
        }}
      >
        {days.map((day) => (
          <Column
            navigation={navigation}
            key={day.day}
            day={day}
            view={view}
            data={data}
            mutationUrl={url}
          />
        ))}
      </Box>
    </>
  );
}