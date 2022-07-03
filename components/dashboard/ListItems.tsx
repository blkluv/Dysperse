import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import React from "react";
import useFetch from "react-fetch-hook";
import { GenerateListItem } from "./GenerateListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// Shopping list / todo list
export function ListItems({
  parent,
  title,
  emptyImage,
  emptyText,
}: {
  parent: any;
  title: any;
  emptyImage: any;
  emptyText: any;
}) {
  const { data, isLoading }: any = useFetch(
    "https://api.smartlist.tech/v2/lists/fetch/",
    {
      method: "POST",
      body: new URLSearchParams({
        token: global.session && global.session.accessToken,
        parent: parent,
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  if (isLoading)
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
        background: global.theme === "dark" ? "hsl(240, 11%, 13%)" : "#eee",
        boxShadow: 0,
      }}
    >
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {title}
        </Typography>
        {data.data.map((list: Object, id: number) => (
          <GenerateListItem {...list} key={id.toString()} />
        ))}
        <ListItemButton
          onClick={() => {
            if (parent === -2)
              document.getElementById("listTrigger_1")!.click();
            else document.getElementById("listTrigger_0")!.click();
          }}
          sx={{ py: 0, borderRadius: 3, transition: "none" }}
          dense
        >
          <ListItemIcon>
            <span
              style={{ marginLeft: "-2px" }}
              className="material-symbols-rounded"
            >
              add_circle
            </span>
          </ListItemIcon>
          <ListItemText sx={{ my: 1.4 }} primary={"New list item"} />
        </ListItemButton>
        {data.data.length === 0 && (
          <Box sx={{ textAlign: "center" }}>
            <picture>
              <img src={emptyImage} alt="No items" loading="lazy" />
            </picture>
            <Typography sx={{ display: "block" }} variant="h6">
              No items?!
            </Typography>
            <Typography sx={{ display: "block" }}>{emptyText}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
