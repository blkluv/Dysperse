import Masonry from "@mui/lab/Masonry";
import { Card, CardActionArea, Skeleton } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { mutate } from "swr";
import { fetchApiWithoutHook } from "../../hooks/useApi";
import { colors } from "../../lib/colors";
import { useState } from "react";

export function CreateBoard({ emblaApi, mutationUrl }: any) {
  const templates = [
    {
      name: "To-do",
      description: "A simple to-do list",
      color: "blue",
      columns: [
        {
          name: "To-do",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3af.png",
        },
        {
          name: "In progress",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3c3.png",
        },
        {
          name: "Done",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3c1.png",
        },
      ],
    },
    {
      name: "Reading list",
      description: "A list of books to read",
      color: "green",
      columns: [
        {
          name: "To-read",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4da.png",
        },
        {
          name: "In progress",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3c3.png",
        },
        {
          name: "Done",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3c1.png",
        },
      ],
    },
    {
      name: "Shopping list",
      description: "A list of things to buy",
      color: "red",
      columns: [
        {
          name: "Fruits",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f34e.png",
        },
        {
          name: "Vegetables",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f345.png",
        },
        {
          name: "Meat",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f356.png",
        },
        {
          name: "Other",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b0.png",
        },
      ],
    },
    {
      name: "Trip planning template",
      description: "A template for planning a trip",
      color: "deepOrange",
      columns: [
        {
          name: "Flights",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2708.png",
        },
        {
          name: "Hotels",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3e8.png",
        },
        {
          name: "Activities",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3c8.png",
        },
        {
          name: "Transportation",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f68c.png",
        },
      ],
    },
    {
      name: "Workout",
      description: "A template for planning a workout",
      color: "purple",
      columns: [
        {
          name: "Warm-up",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3cb.png",
        },
        {
          name: "Main workout",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3cb.png",
        },
        {
          name: "Cool-down",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3cb.png",
        },
      ],
    },
    {
      name: "Project planning",
      description: "A template for planning a project",
      color: "orange",
      columns: [
        {
          name: "Ideas",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4a1.png",
        },
        {
          name: "Research",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4d6.png",
        },
        {
          name: "Design",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4bc.png",
        },
        {
          name: "Budget",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b0.png",
        },
        {
          name: "Development",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4bb.png",
        },
      ],
    },
    {
      name: "Life goals",
      description: "A template for planning your life goals",
      color: "pink",
      columns: [
        {
          name: "Today",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4c5.png",
        },
        {
          name: "This week",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4c5.png",
        },
        {
          name: "This month",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4c5.png",
        },
        {
          name: "This year",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4c5.png",
        },
        {
          name: "Life",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4c5.png",
        },
      ],
    },
    {
      name: "Bucket list",
      description: "A template for planning your bucket list",
      color: "lime",
      columns: [
        {
          name: "Places",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f30d.png",
        },
        {
          name: "Experiences",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f3a8.png",
        },
        {
          name: "Things to do",
          emoji:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4dd.png",
        },
      ],
    },
  ];

  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ px: 4 }}>
      <Masonry columns={{ xs: 1, sm: 2 }} spacing={2} sx={{ mt: 2 }}>
        {templates.map((template) => (
          <Box
            onClick={() => {
              setLoading(true);
              fetchApiWithoutHook("property/boards/createBoard", {
                board: JSON.stringify(template),
              }).then(async () => {
                await mutate(mutationUrl);
                setLoading(false);
                if (emblaApi) {
                  emblaApi.reInit({
                    loop: true,
                    containScroll: "keepSnaps",
                    dragFree: true,
                  });
                }
              });
            }}
            sx={{
              maxWidth: "calc(100vw - 52.5px)",
            }}
          >
            <Card
              sx={{
                ...(loading && {
                  opacity: 0.5,
                  pointerEvents: "none",
                }),
                width: "100%!important",
                background: "rgba(200,200,200,.3)",
                borderRadius: 5,
                transition: "transform 0.2s",
                cursor: "pointer",
                userSelect: "none",
                "&:hover": {
                  background: "rgba(200,200,200,.4)",
                },
                "&:active": {
                  background: "rgba(200,200,200,.5)",
                  transform: "scale(.98)",
                  transition: "none",
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    background: "rgba(200,200,200,.2)",
                    color: "#000",
                    borderRadius: 5,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    display: "flex",
                  }}
                >
                  {template.columns.map((column, index) => (
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        overflowX: "auto",
                        p: { xs: 1.5, sm: 2.5 },
                        gap: 2,
                        borderRight:
                          index !== template.columns.length - 1
                            ? "1px solid rgba(0,0,0,.1)"
                            : "none",
                        flexDirection: "column",
                      }}
                    >
                      <img src={column.emoji} width="30px" height="30px" />
                      <Box
                        sx={{
                          fontSize: 18,
                          fontWeight: 600,
                          mt: -0.5,
                          maxWidth: "100%",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {column.name}
                      </Box>
                      <Box>
                        <Skeleton animation={false} width={100} />
                        <Skeleton animation={false} width={90} />
                        <Skeleton animation={false} width={50} />
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ p: 3, pt: 0 }}>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {template.name}
                  </Typography>
                  <Typography variant="body2">
                    {template.description}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        ))}
      </Masonry>
    </Box>
  );
}
