import { ErrorHandler } from "@/components/Error";
import { RenderRoom } from "@/components/Rooms/RenderRoom";
import { useApi } from "@/lib/client/useApi";
import { LoadingButton } from "@mui/lab";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { mutate } from "swr";
import Categories from "../items";

/**
 * Top-level component for the room page
 * @returns {any}
 */
export default function Room() {
  const router = useRouter();
  const { room } = router.query;
  const [loading, setLoading] = useState(false);

  const { data, url, error } = useApi("property/inventory/room", {
    room: room?.[0] ?? "",
    ...(Boolean(room?.[1]) && { custom: "true" }),
  });

  return (
    <Categories>
      {data ? (
        data.error ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100vh",
              width: "100%",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6">
              Couldn&apos;t fetch this room&apos;s contents
            </Typography>
            <Typography gutterBottom>
              This room either does not exist or you do not have access to it.
            </Typography>
            <LoadingButton
              onClick={async () => {
                setLoading(true);
                await mutate(url);
                setLoading(false);
              }}
              loading={loading}
              variant="contained"
            >
              Retry
            </LoadingButton>
          </Box>
        ) : (
          <RenderRoom room={data.room} items={data.items} mutationUrl={url} />
        )
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100vh",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {error && (
        <ErrorHandler
          error="Oh no! We couldn't load the items in this room. Please try again later"
          callback={() => mutate(url)}
        />
      )}
    </Categories>
  );
}