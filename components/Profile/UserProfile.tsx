import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { useSession } from "@/lib/client/session";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { useStatusBar } from "@/lib/client/useStatusBar";
import { useCustomTheme } from "@/lib/client/useTheme";
import { colors } from "@/lib/colors";
import { fetcher } from "@/pages/_app";
import { Masonry } from "@mui/lab";
import {
  Alert,
  Box,
  Button,
  Chip,
  Icon,
  IconButton,
  LinearProgress,
  Skeleton,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";
import { useRef, useState } from "react";
import useSWR from "swr";
import { Followers } from "./Followers";
import { Following } from "./Following";
import { ProfilePicture } from "./ProfilePicture";
import { WorkingHours } from "./WorkingHours";

function Contacts({ profile }) {
  const session = useSession();
  const palette = useColor(session.themeColor, useDarkMode(session.darkMode));
  const [open, setOpen] = useState(true);

  const { data, mutate } = useSWR([
    "/user/google/contacts",
    {
      tokenObj: JSON.stringify(profile.google),
      email: session.user.email,
    },
  ]);

  return data && data.length > 0 && open ? (
    <Box
      sx={{
        border: "1px solid",
        borderColor: palette[3],
        mb: 2,
        pb: 2,
        borderRadius: 5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 3,
          py: 1,
          mb: 2,
          borderBottom: `1px solid ${palette[3]}`,
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Suggestions for you
        </Typography>
        <IconButton onClick={() => setOpen(false)}>
          <Icon>close</Icon>
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          overflowX: "auto",
          gap: 2,
        }}
      >
        {data.map((contact) => (
          <Box
            key={contact.email}
            sx={{
              width: "180px",
              flexBasis: "180px",
              background: palette[2],
              borderRadius: 5,
              gap: 1,
              p: 2,
              textAlign: "center",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <ProfilePicture data={contact} mutate={mutate} size={70} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                my: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {contact.name}
            </Typography>
            <Link href={`/users/${contact.email}`}>
              <Button variant="contained">
                <Icon>person</Icon>
                Open
              </Button>
            </Link>
          </Box>
        ))}
      </Box>
    </Box>
  ) : data && data.length === 0 && window.location.href.includes("override") ? (
    <Alert title="New contacts not found" variant="filled" severity="info">
      We don&apos;t have any suggestions for you right now. Try adding more
      contacts to your Google account and check back later!
    </Alert>
  ) : (
    <></>
  );
}

export function SpotifyCard({
  mutate,
  styles,
  email,
  profile,
  hideIfNotPlaying = false,
  open = false,
}: any) {
  const session = useSession();

  const { data, isLoading, error } = useSWR(
    [
      "user/spotify/currently-playing",
      { spotify: JSON.stringify(profile.spotify), email },
    ],
    fetcher,
    { refreshInterval: 1000 }
  );

  if (error) return <div>error</div>;
  if (hideIfNotPlaying && !data?.item) return null;

  return (
    <Box
      sx={{
        ...styles,
        background: "#1db954",
        color: "#fff",
        cursor: "pointer",
        transition: "transform .2s",
        "&:hover": {
          transform: "scale(1.02)",
        },
        "&:active": {
          transform: "scale(.95)",
        },
      }}
      onClick={() =>
        window.open(
          data?.item?.external_urls?.spotify || "https://open.spotify.com"
        )
      }
    >
      {data?.item ? (
        <>
          <Box sx={{ display: "flex", gap: 3 }}>
            <picture>
              <img
                src={data?.item?.album.images[0].url}
                alt="Spotify album cover"
                style={{ width: "100%" }}
              />
            </picture>
            <picture>
              <img
                src={
                  "https://cdn.freebiesupply.com/logos/large/2x/spotify-2-logo-black-and-white.png"
                }
                alt="Spotify"
                style={{ width: "45px", height: "45px" }}
              />
            </picture>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              overflow: "hidden",
            }}
          >
            <Icon className="outlined" sx={{ fontSize: "40px!important" }}>
              {data.is_playing ? "pause_circle_filled" : "play_circle"}
            </Icon>
            <Box sx={{ flexGrow: 1, maxWidth: "100%", minWidth: 0, mt: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {data.item.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {data.item.artists.map((artist) => artist.name).join(", ")}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(data.progress_ms / data.item.duration_ms) * 100}
                sx={{
                  height: 10,
                  borderRadius: 99,
                  background: "rgba(255, 255, 255, 0.2)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 99,
                    background: "#fff",
                  },
                }}
              />
            </Box>
          </Box>
        </>
      ) : data && (isLoading || data?.currently_playing_type === "ad") ? (
        <>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  borderRadius: 5,
                  aspectRatio: "1 / 1",
                  width: "100%",
                  background: "rgba(255,255,255,.2)",
                }}
              />
            </Box>
            <picture>
              <img
                src={
                  "https://cdn.freebiesupply.com/logos/large/2x/spotify-2-logo-black-and-white.png"
                }
                alt="Spotify"
                style={{ width: "45px", height: "45px" }}
              />
            </picture>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              overflow: "hidden",
            }}
          >
            <Skeleton
              animation={false}
              variant="circular"
              width={35}
              height={35}
            />
            <Box sx={{ flexGrow: 1, maxWidth: "100%", minWidth: 0, mt: 1 }}>
              <Skeleton animation={false} width="50%" height={70} />
              <Skeleton animation={false} width="80%" />
              <Skeleton animation={false} width="100%" />
            </Box>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Not playing
            </Typography>
            <picture>
              <img
                src={
                  "https://cdn.freebiesupply.com/logos/large/2x/spotify-2-logo-black-and-white.png"
                }
                alt="Spotify"
                style={{ width: "45px", height: "45px" }}
              />
            </picture>
          </Box>
        </>
      )}
    </Box>
  );
}

