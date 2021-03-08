import React from "react";

import { TextField } from "@material-ui/core";
import { FieldDescription } from "@camberi/firecms";
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center"
  },
});


function CustomPhoneField({
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
                    <PhoneIphoneIcon />
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
        type={"tel"}
        
      />

      <FieldDescription property={property} />
    </>
  );
}

export default CustomPhoneField;

