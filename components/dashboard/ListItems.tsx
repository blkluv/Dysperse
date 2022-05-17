import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import CardContent from "@mui/material/CardContent";
import { GenerateListItem } from "./GenerateListItem";
import useSWR from "swr";

const fetcher = (url, options) => fetch(url, options).then((res) => res.json());

export function ListItems({
  parent,
  title,
  emptyImage,
  emptyText
}: {
  parent: any;
  title: any;
  emptyImage: any;
  emptyText: any;
}) {
  const url = "https://api.smartlist.tech/v2/lists/fetch/";
  const { data, error } = useSWR(url, () =>
    fetcher(url, {
      method: "POST",
      body: new URLSearchParams({
        token: global.session && global.session.accessToken,
        parent: parent
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
  );
  if (error) return <div>Failed to load items</div>;
  if (!data)
    return (
      <Skeleton
        height={200}
        animation="wave"
        variant="rectangular"
        sx={{ borderRadius: "28px" }}
      />
    );

  return (
    <Card
      sx={{
        borderRadius: "28px",
        width: "100%",
        p: 1,
        background: global.theme === "dark" ? "hsl(240, 11%, 20%)" : "#eee",
        boxShadow: 0
      }}
    >
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {title}!
        </Typography>
        {data.data.map((list: Object) => (
          <GenerateListItem {...list} />
        ))}
        {data.data.length === 0 && (
          <Box sx={{ textAlign: "center" }}>
            <img alt="" src={emptyImage} />
            <Typography sx={{ display: "block" }} variant="h6">
              No items?!
            </Typography>
            <Typography sx={{ display: "block" }}>{emptyText}</Typography>
            <Typography sx={{ display: "block" }} variant="caption">
              PRO TIP: Hit the "+" icon to create an item
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
