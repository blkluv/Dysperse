import PWAInstallerPrompt from "@/lib/client/installer";
import { Icon, IconButton, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";

export function UpdateButton() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window as any).workbox !== undefined
    ) {
      const wb = (window as any).workbox;
      // add event listeners to handle any of PWA lifecycle event
      // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-window.Workbox#events
      wb.addEventListener("installed", (event) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      wb.addEventListener("controlling", (event) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      wb.addEventListener("activated", (event) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
      // NOTE: MUST set skipWaiting to false in next.config.js pwa object
      // https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
      const promptNewVersionAvailable = (event) => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.
        if (
          confirm("A newer version of Dysperse is available, reload to update?")
        ) {
          wb.addEventListener("controlling", (event) => {
            window.location.reload();
          });

          // Send a message to the waiting service worker, instructing it to activate.
          wb.messageSkipWaiting();
        } else {
          console.log(
            "User rejected to reload the web app, keep using old version. New version will be automatically load when user open the app next time."
          );
        }
      };

      wb.addEventListener("waiting", promptNewVersionAvailable);

      // ISSUE - this is not working as expected, why?
      // I could only make message event listenser work when I manually add this listenser into sw.js file
      wb.addEventListener("message", (event) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      /*
      wb.addEventListener('redundant', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener('externalinstalled', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener('externalactivated', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })
      */

      // never forget to call register as auto register is turned off in next.config.js
      wb.register();
    }
  }, []);

  const [button, setButton] = useState(true);

  return (
    <PWAInstallerPrompt
      render={({ onClick }) => (
        <Snackbar
          onClick={onClick}
          open={button}
          autoHideDuration={6000}
          onClose={() => null}
          sx={{ mb: { xs: 7, sm: 2 }, transition: "all .3s" }}
          message="Tap to install Dysperse"
          action={
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setButton(false);
              }}
            >
              <Icon>close</Icon>
            </IconButton>
          }
        />
      )}
      callback={(data) => console.log(data)}
    />
  );
}