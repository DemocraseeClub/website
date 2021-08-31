import React from "react";
import {withStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {NavLink} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {withSnackbar} from "notistack";
import {rallyStyles} from "../Util/ThemeUtils";
import {withRouter} from "react-router";
import {normalizeRally} from "../redux/entityDataReducer";
import Masonry from "react-masonry-css";
import RallyItem from "../components/RallyItem";
import RallySkeleton from "../components/RallySkeleton";
import API from "../Util/API";
import MyJsonApi from "../Util/MyJsonApi";

class Rallies extends React.Component {
    constructor(p) {
        super(p);
        this.state = {error: false, loading: true, rallies: []};
    }

    componentDidMount() {
        this.handleChange();
    }

    async handleChange() {
        API.Get('/node/rallies?fields[file--file]=uri,url&include=field_topics.field_image,field_media.field_media_video_file,field_media.field_media_image').then(res => {
            let rallies = res.data.data.map(o => new MyJsonApi(o, res.data.included));
            this.setState({loading: false, rallies: rallies, error: false});
        }).catch(e => {
            console.error(e);
            this.setState({loading: false, error: e.message});
        })
    }

    showRallyForm() {
        if (this.props.authController && this.props.authController.loggedUser) {
            console.log(
                this.props.authContext,
                this.props.sideEntityController.sidePanels
            );
            this.props.sideEntityController.open({collectionPath: "/rallies"});
        } else {
            this.props.history.push("/signup");
        }
    }

    render() {
        const {classes} = this.props;

        const breakpoints = {
            default: 3,
            1100: 2,
            700: 1,
        };
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
                        <Button
                            variant={"contained"}
                            className={classes.redBtn}
                            onClick={() => this.showRallyForm()}
                        >
                            Start a Rally
                        </Button>
                 </Grid>
                </Grid>

                <Masonry
                    breakpointCols={breakpoints}
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
