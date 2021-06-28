import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {rallyStyles} from "../Util/ThemeUtils";
import {Card, CardActions, CardContent,} from "@material-ui/core";
import CardActionArea from "@material-ui/core/CardActionArea";
import Skeleton from "@material-ui/lab/Skeleton";
import Button from "@material-ui/core/Button";

class RallySkeleton extends React.Component {

    render() {
        const {classes} = this.props;

        return (
            <Card className={classes.cardSkeleton}>
                <CardActionArea>
                    <Skeleton variant="rect" width="100%" height={200}/>
                    <CardContent>
                        <Skeleton width="40%"/>
                        <Skeleton/>
                        <Skeleton/>
                        <Skeleton/>
                    </CardContent>
                </CardActionArea>
                <CardActions style={{justifyContent: "space-between"}}>
                    <Button size="small" color="primary">
                        View
                    </Button>
                    <Button size="small" color="primary">
                        Join
                    </Button>
                </CardActions>
            </Card>)
    }
}

export default withStyles(rallyStyles, {withTheme: true})(RallySkeleton);
