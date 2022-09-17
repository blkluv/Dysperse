import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import React from "react";

/**
 * Custom rooms add component
 * @param {any} {houseType}
 * @returns {any}
 */
export function CustomRooms({ houseType }: any) {
  //  eslint-disable-next-line react-hooks/exhaustive-deps
  const fixedOptions = [
    ...(houseType === "dorm" ? [] : ["Kitchen"]),
    "Bedroom",
    "Bathroom",
    ...(houseType === "home" ? ["Garage"] : []),
    "Living room",
    ...(houseType === "dorm" ? [] : ["Dining room"]),
    ...(houseType === "dorm" ? [] : ["Laundry room"]),
    "Storage room",
    ...(houseType === "dorm" ? [] : ["Camping Supplies"]),
    ...(houseType === "dorm" ? [] : ["Garden"]),
  ];

  const [value, setValue] = React.useState([...fixedOptions]);

  return (
    <Autocomplete
      disabled={value.length >= fixedOptions.length + 5}
      multiple
      sx={{
        "& .MuiFilledInput-root": {
          pb: 2,
          px: 2,
        },
      }}
      freeSolo
      id="fixed-tags-demo"
      value={value}
      onChange={(event: any, newValue: any) => {
        setValue([
          ...fixedOptions,
          ...newValue.filter((option) => fixedOptions.indexOf(option) === -1),
        ]);

        fetch(
          "/api/property/rooms/create?" +
            new URLSearchParams({
              property: global.property.propertyId,
              accessToken: global.property.accessToken,
              name: newValue.filter(
                (option) => fixedOptions.indexOf(option) === -1
              ),
            }).toString()
        );
      }}
      options={[]}
      getOptionLabel={(option: any) => option}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <React.Fragment key={option.toString()}>
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{
                "&.Mui-disabled": {
                  opacity: "1!important",
                },
                "& *:not(.MuiChip-label)": {
                  display: "none!important",
                },
              }}
              // disabled={fixedOptions.indexOf(option.toString()) !== -1}
              disabled
            />
          </React.Fragment>
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          placeholder="Add another room"
        />
      )}
    />
  );
}