export function UserProfile({
  mutate,
  isCurrentUser,
  data,
  profileCardStyles,
}) {
  const session = useSession();
  const birthdayRef: any = useRef();

  const profile = data.Profile;

  const [hobbies, setHobbies] = useState(data.Profile.hobbies);

  const handleChange = async (key, value) => {
    await fetchRawApi(session, "user/profile/update", {
      email: session.user.email,
      [key]: value,
    });
    await mutate();
  };

  const handleDelete = async () => {
    await fetchRawApi(session, "user/profile/delete", {
      email: session.user.email,
    });
    await mutate();
  };

  const today = dayjs();
  const nextBirthday = dayjs(profile.birthday).year(today.year());
  const isDark = useDarkMode(session.darkMode);

  const palette = useColor(data?.color || "gray", isDark);

  const daysUntilNextBirthday =
    nextBirthday.diff(today, "day") >= 0
      ? nextBirthday.diff(today, "day")
      : nextBirthday.add(1, "year").diff(today, "day");

  useStatusBar(palette[1]);

  const styles = {
    color: palette[11],
    textAlign: "center",
    width: { sm: "auto" },
    px: 2,
    py: 2,
    borderRadius: "20px",
    "& h6": {
      mt: -1,
      fontSize: 27,
      fontWeight: 900,
    },
  };

  const userTheme = createTheme(
    useCustomTheme({
      darkMode: isDark,
      themeColor: data?.color || "grey",
    })
  );

  const chipStyles = () => ({
    "& .MuiIcon-root": {
      fontVariationSettings:
        '"FILL" 0, "wght" 200, "GRAD" 0, "opsz" 40!important',
    },
  });

  return (
    <ThemeProvider theme={userTheme}>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mt: 2,
          alignItems: "center",
          justifyContent: { xs: "center", sm: "flex-start" },
          flexWrap: "wrap",
        }}
      >
        <Tooltip title="Goals completed">
          <Chip
            sx={chipStyles}
            label={data.trophies}
            icon={
              <Icon sx={{ color: "inherit!important" }}>military_tech</Icon>
            }
          />
        </Tooltip>
        <Tooltip title="Local time">
          <Chip
            sx={chipStyles}
            label={`${dayjs().tz(data.timeZone).format("h:mm A")}`}
            icon={<Icon sx={{ color: "inherit!important" }}>access_time</Icon>}
          />
        </Tooltip>
        {data.CoachData && (
          <Tooltip title="Coach streak">
            <Chip
              sx={{
                ...(data.CoachData.streakCount > 0
                  ? {
                      background: colors.orange[isDark ? 900 : 100],
                      "&, & *": {
                        color: colors.orange[isDark ? 50 : 900],
                      },
                    }
                  : chipStyles),
              }}
              label={data.CoachData.streakCount}
              icon={
                <Icon sx={{ color: "inherit!important" }}>
                  local_fire_department
                </Icon>
              }
            />
          </Tooltip>
        )}
        {profile &&
          profile.badges.map((badge) => (
            <Chip
              sx={chipStyles}
              label={badge}
              key={badge}
              {...(badge === "Early supporter" && {
                icon: <Icon>favorite</Icon>,
              })}
            />
          ))}
      </Box>
      <Typography
        variant="body2"
        sx={{
          gap: 1,
          display: "flex",
          mb: 2,
          mt: 1,
          opacity: 0.7,
          color: palette[9],
        }}
      >
        <Followers styles={styles} data={data} />
        <Following styles={styles} data={data} />
      </Typography>
      <Contacts profile={profile} />
      <Box sx={{ mr: -2 }}>
        <Masonry sx={{ mt: 3 }} columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
          {profile && profile.hobbies.length > 0 && (
            <Box sx={profileCardStyles}>
              <Typography sx={profileCardStyles.heading}>Hobbies</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {profile &&
                  profile.hobbies.map((badge) => (
                    <Chip
                      sx={{ ...chipStyles, textTransform: "capitalize" }}
                      label={badge}
                      size="small"
                      key={badge}
                    />
                  ))}
              </Box>
            </Box>
          )}
          {profile && (
            <WorkingHours
              editMode={false}
              color={data.color}
              isCurrentUser={isCurrentUser}
              mutate={mutate}
              profile={profile}
              profileCardStyles={profileCardStyles}
            />
          )}
          <Box sx={profileCardStyles}>
            <Typography sx={profileCardStyles.heading}>Birthday</Typography>
            <>
              <Typography
                variant="h5"
                sx={{
                  mt: 0.5,
                  color: palette[12],
                }}
              >
                {dayjs(profile.birthday).format("MMMM D")}
              </Typography>
              <Typography sx={{ color: palette[11] }}>
                In {daysUntilNextBirthday} days
              </Typography>
            </>
          </Box>

          {profile.bio && (
            <Box sx={profileCardStyles}>
              <Typography sx={profileCardStyles.heading}>About</Typography>
              {profile && profile.bio && (
                <Typography sx={{ fontSize: "17px" }}>
                  {profile?.bio}
                </Typography>
              )}
            </Box>
          )}

          {profile.spotify && (
            <SpotifyCard
              open
              email={data.email}
              styles={profileCardStyles}
              profile={profile}
              mutate={mutate}
            />
          )}
          {data.Status && dayjs(data?.Status?.until).isAfter(dayjs()) && (
            <Box sx={profileCardStyles}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  width: 70,
                  height: 70,
                  background: palette[2],
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">
                  {dayjs().tz(data.timeZone).format("MMM")}
                </Typography>
                <Typography variant="h5">
                  {dayjs().tz(data.timeZone).format("D")}
                </Typography>
              </Box>
              <Box sx={{ mt: 5 }} />
              <Typography sx={profileCardStyles.heading}>Right now</Typography>
              <Typography variant="h4">
                {capitalizeFirstLetter(data.Status.status)}
              </Typography>
              <LinearProgress
                variant="determinate"
                sx={{
                  my: 1,
                  height: 10,
                  borderRadius: 99,
                  background: palette[3],
                  "& *": {
                    background: palette[9] + "!important",
                  },
                }}
                value={
                  (dayjs().diff(data.Status.started, "minute") /
                    dayjs(data.Status.until).diff(
                      data.Status.started,
                      "minute"
                    )) *
                  100
                }
              />
              <Typography variant="body2">
                Until {dayjs(data.Status.until).format("h:mm A")}
              </Typography>
            </Box>
          )}
        </Masonry>
      </Box>
    </ThemeProvider>
  );
}
