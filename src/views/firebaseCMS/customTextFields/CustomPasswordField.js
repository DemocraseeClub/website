import React, {useState} from "react";

import {TextField} from "@material-ui/core";
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import {FieldDescription} from "@camberi/firecms";
import LockIcon from '@material-ui/icons/Lock';

import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center"
  },
});

function CustomPasswordField({
  property,
  value,
  setValue,
  customProps,
  touched,
  error,
  isSubmitting,
  context, // the rest of the entity values here
  ...props
}) {

    const [showPassword, setShowPassword] = useState(false)
    const classes = useStyles();
  return (
    <>
      <TextField
        required={property.validation?.required}
        error={!!error}
        disabled={isSubmitting}
        InputLabelProps={{ className: classes.root }}
        label={
            <>
                    <LockIcon />
                    <span style={{marginLeft:"8px"}}>{property.title}</span>
            </>
          }
        value={value ?? ""}
        onChange={(evt) => {
          setValue(evt.target.value);
        }}
        helperText={error}
        fullWidth
        variant={"filled"}
        type={ showPassword ? "text" : "password"}
        InputProps={{
            endAdornment:
                <InputAdornment position="end">
                    <IconButton
                    aria-label="toggle password visibility"
                    onClick={(e) => setShowPassword(value => !value)}
                    >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                </InputAdornment>

        }}
      />

      <FieldDescription property={property} />
    </>
  );
}

export default CustomPasswordField;
