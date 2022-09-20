import { useEffect, useState } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import OtpInput from "react-otp-input";
import LoadingButton from "@mui/lab/LoadingButton";
import { colors } from "../../lib/colors";
import { Puller } from "../Puller";
import Box from "@mui/material/Box";
import { sendStatusCode } from "next/dist/server/api-utils";

/**
 * Verify if 2fa code is correct
 * @returns JSX.Element
 */
export default function Prompt({ callback }: { callback: Function }) {
  const userHasEnabled2fa =
    user.twoFactorSecret !== "" && user.twoFactorSecret !== "false";

  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(
    userHasEnabled2fa ? true : false
  );
  const [buttonLoading, setButtonLoading] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!userHasEnabled2fa) {
      callback();
    }
  }, [callback, userHasEnabled2fa]);

  const handleSubmit = () => {};
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={twoFactorModalOpen}
      onClose={() => {}}
      onOpen={() => setTwoFactorModalOpen(true)}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          background: colors.brown[50],
          borderRadius: "30px 30px 0 0",
          mx: "auto",
          maxWidth: "500px",
        },
      }}
    >
      <Puller />
      <Box
        sx={{
          p: 3,
          mt: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            marginBottom: "20px",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Help us protect your account
        </Typography>
        <Typography
          variant="body1"
          sx={{
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Enter the 6-digit code from your authenticator app
        </Typography>

        {/* Six digit authenticator code input */}
        <Box
          sx={{
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            "& *::selection": {
              background: `${colors.brown[900]} !important`,
              color: "#fff!important",
            },
            "& input": {
              p: 1,
              fontSize: "1.3rem",
              textAlign: "center",
              borderRadius: "10px",
              border: "1px solid #ccc",
              height: "35px",
              px: 1.5,
              fontWeight: "900",
              // Selection
              display: "block!important",
              margin: "0 5px",
              outline: "none",
            },
          }}
        >
          <OtpInput
            value={code}
            onChange={(value) => setCode(value)}
            numInputs={6}
            //   separator={<span>-</span>}
          />
        </Box>
        <LoadingButton
          variant="contained"
          loading={buttonLoading}
          onClick={handleSubmit}
          size="large"
          sx={{
            width: "100%",
            mb: 1.4,
            mt: 3,
            boxShadow: 0,
            borderRadius: 99,
            textTransform: "none",
            border: "2px solid transparent !important",
          }}
        >
          Continue
        </LoadingButton>
      </Box>
    </SwipeableDrawer>
  );
}
