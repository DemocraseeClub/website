import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SanitizedHTML from 'react-sanitized-html';
import PropTypes from 'prop-types';
import Check from '@material-ui/icons/CheckBox';
import Unchecked from '@material-ui/icons/CheckBoxOutlineBlank';
import {withSnackbar} from 'notistack';
import Config from '../Config';
import AgendaItemForm from "./AgendaItemForm";
import AgendaItemTools from "./AgendaItemTools";
import { formatSeconds} from "../Util/WindowUtils";
// import SvgIcon from '@material-ui/core/SvgIcon';
// import {ReactComponent as GoogleSheetsIcon} from '../assets/Google_Sheets_logo.png';
// import {ReactComponent as GoogleDocsIcon} from '../assets/Google_Docs_logo.png';

const useQontoStepIconStyles = makeStyles({
    root: {
        color: '#eaeaf0',
        display: 'flex',
        height: 22,
        alignItems: 'center',
    },
    active: {
        color: '#784af4',
    },
    circle: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
    },
    completed: {
        color: '#784af4',
        zIndex: 1,
        fontSize: 18,
    },
    timer: {
        fontSize: 11,
        fontWeight: 800,
        textAlign: 'center',
        display: 'block',
        textIndent: '-6px'
    }
});

function QontoStepIcon(props) {
    const classes = useQontoStepIconStyles();
    const {status, countdown} = props;

    let color = status === 'active' ? 'secondary' : 'primary';

    if (typeof countdown !== 'number') return <div className={classes.circle} />

    return (
        <div>
            {status === 'completed' ?
                <Check className={classes.completed} color={color}/> :
                <Unchecked color={color}/>
            }
            <span className={classes.timer}>{formatSeconds(countdown)}</span>
        </div>
    );
}

QontoStepIcon.propTypes = {
    status: PropTypes.string,
    countdown : PropTypes.number
};

QontoStepIcon.defaultProps = {
    status: "inactive"
}

class AgendaItem extends React.Component {

    renderOutline(outline, indent) {
        if (typeof outline === 'string') {
            return outline;
        }

        return outline.map((v, i) => {
            if (typeof v === 'string') {
                let liStyle = {paddingLeft: 30 * indent, display: 'list-item', listStylePosition: 'inside'}
                liStyle.listStyleType = indent % 2 === 0 ? 'disc' : Math.floor(indent / 2) % 2 === 0 ? 'circle' : 'square';
                return <div style={liStyle} key={indent + 'x' + i}>{v}</div>
            } else {
                return this.renderOutline(v, indent + 1);
            }
        })
    }

    render() {
        const {classes, curItem, index, activeStep} = this.props;

        return (
            <Step key={'step-' + index} active={this.props.forceShow === true || activeStep === index ? true : undefined} style={{marginBottom:10}} >
                {this.props.header}
                <StepLabel className={classes.stepTimeBlock}
                           StepIconComponent={QontoStepIcon}
                           StepIconProps={curItem}>
                    <div className={classes.stepLabel}>
                        <Typography style={{flexGrow:1}} className={classes.stepLabelText} variant={'h5'}>{curItem.title}</Typography>
                        {this.props.editMode === true ? <AgendaItemForm item={curItem} index={index} classes={classes} dispatch={this.props.dispatch}/> : null}
                    </div>
                </StepLabel>
                <StepContent className={classes.stepContent}>
                    <Grid container justify={'space-around'} spacing={0}>
                        <Grid item style={{fontSize: 20, flexGrow:1}}>
                            {curItem.html ?
                                <SanitizedHTML
                                    allowedIframeDomains={['youtube.com', 'google.com']}
                                    allowedIframeHostnames={['www.youtube.com', 'docs.google.com', 'sheets.google.com']}
                                    allowIframeRelativeUrls={false}
                                    allowedSchemes={[ 'data', 'https' ]}
                                    allowedTags={Config.allowedTags}
                                    allowedAttributes={Config.allowedAttributes}
                                    exclusiveFilter={frame => {
                                        if (frame.tag === 'iframe') {
                                            console.log(frame);
                                            if (frame.attribs.src.indexOf('https://docs.google.com') !== 0 && frame.attribs.src.indexOf('https://sheets.google.com') !== 0) {
                                                return true;
                                            }
                                        }
                                        return false;
                                    }}
                                    html={curItem.html} /> : null}

                            { (curItem.outline) ? this.renderOutline(curItem.outline, 0) : null }

                            {(activeStep === index) ?
                                    <div className={classes.actionsContainer} >
                                        {activeStep > 0 ?
                                            <Button size="small" onClick={this.props.handleBack}
                                                    className={classes.button}>Back</Button> : null
                                        }
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            endIcon={<Check/>}
                                            onClick={this.props.handleNext}
                                            className={classes.button} >
                                            Done
                                        </Button>
                                    </div> : null
                            }
                        </Grid>
                        { (curItem.tools === false) ? '' :
                            <Grid item >
                                <AgendaItemTools classes={classes} />
                            </Grid>
                        }
                    </Grid>
                </StepContent>
            </Step>

        );
    }
}

export default withSnackbar(AgendaItem);
