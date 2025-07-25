import { InputAdornment, TextField as MuiTextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import AttachmentIcon from "../../Img/SVG/Attachment.svg";
import AttachmentActive from "../../Img/SVG/AttachmentActive.svg";
import AttachmentError from "../../Img/SVG/AttachmentError.svg";

const CustomAttachmentArray = (props) => {
  const { name, control, errors, inputRef, optional, hasRequest, watch, ...textfield } = props;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const { ref, value, onChange: setValue } = field;
        // console.log(value);
        return (
          <>
            <MuiTextField
              type="file"
              // disabled={disabled}
              inputRef={(e) => {
                // Set the ref for both the parent and RHF
                if (inputRef) inputRef.current = e;
              }}
              onChange={(e) => {
                // console.log(e.target.files[0]);

                setValue(e.target.files[0]);
                e.target.value = null;
              }}
              sx={{ display: "none" }}
            />
            <MuiTextField
              {...textfield}
              readOnly
              type="text"
              size="small"
              autoComplete="off"
              color={hasRequest ? "primary" : "secondary"}
              value={value?.name || "No file chosen"}
              onClick={() => {
                if (inputRef?.current) inputRef.current.click();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <img
                      src={textfield.error ? AttachmentError : value ? AttachmentActive : AttachmentIcon}
                      width="20px"
                    />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                ".MuiInputBase-root": {
                  borderRadius: "10px",
                  color: textfield.error ? "red" : "#636363",
                },

                ".MuiOutlinedInput-notchedOutline": {
                  bgcolor: optional ? null : "#f5c9861c",
                  border: optional ? null : hasRequest ? "1px solid #f9aa40" : null,
                  // border: optional ? "1px dashed #c7c7c742" : null,
                },

                ":hover .MuiOutlinedInput-notchedOutline": {
                  border: watch && hasRequest ? "2px solid #f9aa40" : null,
                },

                ".MuiInputLabel-root.Mui-disabled": {
                  backgroundColor: "transparent",
                },

                ".Mui-disabled": {
                  backgroundColor: "background.light",
                  borderRadius: "10px",
                },
              }}
            />
            {errors && <Typography sx={{ color: "blue" }}>{errors}</Typography>}
          </>
        );
      }}
    />
  );
};

export default CustomAttachmentArray;
