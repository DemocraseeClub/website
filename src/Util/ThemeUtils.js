export function lightOrDark(color) {
  // Variables for red, green, blue values
  var r, g, b, hsp;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If HEX --> store the red, green, blue values in separate variables
    color = color.match(
      /rgba\(\s*(-?\d+|-?\d*\.\d+(?=%))(%?)\s*,\s*(-?\d+|-?\d*\.\d+(?=%))(\2)\s*,\s*(-?\d+|-?\d*\.\d+(?=%))(\2)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/
    );
    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, "$&$&"));

    r = color >> 16;
    // eslint-disable-next-line
    g = (color >> 8) & 255;
    // eslint-disable-next-line
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return "light";
  } else {
    return "dark";
  }
}

export const rallyStyles = (theme) => ({
  root: {
    width: "100%",
    alignContent: "center",
    "& a": {
      color: theme.palette.secondary.contrastText,
      textDecorationLine: "none",
      alignSelf: "center",
    },
  },
  paperRoot: {
    width: "100%",
    textAlign: "left",
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    "& a": {
      color: "inherit",
      textDecorationLine: "none",
    },
  },
  title: {
    fontSize: 46,
    fontWeight: 100,
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  redBtn: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    textDecoration: "none!important",
  },
  popPadding: {
    padding: theme.spacing(1),
  },
  actionsContainer: {
    textAlign: "left",
    marginTop: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  stepSection: {
    paddingLeft: 0,
    marginBottom: 14,
    marginTop: 10,
  },
  stepTimeBlock: {
    fontSize: 19,
  },
  stepLabel: {
    paddingLeft: 20,
    display: "flex",
    justifyContent: "space-between",
    alignContent: "center",
  },
  stepLabelText: {
    fontSize: 19,
    fontWeight: 700,
  },
  stepContent: {
    paddingLeft: 45,
    paddingBottom: 10,
    borderBottom: "1px solid #ccc",
  },
  topLevelLabel: {
    color: theme.palette.primary.main,
    display: "flex",
    boxShadow: "1px 1px 3px 2px #e6e6e6",
    justifyContent: "space-between",
    alignContent: "center",
    textAlign: "left",
    padding: 10,
    fontSize: 26,
    fontWeight: 900,
    borderRadius: "0px 5px 5px 0px",
  },
  field: {
    marginBottom: theme.spacing(2),
  },
  tabsVert: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    width: 45,
    height: "100%",
  },
  tabsHorz: {
    width: "100%",
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    borderRadius: "5px 5px 0 0",
  },
  spaceAround: {
    justifyContent: "space-around",
  },
  tabsIcon: {
    minWidth: 25,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  agendaContent: {
    position: "relative",
    display: "flex",
    wrap: "nowrap",
    justifyContent: "space-between",
  },
  hide: {
    display: "none",
  },
  drawer: {
    position: "relative",
    right: 0,
    top: 0,
    flexShrink: 0,
  },
  drawerInner: {
    position: "relative",
    right: 0,
    top: 0,
  },
  vertStepper: {
    flexGrow: 1,
    padding: "24px 14px 24px 14px",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
  hScrollContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    overflow: "hidden",
    textAlign: "center",
    height: 285,
    transition: theme.transitions.create("height", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  hScroller: {
    display: "flex",
    justifyContent: "space-between",
    alignContent: "center",
    flexWrap: "nowrap",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
  },
  hScrollItem: {
    display: "inline-block",
    textAlign: "center",
  },
  roundtable: {
    position: "relative",
    textAlign: "center",
    backgroundImage: "url('/images/roundtable.png')",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    objectFit: "contain",
    backgroundSize: "contain",
    height: 400,
    width: 400,
    margin: "auto",
  },
  roundtableSeat: {
    backgroundColor: theme.palette.divider,
    width: 300,
    padding: 3,
    borderRadius: 5,
    position: "absolute",
    "& .MuiListItemText-multiline": {
      margin: 0,
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    "& .MuiListItemText-secondary": {
      fontSize: 10,
    },
  },
  section: {
    background: theme.palette.background.default,
    padding: "5%",
  },
  sectionSecondary: {
    background: theme.palette.secondary.main,
    padding: "5%",
  },
  sectionTitle: {
    marginBottom: "10px",
  },
  sectionSubtitle: {
    marginBottom: "20px",
    fontWeight: "normal",
    width: "75%",
  },
  sectionItemsContainer: {
    marginBottom: "15px",
  },
  sectionItemText: {
    width: "50%",
    color: "gray",
  },
  sectionItemImg: {
    marginRight: "10px",
  },
  sectionLeftButton: {
    border: `1px solid ${theme.palette.error.main}`,
    color: theme.palette.error.main,
    textTransform: "none",
    marginRight: "15px",
    padding: "5px 10px",
  },
  sectionRightButton: {
    background: theme.palette.error.main,
    color: "white",
    textTransform: "none",
    padding: "5px 20px",
    "&:hover": {
      background: theme.palette.error.main,
      color: "white",
    },
  },
  sectionHero: {
    height: "200px",
  },
  sectionSelect: {
    // width: "15ch",
  },
  cardsContainer: {
    marginTop: "15px",
  },
  cardMedia: {
    width: "100%",
    height: "100%",
  },
  cardSkeleton: {
    width: "100%",
    height: "100%",
  },
  card: {
    margin: 0,
    width: "100%",
  },
  cardButton: {
    padding: "5%",
    background: theme.palette.info.main,
    color: theme.palette.info.contrastText,
    textTransform: "none",
    "&:hover": {
      background: theme.palette.info.main,
      color: theme.palette.info.contrastText,
    },
  },
  cardHeader: {
    marginBottom: "15px",
  },
  cardSubtitle: {
    marginBottom: "15px",
  },
  cardLink: {
    color: theme.palette.info.main,
    textDecoration: "underline",
  },
  sectionLink: {
    color: theme.palette.info.main,
    textDecoration: "underline",
    marginLeft: "100px",
  },
  sectionFooter: {
    marginTop: "50px",
  },
  outlinedButton: {
    padding: "10px 40px",
    border: `1px solid ${theme.palette.info.main}`,
    color: theme.palette.info.main,
    textTransform: "none",
  },
  infoColor: {
    color: theme.palette.info.main,
  },
  primaryColor: {
    color: theme.palette.primary.main,
  },
  errorColor: {
    color: theme.palette.error.main,
  },
  slogan: {
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.8px",
    color: theme.palette.background.default,
  },
  paragraph: {
    lineHeight: "23px",
    paddingLeft: 10,
    paddingRight: 10,
  },
  menuList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    "& li": {
      marginBottom: 10,
    },
  },
  profilePicture: {
    width: "140px",
    height: "140px",
    position: "absolute",
    left: "10%",
    border: "6px solid white",
    bottom: "-70px",
    boxShadow: "0px 0px 25px 0px rgba(0,0,0,0.56)",
  },
  profileName: {
    margin: "25px 0 15px",
    fontSize: "2.5em",
  },
  profileProfession: {
    display: "block",
    marginBottom: "10px",
  },
  profileMainInfoContainer: {
    marginLeft: "25%",
  },
  profileChip: {
    margin: "5px 15px 5px 0",
  },
  profileBioContainer: {
    margin: "2% 10%",
  },
  profileBio: {
    textAlign: "justify",
  },
});
