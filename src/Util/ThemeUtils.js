export function lightOrDark(color) {

    // Variables for red, green, blue values
    var r, g, b, hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/rgba\(\s*(-?\d+|-?\d*\.\d+(?=%))(%?)\s*,\s*(-?\d+|-?\d*\.\d+(?=%))(\2)\s*,\s*(-?\d+|-?\d*\.\d+(?=%))(\2)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/);
        r = color[1];
        g = color[2];
        b = color[3];
    } else {

        // If RGB --> Convert it to HEX: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace(
            color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        // eslint-disable-next-line
        g = color >> 8 & 255;
        // eslint-disable-next-line
        b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 127.5) {

        return 'light';
    } else {

        return 'dark';
    }
}

export const rallyStyles = theme => ({
    root: {
        width: '100%',
    },
    title : {
        fontSize:46,
        fontWeight:100
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    popPadding: {
        padding: theme.spacing(1),
    },
    actionsContainer: {
        textAlign:'left',
        marginTop: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
    stepSection: {
        paddingLeft:20, marginBottom:10
    },
    stepTimeBlock : {
        fontSize:19,
    },
    stepLabel : {
        paddingLeft:20,
        display:"flex",
        justifyContent: 'space-between',
        alignContent: 'center'
    },
    stepLabelText : {
        fontSize:19,
        fontWeight:700,
    },
    stepContent : {
        paddingLeft:45,
        paddingBottom:10,
        borderBottom:'1px solid #ccc'
    },
    topLevelLabel : {
        backgroundColor:theme.palette.primary.main,
        color:theme.palette.primary.contrastText,
        display:'flex',
        justifyContent:'space-between',
        alignContent:'center',
        textAlign:'left',
        padding:10,
        fontSize:26,
        fontWeight:900,
        borderRadius:'5px 5px 0 5px'
    },
    field: {
        margin:theme.spacing(1)
    }
});
