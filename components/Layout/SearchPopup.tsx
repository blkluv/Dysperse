import React from "react";
import { Command } from "cmdk";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import * as colors from "@mui/material/colors";
import useSWR from "swr";
import { Puller } from "../Puller";
import { updateSettings } from "../Settings/updateSettings";
import ReactDOMServer from "react-dom/server";

export function SearchPopup() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [pages, setPages] = React.useState<string[]>(["home"]);
  const activePage = pages[pages.length - 1];
  const isHome = activePage === "home";

  React.useEffect(() => {
    const down = (e) => {
      if (
        (e.key === "k" && e.ctrlKey) ||
        (e.key === "k" && e.metaKey) ||
        (e.key === "f" && e.ctrlKey) ||
        (e.key === "f" && e.metaKey) ||
        (e.key === "/" && e.metaKey) ||
        (e.key === "/" && e.ctrlKey)
      ) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const popPage = React.useCallback(() => {
    setPages((pages) => {
      const x = [...pages];
      x.splice(-1, 1);
      return x;
    });
  }, []);

  const onKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (isHome || inputValue.length) {
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        popPage();
      }
    },
    [inputValue.length, isHome, popPage]
  );

  function bounce() {
    if (ref.current) {
      ref.current.style.transform = "scale(0.96)";
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.transform = "";
          setInputValue("");
        }
      }, 100);
    }
  }

  return (
    <Box
      sx={{
        ...(global.theme === "dark" && {
          "& *": {
            color: "#fff!important",
          },
        }),
      }}
    >
      <Tooltip title="Jump to">
        <IconButton
          onClick={() => {
            setOpen(true);
          }}
          color="inherit"
          disableRipple
          sx={{
            borderRadius: 3,
            mr: 1,
            transition: "none",
            color: global.theme === "dark" ? "hsl(240, 11%, 90%)" : "#606060",
            "&:hover": {
              background: "rgba(200,200,200,.3)",
              color: global.theme === "dark" ? "hsl(240, 11%, 95%)" : "#000",
            },
            "&:focus-within": {
              background:
                (global.theme === "dark"
                  ? colors[themeColor]["900"]
                  : colors[themeColor]["50"]) + "!important",
              color: global.theme === "dark" ? "hsl(240, 11%, 95%)" : "#000",
            },
          }}
        >
          <span className="material-symbols-outlined">search</span>
        </IconButton>
      </Tooltip>
      <SwipeableDrawer
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onOpen={() => {}}
        disableSwipeToOpen
        anchor="bottom"
        PaperProps={{
          elevation: 0,
          sx: {
            background: colors[themeColor][50],
            width: {
              sm: "50vw",
            },
            maxWidth: "650px",
            maxHeight: "95vh",
            borderRadius: "30px 30px 0 0",
            mx: "auto",
            ...(global.theme === "dark" && {
              background: "hsl(240, 11%, 25%)",
            }),
          },
        }}
      >
        <Puller />
        <div className="vercel">
          <Command
            ref={ref}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") {
                bounce();
              }

              if (isHome || inputValue.length) {
                return;
              }

              if (e.key === "Backspace") {
                e.preventDefault();
                popPage();
                bounce();
              }
            }}
          >
            <div>
              {pages.map((p) => (
                <div key={p} cmdk-vercel-badge="">
                  {p}
                </div>
              ))}
            </div>
            <Command.Input
              autoFocus
              placeholder="What do you need?"
              value={inputValue}
              onValueChange={(value) => {
                setInputValue(value);
              }}
            />
            <Command.List>
              <Command.Empty
                style={{
                  height: "auto",
                }}
              >
                <Box
                  sx={{
                    p: 0,
                    background: "rgba(0,0,0,0.1)",
                    width: "100%",
                    borderRadius: 4,
                    my: 3,
                    textAlign: "center",
                  }}
                >
                  <picture>
                    <img
                      src="https://ouch-cdn2.icons8.com/fHRe88-d9LBnpryw16-EHoo5JpQnusQ3FKQS6pZ2MXQ/rs:fit:256:256/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvMzUv/NTliOGVkOGItMjFj/YS00YmFjLWI4YjIt/MDE2YTg3NDk4ODYy/LnN2Zw.png"
                      alt="No results found"
                    />
                  </picture>
                  <Typography variant="h6" sx={{ mt: -5, mb: 4 }}>
                    No results found.
                  </Typography>
                </Box>
              </Command.Empty>
              {activePage === "home" && (
                <Home
                  searchSettings={() => {
                    setPages([...pages, "Settings"]);
                    setInputValue("");
                  }}
                />
              )}
              {activePage === "Settings" && <Settings />}
            </Command.List>
          </Command>
        </div>
      </SwipeableDrawer>
    </Box>
  );
}

