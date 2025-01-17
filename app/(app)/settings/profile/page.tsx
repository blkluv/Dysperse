"use client";

import { ProfilePicture } from "@/app/(app)/users/[id]/ProfilePicture";
import { WorkingHours } from "@/app/(app)/users/[id]/WorkingHours";
import { ErrorHandler } from "@/components/Error";
import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { useSession } from "@/lib/client/session";
import { updateSettings } from "@/lib/client/updateSettings";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Icon,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

/**
 * Top-level component for the account settings page.
 */
export default function AppearanceSettings() {
  const { session, setSession } = useSession();
  const fileRef: any = useRef();
  const [name, setName] = useState(session.user.name);
  const handleChange = useCallback((e) => setName(e.target.value), [setName]);

  const { data, mutate, error } = useSWR([
    "user/profile",
    {
      email: session.user.email,
    },
  ]);

  const [bio, setBio] = useState(data?.Profile?.bio || "");
  const [username, setUsername] = useState(session.user.username || "");

  const handleSubmit = async () => {
    if (name.trim() !== "")
      updateSettings(["name", name], { session, setSession });

    await fetchRawApi(session, "user/profile", {
      method: "PUT",
      params: {
        email: session.user.email,
        birthday: birthday.add(1, "day").toISOString(),
        hobbies: JSON.stringify(hobbies),
        bio,
      },
    });
    toast.success("Saved!");
  };

  const handleUsernameSubmit = async () => {
    if (username.trim() !== "") {
      toast.promise(
        updateSettings(["username", username], { session, setSession }),
        {
          loading: "Changing...",
          success: "Changed!",
          error: "Something went wrong. Please try again later",
        }
      );
    }
  };

  const [birthday, setBirthday] = useState(
    dayjs(data?.Profile?.birthday || dayjs())
  );

  const [hobbies, setHobbies] = useState(data?.Profile?.hobbies || []);

  const palette = useColor(session.themeColor, useDarkMode(session.darkMode));

  return (
    <>
      {error && <ErrorHandler error={error.message} />}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          mb: 2,
          gap: 3,
        }}
      >
        <Box>
          {data && <ProfilePicture data={data} />}
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => fileRef.current?.click()}
          >
            <Icon>upload</Icon>Upload
          </Button>
        </Box>
        <input
          type="file"
          ref={fileRef}
          hidden
          onChange={(e) => {
            toast.promise(
              new Promise(async (resolve, reject) => {
                if (!e.target.files) {
                  reject("No files uploaded");
                  return;
                }
                try {
                  const form = new FormData();
                  form.append("image", e.target.files[0]);
                  const res = await fetch(`/api/upload`, {
                    method: "POST",
                    body: form,
                  }).then((res) => res.json());
                  if (!res.image.url) {
                    reject("Duplicate");
                    return;
                  }
                  await fetchRawApi(session, "user/profile", {
                    method:"PUT",
                    params: {
                      email: session.user.email,
                    picture: res.image.url,
                    }
                  });
                  await mutate();
                  resolve(res);
                } catch (e) {
                  reject("");
                }
              }),
              {
                loading: "Uploading...",
                success: "Changed!",
                error:
                  "Couldn't change profile picture. Please try again later",
              }
            );
          }}
          accept="image/png, image/jpeg"
        />
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            onKeyDown={(e) => e.stopPropagation()}
            label="Name"
            fullWidth
            value={name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          {data?.Profile?.birthday && (
            <DatePicker
              label="Birthday"
              value={birthday}
              onChange={(newValue: any) =>
                dayjs(newValue).isValid() && setBirthday(newValue)
              }
            />
          )}
          <TextField
            value={bio}
            label="Bio"
            multiline
            rows={4}
            sx={{ my: 2 }}
          />
          <Autocomplete
            multiple
            getOptionLabel={(option) => option}
            options={[]}
            value={hobbies}
            onChange={(_, newValue) => {
              setHobbies(
                newValue
                  .slice(0, 5)
                  .map((c) => capitalizeFirstLetter(c.substring(0, 20)))
              );
            }}
            freeSolo
            fullWidth
            filterSelectedOptions
            limitTags={5}
            sx={{ my: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="What are your hobbies?"
                placeholder="Press enter once you're done..."
              />
            )}
          />
          <TextField
            disabled
            value={session?.user && session.user.email}
            label="Email"
            margin="dense"
            sx={{ mb: 2 }}
          />
          <TextField
            disabled
            sx={{ mb: 2 }}
            value={session?.user && session.user.timeZone}
            label="Timezone"
            margin="dense"
          />
          {data?.Profile && (
            <WorkingHours
              editMode
              color={session.themeColor}
              isCurrentUser
              mutate={mutate}
              profile={data?.Profile}
              profileCardStyles={{
                border: "1px solid #606060",
                borderRadius: 2,
                overflow: "visible",
                p: 2,
                heading: {
                  color: "#aaa",
                  display: "inline-block",
                  fontSize: "13px",
                  background: palette[1],
                },
              }}
            />
          )}
          <Alert sx={{ my: 1, px: 2 }} severity="info">
            If you want to deactivate your account,{" "}
            <Link href="mailto:hello@dysperse.com" target="_blank">
              please contact us
            </Link>
          </Alert>
          <Box sx={{ display: "flex" }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ ml: "auto" }}
            >
              Save
            </Button>
          </Box>

          <Typography sx={{ mt: 3, mb: 1 }} variant="h6">
            Username
          </Typography>
          <TextField
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            label="Username"
            placeholder="Choose a unique username!"
            margin="dense"
            sx={{ mb: 2 }}
            helperText="This is how people can find you on Dysperse. Usernames can only contain letters, numbers, underscores and periods."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon>alternate_email</Icon>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "flex" }}>
            <Button
              onClick={handleUsernameSubmit}
              variant="contained"
              sx={{ ml: "auto" }}
            >
              Change
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
