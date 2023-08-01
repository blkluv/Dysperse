import { ErrorHandler } from "@/components/Error";
import { ProfilePicture } from "@/components/Profile/ProfilePicture";
import { WorkingHours } from "@/components/Profile/WorkingHours";
import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { useSession } from "@/lib/client/session";
import { updateSettings } from "@/lib/client/updateSettings";
import { fetchRawApi, useApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Link,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import Layout from ".";

/**
 * Top-level component for the account settings page.
 */
export default function AppearanceSettings() {
  const session = useSession();
  const birthdayRef: any = useRef();
  const [name, setName] = useState(session.user.name);
  const handleChange = useCallback((e) => setName(e.target.value), [setName]);

  const { data, url, error } = useApi("user/profile", {
    email: session.user.email,
  });

  const [bio, setBio] = useState(data?.Profile?.bio || "");

  const handleSubmit = async () => {
    if (name.trim() !== "") updateSettings(session, "name", name);

    await fetchRawApi(session, "user/profile/update", {
      email: session.user.email,
      birthday: dayjs(new Date(birthdayRef.current.value))
        .add(1, "day")
        .toISOString(),
      hobbies: JSON.stringify(hobbies),
      bio,
    });
  };

  useEffect(() => {
    if (birthdayRef?.current && data?.Profile?.birthday)
      setTimeout(() => {
        birthdayRef.current.value = dayjs(data.Profile.birthday).format(
          "YYYY-MM-DD"
        );
      }, 100);
  }, [data]);

  const [hobbies, setHobbies] = useState(data?.Profile?.hobbies || []);

  const palette = useColor(session.themeColor, useDarkMode(session.darkMode));

  return (
    <Layout>
      {error && <ErrorHandler error={error.message} />}
      <Box sx={{ display: "flex", mb: 2, gap: 3 }}>
        {data && <ProfilePicture data={data} mutationUrl={url} editMode />}
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            onKeyDown={(e) => e.stopPropagation()}
            label="Name"
            fullWidth
            value={name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            onKeyDown={(e) => e.stopPropagation()}
            inputRef={birthdayRef}
            type="date"
            label="Birthday"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            value={bio}
            label="Bio"
            multiline
            rows={4}
            sx={{ mb: 2 }}
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
              mutationUrl={url}
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
        </Box>
      </Box>
      <Box sx={{ display: "flex" }}>
        <Button onClick={handleSubmit} variant="contained" sx={{ ml: "auto" }}>
          Save
        </Button>
      </Box>
    </Layout>
  );
}