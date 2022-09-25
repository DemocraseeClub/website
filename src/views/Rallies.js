import React from "react";
import {withStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {NavLink} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {withSnackbar} from "notistack";
import {rallyStyles} from "../Util/ThemeUtils";
import {withRouter} from "react-router";
import Masonry from "react-masonry-css";
import RallyItem from "../components/RallyItem";
import RallySkeleton from "../components/RallySkeleton";
import API from "../Util/API";
import Drupal2Json from "../Util/Drupal2Json";

class Rallies extends React.Component {
    constructor(p) {
        super(p);
        this.state = {error: false, loading: true, rallies: []};
    }

    componentDidMount() {
        this.handleChange();
    }

    async handleChange() {
        API.Get('/api/rallies').then(res => {
            let rallies = res.data;
            this.setState({loading: false, rallies: rallies, error: false});
        }).catch(e => {
            console.error(e);
            this.setState({loading: false, error: e.message});
        })
    }

    render() {
        const {classes} = this.props;

        return (
            <React.Fragment>
                 <Grid container className="ralliesheader">
                  <Grid item sm={12}>
                        <NavLink
                            to={"/templates"}
                            style={{textDecoration: "none", marginRight: 5}}
                        >
                            <Button variant={"contained"} color={"secondary"}>
                                Meeting Templates
                            </Button>
                        </NavLink>
                      <NavLink
                          to={"/forms/rallies/"}
                          style={{textDecoration: "none", marginRight: 5}}
                      >
                        <Button
                            variant={"contained"}
                            className={classes.redBtn}>
                            Start a Rally
                        </Button>
                      </NavLink>
                 </Grid>
                </Grid>

                <Masonry
                    breakpointCols={{
                        default: 3,
                        1100: 2,
                        700: 1,
                    }}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {
                        this.state.error !== false
                            ? <Typography variant={"h4"}>{this.state.error}</Typography>
                            : this.state.loading
                            ? ([1, 2, 3, 4, 5, 6]).map(i => <RallySkeleton key={"skeleton" + i}/>)
                            : this.state.rallies.map((item, key) => <RallyItem item={item} key={"rallyItem" + key}/>)
                    }
                </Masonry>
            </React.Fragment>
        );
    }
}

export default withStyles(rallyStyles, {withTheme: true})(
    withSnackbar(withRouter(Rallies))
);
