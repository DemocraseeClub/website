import React from "react";
import {withStyles} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import CircularProgress from '@material-ui/core/CircularProgress';


class About extends React.Component {
  scrollTo(t) {
    document
      .getElementById("teamstory-" + t.displayName)
      .scrollIntoView({ block: "start", behavior: "smooth" });
  }

  constructor(props) {
    super(props);
    this.state = { team: [], loading: true };
  }

  componentWillMount() {

    fetch(process.env.REACT_APP_FUNCTIONS_URL + "/users/board")
      .then(resp => resp.json())
      .then(async data => {
        //get the images urls
        for (let i = 0; i < data.length; i++) {
          if (data[i].picture) {
            let path = window.storage.ref(data[i].picture);
            const url = await path.getDownloadURL();
            data[i].picture = url;
          }
        }

        return data;

      })
      .then(team => this.setState({ team , loading: false }))
      .catch(err => console.log(err));


    // window.fireDB
    //   .collection("users")
    //   .where("roles", "array-contains", "board")
    //   .get()
    //   .then((users) => {
    //     let auxTeam = [];
    //     users.forEach((doc) => auxTeam.push({ key: doc.id, ...doc.data() }));
    //     return auxTeam;
    //   })
    //   .then((auxTeam) => {
    //     (async function () {
    //       for (let i = 0; i < auxTeam.length; i++) {
    //         if (auxTeam[i].picture) {
    //           let path = window.storage.ref(auxTeam[i].picture);
    //           const url = await path.getDownloadURL();
    //           auxTeam[i].picture = url;
    //         }
    //       }
    //       return auxTeam;
    //     })().then((t) => {
    //       this.setState({ team: t, loading: false });
    //     });
    //   })
    //   .catch((err) => console.log(err));
  }

  render() {
    // const {classes} = this.props;
    const { team, loading } = this.state;

    if (loading) {
      return (<div style={{display: "grid", placeItems: "center", width: "100%"}}><CircularProgress /></div>)
    } else {
      return (
        <div style={{ marginTop: 30, marginBottom: 30 }}>
          <h1 style={{ textAlign: "center", marginBottom: 40 }}>
            Board of Directors
          </h1>
          <Grid container justify={"space-around"} alignContent={"center"}>
            {team.map((t) => (
              <Grid
                item
                key={t.key}
                style={{ textAlign: "center", cursor: "pointer" }}
                onClick={(e) => this.scrollTo(t)}
              >
                <Avatar
                  alt={t.displayName}
                  src={t.picture}
                  className={this.props.classes.large}
                />
                <p>{t.displayName}</p>
              </Grid>
            ))}
          </Grid>

          {team.map((t) => (
            <Paper
              key={t.key}
              id={"teamstory-" + t.displayName}
              style={{ padding: 10, margin: "20px 10px" }}
            >
              <Grid container>
                <Grid item xs={1}>
                  <Avatar alt={t.displayName} src={t.picture} />
                </Grid>
                <Grid
                  item
                  xs={11}
                  dangerouslySetInnerHTML={{ __html: t.bio }}
                ></Grid>
              </Grid>
            </Paper>
          ))}
        </div>
      );
    }
  }
}

const useStyles = (theme) => ({
  root: {
    width: "100%",
  },
  large: {
    width: 100,
    height: 100,
  },
});

export default withStyles(useStyles, { withTheme: true })(About);
