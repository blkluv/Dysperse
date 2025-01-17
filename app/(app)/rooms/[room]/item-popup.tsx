"use client";

import { ProfilePicture } from "@/app/(app)/users/[id]/ProfilePicture";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { ErrorHandler } from "@/components/Error";
import { Puller } from "@/components/Puller";
import { useSession } from "@/lib/client/session";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Icon,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemButton,
  ListItemText,
  SwipeableDrawer,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { cloneElement, useEffect, useState } from "react";
import useSWR from "swr";

function MoveItem({ children, item, mutate, setParentOpen }) {
  const { session } = useSession();
  const palette = useColor(session.user.color, useDarkMode(session.darkMode));

  const [open, setOpen] = useState(false);
  const trigger = cloneElement(children, { onClick: () => setOpen(true) });

  const {
    data,
    mutate: mutateRooms,
    error,
  } = useSWR(open ? ["space/inventory/rooms"] : null);

  const handleMove = async (roomId) => {
    await fetchRawApi(session, "space/inventory/items/move", {
      params: {
        id: item.id,
        updatedAt: dayjs().toISOString(),
        room: roomId,
      },
    });
    const newData = {
      ...item,
      room: { id: roomId },
      updatedAt: dayjs().toISOString(),
    };
    mutate("deleted", {
      populateCache: "deleted",
      revalidate: false,
    });

    setOpen(false);
    setTimeout(() => setParentOpen(false), 400);
  };

  return (
    <>
      {trigger}
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        variant="outlined"
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "500px" },
          },
        }}
      >
        <Puller showOnDesktop />
        <Box sx={{ p: 3, pt: 0 }}>
          <Typography variant="h3" className="font-heading">
            Move item
          </Typography>
          <Typography variant="h6">Select a room</Typography>
          <Box sx={{ mt: 1 }}>
            {!data && !error && <CircularProgress />}
            {error && (
              <ErrorHandler
                error={"Something went wrong. Please try again later"}
                callback={mutateRooms}
              />
            )}
            {data && data.length === 0 && (
              <Alert severity="info">No rooms</Alert>
            )}
            {data &&
              data.map((room) => (
                <ListItemButton
                  key={room.id}
                  onClick={() => handleMove(room.id)}
                  selected={item.room?.id === room.id}
                >
                  <img
                    src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${room.emoji}.png`}
                    alt="Emoji"
                    width={30}
                    height={30}
                  />
                  <ListItemText primary={room.name} />
                  <Icon>{item.room?.id == room.id ? "check" : "east"}</Icon>
                </ListItemButton>
              ))}
          </Box>
        </Box>
      </SwipeableDrawer>
    </>
  );
}

function ItemDrawerContent({ item, mutate, setOpen }) {
  const router = useRouter();
  const { session } = useSession();
  const palette = useColor(session.user.color, useDarkMode(session.darkMode));
  const orangePalette = useColor("orange", useDarkMode(session.darkMode));

  const handleDelete = async () => {
    await fetchRawApi(session, "space/inventory/items/delete", {
      method: "DELETE",
      params: {
        id: item.id,
      },
    });
    mutate("deleted", {
      populateCache: "deleted",
      revalidate: false,
    });
    setOpen(false);
  };

  const handleEdit = async (key, value) => {
    const newData = {
      ...item,
      [key]: value,
      updatedAt: new Date().toISOString(),
    };

    mutate(newData, {
      populateCache: newData,
      revalidate: false,
    });

    return await fetchRawApi(session, "space/inventory/items/edit", {
      method: "PUT",
      params: {
        id: item.id,
        updatedAt: dayjs().toISOString(),
        [key]: String(value),
        createdBy: session.user.email,
      },
    });
  };

  const styles = {
    section: {
      background: { xs: palette[3], sm: palette[2] },
      borderRadius: 5,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      mb: 3,
      "& .item": {
        color: palette[12],
        borderRadius: 0,
        "&.MuiListItem-root, &.MuiListItemButton-root": {
          px: 3,
        },
      },
      "& .item:not(:last-child)": {
        borderBottom: "1px solid",
        borderColor: { xs: palette[4], sm: palette[3] },
      },
    },
    button: {
      color: palette[11],
      background: palette[3],
    },
  };

  const isMobile = useMediaQuery("(max-width: 600px)");
  return (
    <>
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
        position="sticky"
        sx={{ top: 0, border: 0, background: "transparent" }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton onClick={() => setOpen(false)} sx={styles.button}>
            <Icon className="outlined">close</Icon>
          </IconButton>
          <IconButton
            onClick={() => handleEdit("starred", !item.starred)}
            sx={{
              ...styles.button,
              ml: "auto",
              ...(item.starred && {
                background: orangePalette[3] + "!important",
                "&:hover": {
                  background: orangePalette[4] + "!important",
                },
                "&:active": {
                  background: orangePalette[5] + "!important",
                },
              }),
            }}
          >
            <Icon className={item.starred ? "" : "outlined"}>favorite</Icon>
          </IconButton>
          <IconButton onClick={() => setOpen(false)} sx={styles.button}>
            <Icon className="outlined">add_task</Icon>
          </IconButton>
          <MoveItem item={item} mutate={mutate} setParentOpen={setOpen}>
            <IconButton sx={styles.button}>
              <Icon className="outlined">move_down</Icon>
            </IconButton>
          </MoveItem>
          <ConfirmationModal
            callback={handleDelete}
            title="Delete item?"
            question="Heads up! You can't undo this action."
          >
            <IconButton sx={styles.button}>
              <Icon className="outlined">delete</Icon>
            </IconButton>
          </ConfirmationModal>
        </Toolbar>
      </AppBar>
      <Box sx={{ px: 3 }}>
        <TextField
          fullWidth
          placeholder="Item name"
          defaultValue={item.name}
          onBlur={(e) => handleEdit("name", e.target.value)}
          onKeyDown={(e: any) => e.key === "Enter" && e.target.blur()}
          variant="standard"
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
              textDecoration: "underline",
            },
          }}
        />
        <Box sx={styles.section}>
          {[
            {
              key: "note",
              multiline: true,
              icon: "sticky_note_2",
              name: "Note",
              type: "text",
            },
            {
              key: "condition",
              multiline: true,
              icon: "question_mark",
              name: "Condition",
              type: "text",
            },
            {
              key: "quantity",
              multiline: true,
              icon: "interests",
              name: "Quantity",
              type: "text",
            },
            {
              key: "estimatedValue",
              multiline: true,
              icon: "attach_money",
              name: "Estimated Value",
              type: "number",
            },
            {
              key: "serialNumber",
              multiline: true,
              icon: "tag",
              name: "Serial Number",
              type: "text",
            },
          ].map((field) => (
            <TextField
              onBlur={(e) => handleEdit(field.key, e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter" && !e.shiftKey) e.target.blur();
              }}
              onKeyUp={(e: any) => {
                if (field.type === "number") {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }
              }}
              className="item"
              key={field.key}
              type={field.type}
              multiline
              fullWidth
              defaultValue={item[field.key]}
              placeholder={`Add ${field.name.toLowerCase()}...`}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { py: 1.5, px: 3 },
                startAdornment: field.icon && (
                  <InputAdornment position="start">
                    <Icon className="outlined">{field.icon}</Icon>
                  </InputAdornment>
                ),
              }}
            />
          ))}
        </Box>
        <Box sx={styles.section}>
          <ListItem
            onClick={() =>
              router.push(
                `/users/${item.createdBy.username || item.createdBy.email}`
              )
            }
          >
            <ListItemText
              primary={`Edited ${dayjs(item.updatedAt).fromNow()}`}
              secondary={
                item.updatedAt !== item.createdAt &&
                `Created ${dayjs(item.createdAt).fromNow()}`
              }
            />
            <Box>
              {item.createdBy && (
                <ProfilePicture data={item.createdBy} size={30} />
              )}
            </Box>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`Found in "${item.room?.name}"`}
              secondary={
                item.room.private
                  ? "Only visible to you"
                  : `Visible to others in "${item.property.name}"`
              }
            />
          </ListItem>
        </Box>
        {/* {JSON.stringify(item, null, 2)} */}
      </Box>
    </>
  );
}

export function ItemPopup({
  children,
  item,
  mutateList,
}: {
  children: JSX.Element;
  item: any;
  mutateList: any;
}) {
  const { session } = useSession();
  const palette = useColor(session.user.color, useDarkMode(session.darkMode));

  const [open, setOpen] = useState(false);
  const trigger = cloneElement(children, { onClick: () => setOpen(true) });

  const isMobile = useMediaQuery("(max-width: 600px)");

  const { data, isLoading, mutate, error } = useSWR(
    open ? ["space/inventory/items", { id: item.id }] : null
  );

  useEffect(() => {
    if (data === "deleted") {
      setOpen(false);
      mutateList();
    }
  }, [data, mutateList]);

  return (
    <>
      {trigger}
      <SwipeableDrawer
        anchor={isMobile ? "bottom" : "right"}
        open={open}
        onClose={() => {
          setOpen(false);
          mutateList();
        }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "500px" },
            borderLeft: { sm: "2px solid " + palette[3] },
            ...(isMobile && {
              height: "calc(100dvh - 150px)",
              borderRadius: "20px 20px 0 0",
              background: palette[2],
            }),
          },
        }}
      >
        {data && data !== "deleted" && (
          <ItemDrawerContent item={data} mutate={mutate} setOpen={setOpen} />
        )}
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {error && <ErrorHandler callback={mutate} />}
      </SwipeableDrawer>
    </>
  );
}