function Icon({ icon }: { icon: string }) {
  return (
    <span className="material-symbols-outlined" style={{ marginRight: "5px" }}>
      {icon}
    </span>
  );
}

function Home({ searchSettings }: { searchSettings: Function }) {
  const { error, data } = useSWR("/api/rooms", () =>
    fetch(
      "/api/property/rooms?" +
        new URLSearchParams({
          propertyId: global.property.propertyId,
          accessToken: global.property.accessToken,
        })
    ).then((res) => res.json())
  );

  return (
    <>
      <LinearProgress
        variant={data ? "determinate" : "indeterminate"}
        sx={{
          mb: 2,
          mt: 0,
          height: 2,
          position: "sticky",
          top: 0,
          zIndex: 9999,
          borderRadius: 5,
          ...(data && {
            opacity: 0.3,
            backdropFilter: "blur(10px)",
          }),
        }}
      />{" "}
      <Item
        shortcut="CTRL ,"
        onSelect={() => {
          searchSettings();
        }}
      >
        Search Settings...
        <SettingsIcon />
      </Item>
      <Item
        shortcut="CTRL ,"
        onSelect={() => {
          global.setTheme("light");
          updateSettings("darkMode", "false");
        }}
      >
        Light mode
        <Icon icon="light_mode" />
      </Item>
      <Item
        shortcut="CTRL ,"
        onSelect={() => {
          global.setTheme("dark");
          updateSettings("darkMode", "true");
        }}
      >
        Dark mode
        <Icon icon="dark_mode" />
      </Item>
      <Item onSelect={() => {}}>
        Dashboard
        <Icon icon="layers" />
      </Item>
      <Item onSelect={() => {}}>
        Notes
        <Icon icon="sticky_note_2" />
      </Item>
      <Item onSelect={() => {}}>
        Sustainability
        <Icon icon="eco" />
      </Item>
      <Command.Group heading="Rooms">
        {[
          { name: "Kitchen", icon: "oven_gen" },
          { name: "Bedroom", icon: "bedroom_parent" },
          { name: "Bathroom", icon: "bathroom" },
          { name: "Garage", icon: "garage" },
          { name: "Dining room", icon: "local_dining" },
          { name: "Living room", icon: "living" },
          { name: "Laundry room", icon: "local_laundry_service" },
          { name: "Storage room", icon: "inventory_2" },
          { name: "Garden", icon: "yard" },
        ].map((room, index) => (
          <Item onSelect={() => {}} key={index.toString()}>
            {room.name}
            <Icon icon={room.icon} />
          </Item>
        ))}
        {data && (
          <Box>
            {data.map((room, index) => (
              <Item key={index}>
                {room.name}
                <Icon icon="label" />
              </Item>
            ))}
          </Box>
        )}
        <Item onSelect={() => {}}>
          Starred items
          <Icon icon="star" />
        </Item>
        <Item onSelect={() => {}}>
          Trash
          <Icon icon="delete" />
        </Item>
        <Item onSelect={() => {}}>
          Create room
          <Icon icon="add" />
        </Item>
      </Command.Group>
      <Command.Group heading="Help">
        <Item>
          Support
          <Icon icon="help" />
        </Item>
      </Command.Group>
    </>
  );
}

function Settings() {
  return (
    <>
      {[
        "Appearance",
        "Two-factor auth",
        "Finances",
        "Account",
        "Sign out",
        "Legal",
      ].map((room, index) => (
        <Item key={index.toString()}>{room}</Item>
      ))}
    </>
  );
}

function Item({
  children,
  shortcut,
  onSelect = () => {},
}: {
  children: React.ReactNode;
  shortcut?: string;
  onSelect?: (value: string) => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      value={ReactDOMServer.renderToStaticMarkup(children)}
    >
      {children}
      {shortcut && (
        <div cmdk-vercel-shortcuts="">
          {shortcut.split(" ").map((key) => {
            return <kbd key={key}>{key}</kbd>;
          })}
        </div>
      )}
    </Command.Item>
  );
}

function SettingsIcon() {
  return (
    <span className="material-symbols-outlined" style={{ marginRight: "5px" }}>
      settings
    </span>
  );
}

function PlusIcon() {
  return (
    <svg
      fill="none"
      height="24"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M12 5v14"></path>
      <path d="M5 12h14"></path>
    </svg>
  );
}

function TeamsIcon() {
  return (
    <svg
      fill="none"
      height="24"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
      <path d="M16 3.13a4 4 0 010 7.75"></path>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      fill="none"
      height="24"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"></path>
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg
      fill="none"
      height="24"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
      <path d="M14 2v6h6"></path>
      <path d="M16 13H8"></path>
      <path d="M16 17H8"></path>
      <path d="M10 9H8"></path>
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg
      fill="none"
      height="24"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg
      fill="none"
      height="24"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <path d="M22 6l-10 7L2 6"></path>
    </svg>
  );
}
