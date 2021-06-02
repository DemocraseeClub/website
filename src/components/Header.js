import React from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { NavLink } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import { rallyStyles } from "../Util/ThemeUtils";

class Header extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <AppBar position="static">
        <Toolbar
          className={classes.root}
          id={"mainHeader"}
          style={{ width: "auto" }}
        >
          <NavLink to={"/"}>
            <img
              src="/images/democrasee_logo_white.png"
              alt={"logo"}
              height={50}
              style={{ marginRight: 10 }}
            />
          </NavLink>
          <div style={{ textAlign: "left" }}>
            <img
              src="/images/democrasee_text_white.png"
              alt={"democrasee"}
              height={20}
            />
            <div className={classes.slogan}>Incentivizing Civic Action</div>
          </div>

          <Grid
            container
            style={{ flexGrow: 1 }}
            justify={"space-around"}
            alignContent={"center"}
          >
            <NavLink to={"/rallies"}>Rallies</NavLink>
            <NavLink to={"/resources"}>Resources</NavLink>
          </Grid>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(rallyStyles, { withTheme: true })(Header);
