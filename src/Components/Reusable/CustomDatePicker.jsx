import moment from "moment";

import { Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const CustomDatePicker = ({
  name,
  control,
  onChange: onValueChange,
  optional,
  error,
  helperText,
  fullWidth,
  minDate,
  hasRequest,
  ...datepicker
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const { value, onChange: setValue } = field;
        return (
          <DatePicker
            {...datepicker}
            reduceAnimations
            value={value || null}
            size="small"
            minDate={minDate}
            onChange={(newValue) => {
              // Check if the value is valid using moment
              if (!moment(newValue).isValid()) return;

              // If there's a parent onChange handler, call it
              if (onValueChange) {
                onValueChange(newValue); // Call parent onChange
              }

              // Set the value in the form state
              setValue(newValue);
            }}
            slotProps={{
              textField: {
                size: "small",
                error: error,
                helperText: helperText,
                sx: {
                  minWidth: "180px",
                  "& .Mui-focused.MuiFormLabel-root": {
                    color: "secondary.main",
                  },

                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: hasRequest ? "1px solid #f9aa33" : "#344955!important",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderRadius: "10px",
                    bgcolor: optional ? null : "#f5c9861c",
                    border: hasRequest ? "1px solid #f9aa33" : null,
                    // border: optional ? "1px dashed lightgray" : null,
                  },

                  ":hover .MuiOutlinedInput-notchedOutline": {
                    border: hasRequest ? "2px solid #f9aa40" : null,
                  },

                  ".Mui-disabled": {
                    backgroundColor: "background.light",
                    borderRadius: "10px",
                  },
                  "& .MuiInputLabel-root.Mui-disabled": {
                    backgroundColor: "transparent",
                  },
                },
                fullWidth,
              },
            }}
          />
        );
      }}
    />
  );
};

export default CustomDatePicker;
