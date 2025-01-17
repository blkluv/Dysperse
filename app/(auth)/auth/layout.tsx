import { useColor } from "@/lib/client/useColor";
import { Box, CssBaseline } from "@mui/material";
import { Toaster } from "react-hot-toast";
import "../../(app)/global.scss";
import { AuthBranding } from "./branding";
import { AuthClientLayout } from "./client-layout";

/**
 * Layout for the app, including navbar, sidenav, etc
 * @param children Children
 * @returns JSX.Element
 */
export default function Layout({ children }): JSX.Element {
  const palette = useColor("violet", true);

  return (
    <html lang="en">
      <head>
        <title>Login</title>
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {[57, 72, 76, 114, 120, 144, 152, 180].map((size) => (
          <link
            key={size}
            rel="apple-touch-icon"
            sizes={`${size}x${size}`}
            href={`https://assets.dysperse.com/v9-ios/${size}.png`}
          />
        ))}
        <link
          rel="shortcut icon"
          href="https://assets.dysperse.com/v9/android/android-launchericon-48-48.png"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Box
          sx={{
            background: palette[1],
            position: "fixed",
            top: 0,
            left: 0,
            overflow: "scroll",
            width: "100%",
            maxWidth: "100dvw",
            height: { xs: "100%", sm: "100dvh" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Toaster />
          <AuthBranding />
          <CssBaseline />
          <AuthClientLayout>{children}</AuthClientLayout>
        </Box>
      </body>
    </html>
  );
}
