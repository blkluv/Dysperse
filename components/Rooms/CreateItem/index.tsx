import type { CustomRoom as Room } from "@prisma/client";
import React, { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useApi } from "../../../hooks/useApi";
import { neutralizeBack, revivalBack } from "../../../hooks/useBackButton";
import { useStatusBar } from "../../../hooks/useStatusBar";
import { colors } from "../../../lib/colors";
import { Puller } from "../../Puller";
import { CreateItemModal } from "./modal";

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CssBaseline,
  DialogTitle,
  Grid,
  Icon,
  List,
  Skeleton,
  SwipeableDrawer,
  Typography,
} from "@mui/material";

/**
 * Item popup option
 * @param alias Room alias to replace room title
 * @param toggleDrawer Function to toggle drawer
 * @param icon Icon to display in drawer
 * @param title Title to display in drawer
 * @returns JSX.Element
 */
function AddItemOption({
  alias,
  icon,
  title,
}: {
  alias?: string;
  icon: JSX.Element | string;
  title: JSX.Element | string;
}): JSX.Element {
  return (
    <Grid item xs={12} sm={4} spacing={2}>
      <CreateItemModal room={title}>
        <Card
          sx={{
            textAlign: {
              sm: "center",
            },
            boxShadow: 0,
            borderRadius: { xs: 1, sm: 4 },
            transition: "transform .2s, border-radius .2s",
            "&:active": {
              boxShadow: "none!important",
              transform: "scale(0.98)",
              transition: "none",
            },
          }}
        >
          <CardActionArea
            disableRipple
            sx={{
              "&:hover": {
                background: global.user.darkMode
                  ? "hsl(240,11%,15%)!important"
                  : `${colors[themeColor][100]}!important`,
              },
              borderRadius: 6,
              "&:focus-within": {
                background: global.user.darkMode
                  ? "hsl(240,11%,18%)!important"
                  : `${colors[themeColor][100]}!important`,
              },
              "&:active": {
                background: global.user.darkMode
                  ? "hsl(240,11%,25%)!important"
                  : `${colors[themeColor][100]}!important`,
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                gap: 2,
                py: 1,
                alignItems: "center",
              }}
            >
              <Typography variant="h4">{icon}</Typography>
              <Typography
                sx={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: "600",
                  overflow: "hidden",
                }}
              >
                {alias || title}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </CreateItemModal>
    </Grid>
  );
}
/**
 * More rooms collapsible
 * @returns JSX.Element
 */
