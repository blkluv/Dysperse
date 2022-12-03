import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { useRouter } from "next/router";
import React from "react";
import { colors } from "../../lib/colors";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import hexToRgba from "hex-to-rgba";

/**
 * Bottom navigation bar
 * @returns {any}
 */
export function BottomNav() {
  const trigger = useScrollTrigger({
    threshold: 0,
    target: window ? window : undefined,
  });

  const styles = (active) => {
    return {
      borderRadius: 3,
      textTransform: "none",
      height: "70px",
      // color: colors[themeColor][global.theme === "dark" ? 200 : 500],
      // icon
      "& .material-symbols-rounded, & .material-symbols-outlined": {
        height: "24px",
      },
      fontWeight: "200",
      ...(active && {
        fontWeight: "700",
        color:
          colors[themeColor][global.theme === "dark" ? 100 : 800] +
          "!important",
      }),
    };
  };

  const router = useRouter();
  const [value, setValue] = React.useState<number>(0);

  React.useEffect(() => {
    const url = router.asPath;

    switch (url) {
      case "":
      case "/":
      case "/tasks":
        setValue(0);
        break;
      case "/trash":
      case "/items":
        setValue(1);
        break;
      case "/coach":
        setValue(2);
        break;
      case "/insights":
        setValue(3);
        break;
      default:
        if (router.asPath.includes("/rooms")) {
          setValue(1);
        } else {
          setValue(0);
        }
    }
  }, [router.asPath]);
  /**
   * Handles button click
   * @param {any} href
   * @returns {any}
   */
  const onLink = (href: string) => {
    router.push(href);
  };
  const matches = useMediaQuery("(max-height: 400px)");

  return (
    <>
      <Snackbar
        open={window && window.navigator.onLine === false}
        autoHideDuration={6000}
        onClose={() => null}
        sx={{ mb: trigger ? 6.5 : 9, transition: "all .3s" }}
        message="You're offline. Please check your network connection."
      />
      <Box
        sx={{
          width: "100%",
          position: "fixed",
          bottom: matches ? -100.1 : trigger ? -71 : 0,
          left: 0,
          transition: "bottom .3s",
          display: {
            xs: "block",
            md: "none",
          },
          zIndex: 999,
          height: "70px",
          background:
            global.theme === "dark"
              ? "rgba(43, 43, 48, .9)"
              : hexToRgba(colors["grey"][200], 0.9),
          borderTop: "1px solid rgba(200,200,200,.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Tabs
          TabIndicatorProps={{
            children: <span className="MuiTabs-indicatorSpan" />,
          }}
          variant="fullWidth"
          value={value}
          onChange={(event, newValue) => {
            // alert(newValue);
          }}
          aria-label="basic tabs example"
          sx={{
            height: "100%",
            "& .MuiTabs-indicator": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              height: "100%",
            },
            "& .MuiTabs-indicatorSpan": {
              minWidth: "65px",
              width: "50%",
              height: 34,
              mt: -2.855,
              backgroundColor:
                global.theme === "dark"
                  ? "rgba(153, 153, 158, .1)"
                  : hexToRgba(colors[themeColor][500], 0.1),
              borderRadius: 99,
            },
          }}
        >
          <Tab
            disableRipple
            sx={styles(
              router.asPath == "/tasks" ||
                router.asPath == "/" ||
                router.asPath == ""
            )}
            icon={
              <span
                className={`material-symbols-${
                  router.asPath == "/tasks" ? "rounded" : "outlined"
                }`}
                style={{
                  transition: "all .2s!important",
                }}
              >
                verified
              </span>
            }
            label="Lists"
            onClick={() => router.push("/tasks").then(() => setValue(0))}
          />
          <Tab
            disableRipple
            sx={styles(
              router.asPath == "/items" || router.asPath.includes("rooms")
            )}
            icon={
              <span
                className={`material-symbols-${
                  router.asPath == "/items" || router.asPath.includes("rooms")
                    ? "rounded"
                    : "outlined"
                }`}
                style={{
                  transition: "all .2s!important",
                }}
              >
                category
              </span>
            }
            label="Items"
            onClick={() => router.push("/items").then(() => setValue(1))}
          />
          <Tab
            disableRipple
            onDoubleClick={() => {
              router.push("/coach").then(() => {
                setTimeout(() => {
                  document.getElementById("routineTrigger")?.click();
                }, 500);
              });
            }}
            sx={styles(router.asPath == "/coach")}
            icon={
              <span
                className={`material-symbols-${
                  router.asPath == "/coach" ? "rounded" : "outlined"
                }`}
                style={{
                  transition: "all .2s!important",
                }}
              >
                routine
              </span>
            }
            label="Coach"
            onClick={() => router.push("/coach").then(() => setValue(2))}
          />
          <Tab
            disableRipple
            sx={styles(router.asPath == "/insights")}
            icon={
              <span
                className={`material-symbols-${
                  router.asPath == "/insights" ? "rounded" : "outlined"
                }`}
                style={{
                  transition: "all .2s!important",
                }}
              >
                leaderboard
              </span>
            }
            label="Insights"
            onClick={() => router.push("/insights").then(() => setValue(3))}
          />
        </Tabs>
      </Box>
    </>
  );
}
