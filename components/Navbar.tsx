import { openSpotlight } from "@/components/Layout/Navigation/Search";
import { Logo } from "@/components/Logo";
import { useSession } from "@/lib/client/session";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { Box, Icon, IconButton, SxProps } from "@mui/material";
import { useRouter } from "next/router";

export function Navbar({
  showLogo = false,
  right,
  showRightContent = false,
  hideSettings = false,
  hideSearch = false,
  sx = {},
}: {
  showLogo?: boolean;
  right?: JSX.Element;
  showRightContent?: boolean;
  hideSettings?: boolean;
  hideSearch?: boolean;
  sx?: SxProps;
}) {
  const { session } = useSession();
  const palette = useColor(session.themeColor, useDarkMode(session.darkMode));
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        "& svg": {
          display: showLogo ? { sm: "none" } : "none",
        },
        ...sx,
      }}
    >
      <Logo />
      {right}
      {(!right || showRightContent) && (
        <>
          {!hideSearch && (
            <IconButton
              sx={{
                display: { sm: "none" },
                color: palette[9],
                ml: showRightContent && right ? "" : "auto",
              }}
              onClick={openSpotlight}
            >
              <Icon className="outlined" sx={{ fontSize: "28px!important" }}>
                &#xe8b6;
              </Icon>
            </IconButton>
          )}
          <IconButton
            onClick={() =>
              router.push(
                `/users/${session.user.username || session.user.email}`
              )
            }
            sx={{
              color: palette[9],
              ml: { sm: showRightContent && right ? "" : "auto" },
              fontSize: "15px",
              gap: 2,
              borderRadius: 99,
              "& .label": {
                display: { xs: "none", sm: "block" },
              },
            }}
          >
            <Icon className="outlined" sx={{ fontSize: "28px!important" }}>
              account_circle
            </Icon>
            <span className="label">My profile</span>
          </IconButton>
          {!hideSettings && (
            <IconButton
              sx={{ color: palette[9] }}
              onClick={() => router.push("/settings")}
            >
              <Icon className="outlined" sx={{ fontSize: "28px!important" }}>
                &#xe8b8;
              </Icon>
            </IconButton>
          )}
        </>
      )}
    </Box>
  );
}
