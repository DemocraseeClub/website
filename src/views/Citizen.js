import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { rallyStyles } from "../Util/ThemeUtils";
import { withRouter } from "react-router";
import { withCmsHooks } from "./firebaseCMS/FirebaseCMS";
import { withSnackbar } from "notistack";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import WebIcon from "@material-ui/icons/Web";
import Chip from "@material-ui/core/Chip";
import PhoneAndroidIcon from "@material-ui/icons/PhoneAndroid";
import EmailIcon from "@material-ui/icons/Email";
class Citizen extends React.Component {
  render() {
    const { classes } = this.props;
    const preventDefault = (event) => event.preventDefault();

    return (
      <Paper className={classes.root}>
        <Box>
          <div
            style={{
              width: "100%",
              height: "30vh",
              backgroundImage: `url(/images/Indy-Rishi-Singh-playing-flute.jpg)`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
              backgroundColor: "white",
              position: "relative",
            }}
          >
            <Avatar
              alt="Citizen pic"
              src="/images/indy.png"
              className={classes.profilePicture}
            />
          </div>
          <Box className={classes.profileMainInfoContainer}>
            <Typography variant="h1" className={classes.profileName}>
              Elpo Larni
            </Typography>
            <Typography
              variant="overline"
              className={classes.profileProfession}
            >
              Technical Wet Meat
            </Typography>

            <Chip
              className={classes.profileChip}
              icon={<WebIcon />}
              label="https://elpito.com"
              onClick={preventDefault}
            />
            <Chip
              className={classes.profileChip}
              icon={<PhoneAndroidIcon />}
              label="+123456789"
              onClick={preventDefault}
            />
            <Chip
              className={classes.profileChip}
              icon={<EmailIcon />}
              label="elpito@gmail.com"
              onClick={preventDefault}
            />
          </Box>
          <Box className={classes.profileBioContainer}>
            <Typography variant="body1" className={classes.profileBio}>
              Contrary to popular belief, Lorem Ipsum is not simply random text.
              It has roots in a piece of classical Latin literature from 45 BC,
              making it over 2000 years old. Richard McClintock, a Latin
              professor at Hampden-Sydney College in Virginia, looked up one of
              the more obscure Latin words, consectetur, from a Lorem Ipsum
              passage, and going through the cites of the word in classical
              literature, discovered the undoubtable source. Lorem Ipsum comes
              from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et
              Malorum" (The Extremes of Good and Evil) by Cicero, written in 45
              BC. This book is a treatise on the theory of ethics, very popular
              during the Renaissance. The first line of Lorem Ipsum, "Lorem
              ipsum dolor sit amet..", comes from a line in section 1.10.32. The
              standard chunk of Lorem Ipsum used since the 1500s is reproduced
              below for those interested. Sections 1.10.32 and 1.10.33 from "de
              Finibus Bonorum et Malorum" by Cicero are also reproduced in their
              exact original form, accompanied by English versions from the 1914
              translation by H. Rackham.
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }
}

export default withStyles(rallyStyles, { withTheme: true })(
  withSnackbar(withCmsHooks(withRouter(Citizen)))
);
