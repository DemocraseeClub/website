import React, { Component } from "react";
import VideoRecorder from "react-video-recorder"; // maybe better choice: https://www.npmjs.com/package/react-media-recorder ?
import { updateMediaField } from "../../redux/formsReducer";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { requestDeposit } from "../../redux/walletReducer";
import OndemandVideo from "@material-ui/icons/OndemandVideo";
import { loadFaq } from "../../redux/helpReducer";

class MediaRecorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filedata: false,
      mediatype: false,
      mediaTitle: "",
      ppp:
        typeof window.store.getState().auth.gFeatures["media:ppp"] === "number"
          ? window.store.getState().auth.gFeatures["media:ppp"]
          : 0.0,
    };
    this.actionHandler = this.actionHandler.bind(this);
    this.handleRecordingComplete = this.handleRecordingComplete.bind(this);

    this.onTitleChange = this.onTitleChange.bind(this);
    this.onRateChange = this.onRateChange.bind(this);
    this.handleFaq = this.handleFaq.bind(this);
  }

  actionHandler(e) {
    console.log(e);
  }

  handleRecordingComplete(e) {
    // console.log(e);
    this.setState({ filedata: e, mediatype: e.type });
  }

  onTitleChange(e) {
    this.setState({ mediaTitle: e.target.value });
  }

  onRateChange(e) {
    this.setState({ ppp: parseFloat(e.target.value).toFixed(3) });
  }

  submitForm(currency) {
    if (this.state.mediaTitle.length === 0 || this.state.filedata === false) {
      alert("please provide a file and name");
      return false;
    }
    var ext = this.state.mediatype.split("/")[1];
    if (ext.indexOf(";") > 0) {
      ext = ext.split(";")[0];
    }
    this.props.dispatch(
      updateMediaField(
        this.state.filedata,
        this.state.mediaTitle + "." + ext,
        this.state.mediaTitle,
        this.state.ppp,
        this.props.profile.uid[0].value,
        currency
      )
    );
  }

  handleFaq(evt, nid) {
    evt.preventDefault();
    this.props.dispatch(loadFaq(nid, "dialog"));
    return false;
  }

  render() {
    const { classes, field } = this.props;
    const isLoading =
      this.props.forms.files &&
      this.props.forms.files[field.field_name] === "loading";
    const isArtist =
      typeof this.props.profile.roles["artist"] === "number" ? true : false;

    return (
      <div>
        {isArtist === false ? (
          <p>
            For quality control, we charge ₮5 TAC or $2 USD to register as an
            Artist so you may upload your own recordings. Read our{" "}
            <a
              rel="canonical"
              href="https://api.trackauthoritymusic.com/sharer/faqs/100724"
              onClick={(e) => this.handleFaq(e, 100725)}
            >
              Artist Registry Policy
            </a>{" "}
          </p>
        ) : (
          ""
        )}

        <Button onClick={(e) => window.alert("Feature not ready")}>
          Start Shared Recording
        </Button>
        <Button onClick={(e) => window.alert("Feature not ready")}>
          Join Shared Recording
        </Button>

        <VideoRecorder
          renderDisconnectedView={(e) => <OndemandVideo />}
          showReplayControls
          onRecordingComplete={this.handleRecordingComplete}
          onOpenVideoInput={this.actionHandler}
          onError={this.actionHandler}
          style={{ maxWidth: 600 }}
        />

        <FormControl fullWidth style={{ marginTop: 20 }}>
          <Grid container wrap="nowrap">
            {this.state.filedata === false ? (
              ""
            ) : (
              <Grid item style={{ flexGrow: 1 }}>
                <TextField
                  label="Name your recording"
                  value={this.state.mediaTitle}
                  fullWidth
                  required={true}
                  variant="outlined"
                  onChange={this.onTitleChange}
                />
              </Grid>
            )}
            {typeof window.store.getState().auth.gFeatures["media:ppp"] ===
            "number" ? (
              <Grid item xs={3}>
                <TextField
                  label="Pay per Play (PPP)"
                  value={this.state.ppp}
                  variant="outlined"
                  fullWidth
                  required={true}
                  InputProps={{
                    autoComplete: "off",
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  onChange={this.onRateChange}
                />
              </Grid>
            ) : (
              ""
            )}
          </Grid>
        </FormControl>

        <Grid container spacing={1} className={classes.inlineBulletList}>
          {this.state.mediaTitle.length === 0 ||
          this.state.filedata === false ? (
            ""
          ) : isArtist === true ? (
            <Button
              color="secondary"
              variant="contained"
              onClick={(e) => this.submitForm("tac")}
              disabled={isLoading}
            >
              UPLOAD
            </Button>
          ) : (
            <>
              <Grid item>
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={(e) => this.submitForm("tac")}
                  disabled={isLoading || this.props.profile.wallet.tac < 5}
                >
                  UPLOAD AND PAY ₮5 ₮AC
                </Button>
              </Grid>
              <Grid item>
                {this.props.profile.wallet.usd < 2 ? (
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={(e) =>
                      this.props.dispatch(
                        requestDeposit(
                          2,
                          "Please deposit at least $" +
                            (2 - this.props.profile.wallet.usd)
                        )
                      )
                    }
                  >
                    DEPOSIT USD
                  </Button>
                ) : (
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={(e) => this.submitForm("usd")}
                    disabled={isLoading}
                  >
                    UPLOAD AND PAY $2 USD
                  </Button>
                )}
              </Grid>
            </>
          )}
        </Grid>

        <Grid container spacing={1} className={classes.inlineBulletList}>
          <a
            rel="canonical"
            href="https://api.trackauthoritymusic.com/sharer/faqs/100724"
            onClick={(e) => this.handleFaq(e, 100661)}
          >
            Copyrights Policy
          </a>
          <span>&nbsp; &#x25CF; &nbsp;</span>
          <a
            rel="canonical"
            href="https://api.trackauthoritymusic.com/sharer/faqs/100723"
            onClick={(e) => this.handleFaq(e, 100723)}
          >
            Paid-Per-Play Policy
          </a>
        </Grid>
      </div>
    );
  }
}

const styles = (theme) => ({
  mediaEl: {
    width: "100%",
    minHeight: 20,
    margin: "8px 0",
  },
  uploadBtn: {
    width: "100%",
    textTransform: "none",
    margin: "8px 0",
  },
  videoEl: {
    maxHeight: "90vh",
    maxWidth: "100%",
    minHeight: 250,
    margin: "8px 0",
  },
  inlineBulletList: {
    flexDirection: "row-reverse",
    textAlign: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
    letterSpacing: 1,
    fontWeight: 600,
    lineHeight: "26px",
    "& a": {
      textDecoration: "none",
    },
  },
});

export default withStyles(styles)(MediaRecorder);
