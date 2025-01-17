"use client";
import { SpacesLayout } from "@/app/(app)/spaces/[id]/SpacesLayout";
import { SwipeableDrawer } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function Modal() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const onDismiss = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router]);

  return (
    <SwipeableDrawer
      open={open}
      anchor="bottom"
      onClose={onDismiss}
      PaperProps={{
        sx: { maxHeight: "calc(100dvh - 100px)" },
      }}
    >
      <SpacesLayout modal handleCloseModal={setOpen} />
    </SwipeableDrawer>
  );
}
