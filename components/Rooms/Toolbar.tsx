import type { Item } from "@prisma/client";
import React from "react";
import { neutralizeBack, revivalBack } from "../../hooks/useBackButton";
import { colors } from "../../lib/colors";

import { Box, Button, Icon, Menu, MenuItem, TextField } from "@mui/material";
import { grey } from "@mui/material/colors";

/**
 * Search bar
 */
function SearchBar({
  items,
  setItems,
  data,
}: {
  items: Item[];
  setItems: (items: Item[]) => void;
  data: Item[];
}) {
  /**
   * Handles blur event
   */
  const handleBlurEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (e.code === "Enter") target.blur();
  };

  return (
    <Button
      id="basic-button"
      variant="text"
      disableFocusRipple
      sx={{
        backgroundColor:
          global.theme == "dark"
            ? "hsl(240,11%,15%)!important"
            : `${grey[200]}!important`,
        borderRadius: 10,
        mt: { xs: 1, sm: 0 },
        width: "100%",
        textAlign: "left",
        color: `${grey[600]}!important`,
        textTransform: "none",
        justifyContent: "start",
        px: 2,
        pt: 1,
        "& *": {
          pointerEvents: "none",
        },
        "& *:focus": {
          pointerEvents: "auto!important",
        },
        verticalAlign: "middle",
      }}
      onClick={() => {
        document.getElementById("outlined-size-small")?.focus();
      }}
    >
      <Icon>search</Icon>
      <TextField
        placeholder="Search"
        id="outlined-size-small"
        onKeyDown={handleBlurEvent}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (value === "") {
            setItems(data);
            return;
          }
          setItems([]);
          setTimeout(() => {
            setItems(
              data.filter(
                (item) =>
                  item.name.toLowerCase().includes(value.toLowerCase()) ||
                  item.quantity.toLowerCase().includes(value.toLowerCase()) ||
                  JSON.parse(item.category)
                    .join(",")
                    .toLowerCase()
                    .includes(value.toLowerCase())
              )
            );
          }, 50);
        }}
        size="small"
        variant="standard"
        fullWidth
        autoComplete="off"
        InputProps={{
          disableUnderline: true,
          sx: {
            border: "0!important",
            mr: 0.5,
            px: 2,
            width: "100%",
            background: global.user.darkMode ? "hsl(240, 11%, 15%)" : grey[200],
          },
        }}
      />
    </Button>
  );
}

/**
 * Toolbar for a room
 * @param {any} {alias
 * @param {any} room
 * @param {any} items
 * @param {any} setItems
 * @param {any} data}
 * @returns {any}
 */
export function Toolbar({
  alias,
  room,
  items,
  setItems,
  data,
}: {
  alias: string;
  room: string;
  items: Item[];
  setItems: (items: Item[]) => void;
  data: Item[];
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * Handles the click for the filter menu
   * @param {React.MouseEvent<HTMLButtonElement>} event
   * @returns {any}
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  /**
   * Closes the popup
   * @returns void
   */
  const handleClose = () => {
    setAnchorEl(null);
  };
  React.useEffect(() => {
    open ? neutralizeBack(handleClose) : revivalBack();
  });
  return (
    <Box
      sx={{
        textAlign: "right",
        my: { xs: 2, sm: 3 },
        display: "flex",
        alignItems: "center",
        justifyContent: "end",
      }}
    >
      <SearchBar items={items} setItems={setItems} data={data} />
      <Button
        id="basic-button"
        variant="contained"
        sx={{
          borderRadius: 10,
          ml: 1,
          mt: { xs: 1, sm: 0 },
          py: 1,
          px: 1,
          verticalAlign: "middle",
          background:
            colors[themeColor][global.theme == "dark" ? 900 : 50] +
            "!important",

          color:
            colors[themeColor][global.theme == "dark" ? 50 : 900] +
            "!important",
        }}
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Icon>filter_alt</Icon>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            setItems([]);
            setTimeout(
              () =>
                setItems(items.sort((a, b) => a.name.localeCompare(b.name))),
              50
            );
            setTimeout(handleClose, 50);
          }}
        >
          A-Z
        </MenuItem>
        <MenuItem
          onClick={() => {
            setItems([]);
            setTimeout(
              () =>
                setItems(
                  items.sort((a, b) => a.name.localeCompare(b.name)).reverse()
                ),
              50
            );
            setTimeout(handleClose, 50);
          }}
        >
          Z-A
        </MenuItem>
        <MenuItem
          onClick={() => {
            setItems([]);
            setTimeout(
              () =>
                setItems(
                  items.sort((a, b) => a.quantity.localeCompare(b.quantity))
                ),
              50
            );
            setTimeout(handleClose, 50);
          }}
        >
          Quantity
        </MenuItem>
        <MenuItem
          onClick={() => {
            setItems([]);
            setTimeout(
              () =>
                setItems(
                  items
                    .sort((a, b) =>
                      a.lastModified
                        .toString()
                        .localeCompare(b.lastModified.toString())
                    )
                    .reverse()
                ),
              50
            );
            setTimeout(handleClose, 50);
          }}
        >
          Newest to oldest
        </MenuItem>
        <MenuItem
          onClick={() => {
            setItems([]);
            setTimeout(
              () =>
                setItems(
                  items.sort((a, b) =>
                    a.lastModified
                      .toString()
                      .localeCompare(b.lastModified.toString())
                  )
                ),
              50
            );
            setTimeout(handleClose, 50);
          }}
        >
          Oldest to newest
        </MenuItem>
      </Menu>
    </Box>
  );
}
