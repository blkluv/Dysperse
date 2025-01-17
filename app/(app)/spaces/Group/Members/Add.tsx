import { useSession } from "@/lib/client/session";
import { fetchRawApi } from "@/lib/client/useApi";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Icon,
  MenuItem,
  Select,
  SwipeableDrawer,
  TextField,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import React, { useCallback, useDeferredValue, useState } from "react";
import toast from "react-hot-toast";
import { Puller } from "../../../../../components/Puller";
import { Prompt } from "../../../../../components/TwoFactorModal";
import { isEmail } from "./isEmail";

function LinkToken() {
  const { session } = useSession();

  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [token, setToken] = React.useState("");
  const url = `https://${window.location.hostname}/invite/${token}`;

  const copyText = () => {
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard");
  };

  const createLink = () => {
    setLoading(true);
    fetchRawApi(session, "space/members/inviteLink", {
      method: "POST",
      params: {
        inviterName: session.user.name,
        timestamp: new Date().toISOString(),
      },
    }).then((res) => {
      setLoading(false);
      setToken(res.token);
      setOpen(true);
    });
  };

  return (
    <>
      <LoadingButton
        loading={loading}
        onClick={createLink}
        sx={{ m: 1 }}
        variant="contained"
        size="large"
      >
        Copy member invite link
      </LoadingButton>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Puller />
        <Box
          sx={{
            p: 3,
            pt: 0,
          }}
        >
          <Typography gutterBottom variant="h6">
            Member invite link
          </Typography>
          <Typography gutterBottom>
            This link is only valid once and will expire in 24 hours. Do not
            share this link with anyone you do not trust.
          </Typography>
          <TextField
            variant="filled"
            value={url}
            InputProps={{
              readOnly: true,
            }}
            label="Invite URL"
          />
          <Box sx={{ display: "flex", mt: 2, alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={copyText}
            >
              Copy
            </Button>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => window.open(url, "_blank")}
            >
              Open
            </Button>
          </Box>
        </Box>
      </SwipeableDrawer>
    </>
  );
}

/**
 * Description
 * @param {any} {color
 * @param {any} members}
 * @returns {any}
 */
export function AddPersonModal({
  children,
  mutate = () => {},
  disabled = false,
  members,
  defaultValue,
}: {
  mutate?: any;
  children?: any;
  disabled?: boolean;
  members: string[];
  defaultValue?: any;
}) {
  const { session } = useSession();
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [permission, setPermission] = useState("member");
  const [email, setEmail] = useState(defaultValue || "");

  const deferredEmail = useDeferredValue(email);

  const handleChange = useCallback(
    (event: SelectChangeEvent) => setPermission(event.target.value as string),
    []
  );

  const handleSubmit = async () => {
    try {
      if (members.find((member) => member === deferredEmail)) {
        setEmail("");
        throw new Error("This member is already invited");
      }
      if (isEmail(deferredEmail)) {
        setLoading(true);
        await fetchRawApi(session, "space/members", {
          method: "POST",
          params: {
            inviterName: session.user.name,
            name: session.space.info.name,
            timestamp: new Date().toISOString(),
            permission: permission,
            email: deferredEmail,
          },
        });
        toast.success("Invited!");
        setOpen(false);
        setLoading(false);
        mutate();
      } else {
        throw new Error("Please enter a valid email address");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <Prompt callback={() => setOpen(true)}>
        {children || (
          <Button
            variant="contained"
            disabled={disabled || session.property.permission !== "owner"}
            sx={{
              px: 2,
              ml: "auto",
            }}
          >
            <Icon>add</Icon>
            Invite
          </Button>
        )}
      </Prompt>
      <SwipeableDrawer
        open={open}
        PaperProps={{
          sx: {
            width: {
              sm: "50vw",
            },
            maxWidth: "650px",
            overflow: "scroll",
            maxHeight: "95vh",
          },
        }}
        onClose={() => setOpen(false)}
        anchor="bottom"
      >
        <Puller />
        <Box sx={{ p: 3, pt: 0 }}>
          <Typography variant="h5">Invite a person</Typography>
          <Alert severity="warning" sx={{ my: 2 }}>
            Make sure you trust who you are inviting. Anyone you invite can
            access everything you see.
          </Alert>
          <TextField
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            variant="filled"
            label="Enter an email address"
            placeholder="elon.musk@gmail.com"
          />
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={permission}
              variant="filled"
              sx={{
                mt: 2,
                pt: 0,
                pb: 1,
                mb: 2,
                height: "90px",
                "& *, &": { whiteSpace: "unset!important" },
              }}
              label="Permissions"
              onChange={handleChange}
            >
              <MenuItem value={"read-only"}>
                <Box
                  sx={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>Read only</Typography>
                  <Typography variant="body2">
                    View access to your inventory, rooms, and lists
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value={"member"}>
                <Box
                  sx={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>Member</Typography>
                  <Typography variant="body2">
                    Can view and edit your inventory, rooms, lists, etc
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          <LoadingButton
            loading={loading}
            disabled={deferredEmail.trim() == ""}
            onClick={handleSubmit}
            variant="contained"
            size="large"
            sx={{ m: 1 }}
          >
            Send invitation
          </LoadingButton>
          <LinkToken />
        </Box>
      </SwipeableDrawer>
    </>
  );
}