function MoreRooms(): JSX.Element {
  const { error, data } = useApi("property/rooms");
  const [open, setOpen] = React.useState<boolean>(false);
  useStatusBar(open, 2);

  if (error) {
    return <>An error occured while trying to fetch your rooms. </>;
  }
  /**
   * Handle drawer toggle
   */
  const handleClickOpen = () => setOpen(true);

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        swipeAreaWidth={0}
        PaperProps={{
          sx: {
            width: {
              xs: "100vw",
              sm: "50vw",
            },
            maxHeight: "80vh",
            maxWidth: "700px",
            "& .MuiPaper-root": {
              background: "transparent!important",
            },
            "& *": { transition: "none!important" },
            borderRadius: "28px 28px 0 0 !important",
          },
        }}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        <Puller />
        <DialogTitle sx={{ textAlign: "center" }}>Other rooms</DialogTitle>
        <Box sx={{ height: "100%", overflow: "scroll" }}>
          {!data ? (
            <Grid container sx={{ p: 2 }}>
              {[...new Array(12)].map(() => (
                <Grid
                  item
                  xs={12}
                  sm={3}
                  sx={{ p: 2, py: 1 }}
                  key={Math.random().toString()}
                >
                  <div style={{ background: "#eee" }}>
                    <Skeleton
                      variant="rectangular"
                      height={69}
                      width={"100%"}
                      animation="wave"
                      sx={{ borderRadius: 5, background: "red!important" }}
                    />
                  </div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container sx={{ p: 2 }}>
              <AddItemOption
                title="Storage room"
                icon={<Icon className="outlined">inventory_2</Icon>}
              />
              <AddItemOption
                title="Camping"
                icon={<Icon className="outlined">camping</Icon>}
              />
              <AddItemOption
                title="Garden"
                icon={<Icon className="outlined">yard</Icon>}
              />
              {data.map((room: Room) => (
                <AddItemOption
                  title={room.id.toString()}
                  key={room.id.toString()}
                  alias={room.name}
                  icon={<Icon className="outlined">label</Icon>}
                />
              ))}
            </Grid>
          )}
        </Box>
      </SwipeableDrawer>
      <Grid item xs={12} sm={4}>
        <Card
          sx={{
            textAlign: {
              sm: "center",
            },
            boxShadow: 0,
            borderRadius: { xs: 1, sm: 6 },
            transition: "transform .2s",
            "&:active": {
              boxShadow: "none!important",
              transform: "scale(0.98)",
              transition: "none",
            },
          }}
          onClick={handleClickOpen}
        >
          <CardActionArea
            disableRipple
            sx={{
              px: {
                xs: 3,
                sm: 0,
              },
              "&:hover": {
                background: `${
                  colors[themeColor][global.user.darkMode ? 900 : 100]
                }!important`,
              },
              borderRadius: 6,
              "&:focus-within": {
                background: `${
                  colors[themeColor][global.user.darkMode ? 900 : 100]
                }!important`,
              },
              "&:active": {
                background: `${
                  colors[themeColor][global.user.darkMode ? 900 : 100]
                }!important`,
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                py: 1,
              }}
            >
              <Typography variant="h4">
                <Icon className="outlined">add_location_alt</Icon>
              </Typography>
              <Typography
                sx={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  fontWeight: "700",
                }}
              >
                More&nbsp;rooms
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </>
  );
}
/**
 *
 * @param toggleDrawer Function to toggle the drawer
 * @returns JSX.Element
 */
function Content(): JSX.Element {
  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      <Grid container sx={{ p: 1 }}>
        {global.property.profile.type !== "study group" &&
          global.property.profile.type !== "dorm" && (
            <AddItemOption
              title="Kitchen"
              icon={<Icon className="outlined">blender</Icon>}
            />
          )}
        {global.property.profile.type !== "study group" && (
          <>
            <AddItemOption
              title="Bedroom"
              icon={<Icon className="outlined">bedroom_parent</Icon>}
            />
            <AddItemOption
              title="Bathroom"
              icon={<Icon className="outlined">bathroom</Icon>}
            />

            <AddItemOption
              title="Storage"
              icon={<Icon className="outlined">inventory_2</Icon>}
            />
          </>
        )}
        {global.property.profile.type !== "study group" &&
          global.property.profile.type !== "dorm" && (
            <>
              <AddItemOption
                title="Garage"
                icon={<Icon className="outlined">garage</Icon>}
              />
              <AddItemOption
                title={<>Living&nbsp;room</>}
                icon={<Icon className="outlined">living</Icon>}
              />
              <AddItemOption
                title={<>Dining</>}
                icon={<Icon className="outlined">dining</Icon>}
              />
              <AddItemOption
                title={<>Laundry&nbsp;room</>}
                icon={<Icon className="outlined">local_laundry_service</Icon>}
              />
              <MoreRooms />
            </>
          )}
        {global.property.profile.type === "study group" && (
          <AddItemOption
            title="Backpack"
            icon={<Icon className="outlined">backpack</Icon>}
          />
        )}
      </Grid>
    </List>
  );
}

/**
 * Select room to create item popup
 * @param props
 * @returns JSX.Element
 */

export default function AddPopup({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);

  useHotkeys("ctrl+s", (e) => {
    e.preventDefault();
    document.getElementById("add_trigger")?.click();
  });

  useEffect(() => {
    open ? neutralizeBack(() => setOpen(false)) : revivalBack();
  });

  useStatusBar(open);

  /**
   * Toggles the drawer's open state
   * @param {boolean} newOpen
   * @returns {any}
   */
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  /**
   * handleAddItemDrawerOpen
   */
  const handleAddItemDrawerOpen = () => {
    if (global.property.role !== "read-only") {
      setOpen(true);
    }
  };

  return (
    <>
      <CssBaseline />
      <div aria-hidden id="add_trigger" onClick={handleAddItemDrawerOpen}>
        {children}
      </div>

      <SwipeableDrawer
        anchor="bottom"
        swipeAreaWidth={0}
        PaperProps={{
          sx: {
            width: {
              xs: "100vw",
              sm: "100%",
            },
            maxHeight: "80vh",
            maxWidth: "600px",
            "& *:not(.MuiTouchRipple-child, .puller)": {
              background: "transparent!important",
            },
            borderRadius: "28px 28px 0 0 !important",
          },
        }}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={toggleDrawer(true)}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Puller />
        <Box
          sx={{
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mx: "auto", textAlign: "center", fontWeight: "700" }}
          >
            Select a room
          </Typography>

          <Content />
        </Box>
      </SwipeableDrawer>
    </>
  );
}
