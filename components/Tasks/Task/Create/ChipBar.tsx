import { Puller } from "@/components/Puller";
import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { vibrate } from "@/lib/client/vibration";
import {
  Box,
  Chip,
  Icon,
  ListItemButton,
  ListItemText,
  SwipeableDrawer,
  colors,
} from "@mui/material";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import React, {
  cloneElement,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

const MemoizedChip = memo(Chip);

export const TaskColorPicker = React.memo(function TaskColorPicker({
  children,
  color,
  setColor,
  titleRef,
}: any) {
  const [open, setOpen] = useState(false);
  const trigger = cloneElement(children, {
    onClick: () => setOpen(true),
  });
  return (
    <>
      {trigger}
      <SwipeableDrawer
        open={open}
        onClose={() => {
          setOpen(false);
          titleRef?.current?.focus();
        }}
        anchor="bottom"
      >
        <Puller showOnDesktop />
        <Box sx={{ p: 2, pt: 0 }}>
          {[
            "grey",
            "pink",
            "purple",
            "indigo",
            "blue",
            "cyan",
            "teal",
            "green",
            "yellow",
            "orange",
            "brown",
          ].map((colorChoice) => (
            <ListItemButton
              key={colorChoice}
              selected={color === colorChoice}
              onClick={() => {
                setColor(colorChoice);
                setOpen(false);
              }}
            >
              <Box
                sx={{
                  background: colors[colorChoice][500],
                  width: 15,
                  height: 15,
                  borderRadius: 999,
                }}
              />
              <ListItemText
                primary={capitalizeFirstLetter(
                  colorChoice.replace("grey", "gray")
                )}
              />
              {color === colorChoice && <Icon sx={{ ml: "auto" }}>check</Icon>}
            </ListItemButton>
          ))}
        </Box>
      </SwipeableDrawer>
    </>
  );
});

const ChipBar = React.memo(function ChipBar({
  isSubTask,
  locationRef,
  showedFields,
  setShowedFields,
  data,
  setData,
  chipStyles,
  titleRef,
}: any) {
  const generateChipLabel = useCallback(
    (inputString) => {
      const regex = /(?:at|from|during)\s(\d+)/i;
      const match = inputString.match(regex);

      if (match) {
        const time = match[1];
        const amPm = inputString.toLowerCase().includes("am") ? "am" : "pm";

        if (Number(time) > 12) return null;

        return (
          <motion.div
            style={{ display: "inline-block" }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <MemoizedChip
              label={`${time} ${amPm}`}
              icon={<Icon>access_time</Icon>}
              onClick={() =>
                setData((d) => ({
                  ...d,
                  date: dayjs(data.date).hour(
                    Number(time) + (amPm === "pm" && time !== "12" ? 12 : 0)
                  ),
                }))
              }
              sx={chipStyles(
                dayjs(data.date).hour() ===
                  Number(time) + (amPm === "pm" && time !== "12" ? 12 : 0)
              )}
            />
          </motion.div>
        );
      }

      return null;
    },
    [chipStyles, data.date, setData]
  );

  const [chipComponent, setChipComponent] = useState<any>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const chip = generateChipLabel(data.title);
      setChipComponent(chip);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [data.title, generateChipLabel]);

  const setTaskColor = useCallback(
    (e) => {
      setData((d) => ({ ...d, color: e }));
    },
    [setData]
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          delay: 1,
          duration: 2,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <Box
          sx={{
            mb: 2,
            pl: { xs: 1, sm: 0 },
            overflowX: "scroll",
            overflowY: "visible",
            whiteSpace: "nowrap",
            display: "flex",
          }}
          onClick={() => titleRef?.current?.focus()}
        >
          {chipComponent}
          {!showedFields.location &&
            [
              "meet",
              "visit",
              "watch",
              "go to",
              "drive ",
              "fly ",
              "attend ",
            ].some((word) => data.title.toLowerCase().includes(word)) && (
              <motion.div
                style={{ display: "inline-block" }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <MemoizedChip
                  label="Add location?"
                  icon={<Icon>location_on</Icon>}
                  onClick={() => {
                    setShowedFields((s) => ({ ...s, location: !s.location }));
                    setTimeout(() => locationRef.current?.focus(), 50);
                  }}
                  sx={chipStyles(showedFields.location)}
                />
              </motion.div>
            )}
          <TaskColorPicker
            color={data.color}
            setColor={setTaskColor}
            titleRef={titleRef}
          >
            <MemoizedChip
              icon={<Icon sx={{ pl: 2 }}>label</Icon>}
              onClick={() => {
                setShowedFields((s) => ({ ...s, location: !s.location }));
                titleRef?.current?.blur();
              }}
              sx={{
                pr: "0!important",
                ...chipStyles(false),
                ...(data.color !== "grey" && {
                  background: colors[data.color]["A400"] + "!important",
                  borderColor: colors[data.color]["A400"] + "!important",
                  "& *": {
                    color: "#000 !important",
                  },
                }),
              }}
            />
          </TaskColorPicker>
          {!isSubTask &&
            [
              { label: "Today", days: 0 },
              { label: "Tomorrow", days: 1 },
              { label: "Next week", days: 7 },
            ].map(({ label, days }) => {
              const isActive =
                data.date &&
                dayjs(data.date.toISOString()).startOf("day").toISOString() ==
                  dayjs().startOf("day").add(days, "day").toISOString();

              return (
                <MemoizedChip
                  key={label}
                  label={label}
                  sx={chipStyles(isActive)}
                  icon={<Icon>today</Icon>}
                  onClick={() => {
                    vibrate(50);
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + days);
                    tomorrow.setHours(0);
                    tomorrow.setMinutes(0);
                    tomorrow.setSeconds(0);
                    setData((d) => ({ ...d, date: tomorrow }));
                  }}
                />
              );
            })}
        </Box>
      </motion.div>
    </div>
  );
});

export default ChipBar;
