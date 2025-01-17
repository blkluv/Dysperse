import { base64ToUint8Array } from "@/app/(app)/settings/notifications/base64ToUint8Array";
import { useSession } from "@/lib/client/session";
import { updateSettings } from "@/lib/client/updateSettings";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { LoadingButton } from "@mui/lab";
import { Avatar, Box, Button, Dialog, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Logo } from "../Logo";

export const useNotificationSubscription = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState<any>(null);

  useEffect(() => {
    const subscribeToNotifications = async () => {
      if (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        (window as any).workbox !== undefined
      ) {
        // run only in the browser
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub: any = await reg.pushManager.getSubscription();

          if (
            sub &&
            !(
              (sub as any).expirationTime &&
              Date.now() > (sub as any).expirationTime - 5 * 60 * 1000
            )
          ) {
            setSubscription(sub);
            setIsSubscribed(true);
          }

          setRegistration(reg);
        } catch (error) {
          console.error("Error subscribing to notifications:", error);
        }
      }
    };

    subscribeToNotifications();
  }, []);

  return {
    subscription,
    isSubscribed,
    registration,
    setSubscription,
    setRegistration,
    setIsSubscribed,
  };
};

export default function NotificationsPrompt() {
  const { session, setSession } = useSession();
  const palette = useColor(session.themeColor, useDarkMode(session.darkMode));

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { subscription, isSubscribed, registration } =
    useNotificationSubscription();

  const handleClose = () => {
    localStorage.setItem("notificationPrompt", "true");
    setOpen(false);
  };

  useEffect(() => {
    if (!isSubscribed && !localStorage.getItem("notificationPrompt")) {
      setOpen(true);
    }
  }, [isSubscribed]);

  const subscribeButtonOnClick = async (event) => {
    try {
      event.preventDefault();
      setLoading(true);
      await Notification.requestPermission();
      localStorage.setItem("notificationPrompt", "true");
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(
          process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
        ),
      });
      await updateSettings(["notificationSubscription", JSON.stringify(sub)], {
        session,
        setSession,
      });
      await fetchRawApi(session, "/user/settings/notifications/test", {
        params: {
          subscription: session.user.notificationSubscription,
        },
      });
      setLoading(false);
      setOpen(false);
    } catch (e) {
      event.preventDefault();
      toast.error("Couldn't turn on notifications. Try again later");
      setOpen(false);
    }
  };

  return (
    <>
      <Dialog
        open={subscription && open}
        onClose={() => {}}
        PaperProps={{
          sx: {
            width: "500px",
            maxWidth: "calc(100dvw - 30px)",
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", sm: "flex-start" },
            textAlign: { xs: "center", sm: "left" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
          }}
        >
          <Avatar sx={{ width: 90, height: 90, background: palette[3] }}>
            <Logo size={80} intensity={7} />
          </Avatar>
          <Box>
            <Typography variant="h3" className="font-heading">
              Turn on notifications?
            </Typography>
            <Typography sx={{ opacity: 0.6 }}>
              Enable to recieve reminders for your tasks &amp; more. This will
              turn off Dysperse notifications on your other devices.
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-start" },
                gap: 1.5,
                mt: 1,
              }}
            >
              <Button onClick={handleClose} variant="outlined">
                Later
              </Button>
              <LoadingButton
                loading={loading}
                onClick={subscribeButtonOnClick}
                variant="contained"
              >
                Turn on!
              </LoadingButton>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
