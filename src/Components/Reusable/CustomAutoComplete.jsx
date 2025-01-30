import { Controller } from "react-hook-form";
import { InputAdornment, Autocomplete as MuiAutocomplete, Stack, TextField } from "@mui/material";

const CustomAutoComplete = ({
  name,
  control,
  hasRequest,
  optional,
  onChange: onValueChange,
  onOpen,
  optionalSolid,
  ...autocomplete
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const { value, onChange: setValue } = field;

        return (
          <MuiAutocomplete
            {...autocomplete}
            value={value}
            onChange={(e, value) => {
              if (onValueChange) return setValue(onValueChange(e, value));
              setValue(value);
            }}
            // options={options}
            size="small"
            color="secondary"
            onOpen={onOpen}
            sx={{
              ".MuiInputBase-root": {
                borderRadius: "10px",
                // backgroundColor: "white",
              },

              ".MuiOutlinedInput-notchedOutline": {
                bgcolor: optional || optionalSolid ? null : "#f5c9861c",
                border: optional
                  ? "1px dashed #c7c7c742"
                  : optionalSolid
                  ? "1px solid #c7c7c742"
                  : hasRequest
                  ? "1px solid #f9aa33"
                  : null,
              },

              ":hover .MuiOutlinedInput-notchedOutline": {
                border: hasRequest ? "2px solid #f9aa40" : null,
              },

              ".MuiInputLabel-root.Mui-disabled": {
                backgroundColor: "transparent",
              },

              ".Mui-disabled": {
                backgroundColor: "background.light",
              },
            }}
          />
        );
      }}
    />
  );
};

export default CustomAutoComplete;
