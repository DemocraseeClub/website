import React, {ReactNode, useEffect, Component} from "react";

import {
    Authenticator,
    CMSAppProvider,
    NavigationBuilder,
    NavigationBuilderProps, useAuthContext,
    useSideEntityController
} from "@camberi/firecms";

import firebase from "firebase/app";
import "typeface-rubik";
import "../../theme/FirebaseCMS.css";

import {logInSuccess} from "../../redux/authActions";
import {useSelector} from 'react-redux'

import buildUserCollection from "./collections/user";
import buildResourceCollection from "./collections/resource";
import buildResourceTypeCollection from "./collections/resource_types";
import buildTopicCollection from "./collections/topic";
import buildStateCollection from "./collections/state";
import buildStakeholderCollection from "./collections/stakeholder";
import buildRallyCollection from "./collections/rally";
import buildPartyCollection from "./collections/party";
import buildPageCollection from "./collections/page";
import buildOfficialCollection from "./collections/official";
import buildMeetingTypeCollection from "./collections/meeting_types";
import buildInviteCollection from "./collections/invite";
import buildCityCollection from "./collections/city";
import buildActionPlanCollection from "./collections/action_plan";
import wiseDemoCollection from "./collections/wise_demo";

import {useLocation, useHistory} from "react-router-dom";

import {Box, CircularProgress} from "@material-ui/core";


const firebaseConfig = {
    apiKey: "AIzaSyAlMzICClI1d0VPAs5zGmyOO6JEUqLQAic",
    authDomain: "democraseeclub.firebaseapp.com",
    databaseURL: "https://democraseeclub.firebaseio.com",
    projectId: "democraseeclub",
    storageBucket: "democraseeclub.appspot.com",
    messagingSenderId: "1051506392090",
    appId: "1:1051506392090:web:721f69ed2b5afde2a4a5a3",
    measurementId: "G-XYVYDC8L1N",
};

async function getUserData(uid: string) {
    const roomRef = firebase.firestore().collection("users").doc(uid)
    const data = await roomRef.get();
    return (data.exists) ? data.data() : {};
}

/* type Props = {
    children : ReactNode,
    dispatch: Function
}
 */

export function withCmsHooks(PassedComponent: any) {
    return function WrappedComponent(props: object) {
        const sideEntityController = useSideEntityController();
        const authController = useAuthContext();
        return <PassedComponent {...props} sideEntityController={sideEntityController} authController={authController}/>;
    }
}

export function FirebaseCMS(props: any) {

    // const [userDB] = useState<firebase.firestore.DocumentData>();
    // const {pathname} = useLocation()
    // let history = useHistory();

    const [
        firebaseConfigInitialized,
        setFirebaseConfigInitialized
    ] = React.useState<boolean>(false);

    useEffect(() => {
        if (firebase.apps.length === 0) {

            try {
                const fbApp = firebase.initializeApp(firebaseConfig);
                (window as any).storage = fbApp.storage();
                (window as any).fireDB = fbApp.firestore();
                if (document.location.hostname === 'localhost') {
                    fbApp.functions().useEmulator("localhost", 3032);
                    fbApp.auth().useEmulator("http://localhost:3033");
                    (window as any).fireDB.useEmulator("localhost", 3031);
                }
                if (document.location.port.length === 0) { // ignore dev environments
                    (window as any).logUse = fbApp.analytics();
                } else {
                    (window as any).logUse = { logEvent: (e:any, d:any) => console.log('FB LOG ' + e, d), setUserProperties: (o:any) => console.log('FB SET ', o) };
                }
                console.log("FIREBASE INITIALIZED");
                setFirebaseConfigInitialized(true);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);


    const navigation: NavigationBuilder = ({user}: NavigationBuilderProps) => {

        let userDB = user;

        if (user && user !== null) {
            /* if (user.uid === '6ofNl8umwIzcB8AEJSC2' || user.uid === 'DJOKTiAz17pEx9o9vNIY' || user.uid === 'LkiBXF99GQlWCcDSN8Qk' || user.uid === 'XKNZEbK5h6tigCFoCuDV') {
                // userDB.admin = true;
            } */
            // console.log("USER " + user.uid, user.toJSON())
            // let userDB = getUserData(user.uid);
            console.log(userDB?.toJSON());

            return {
                collections: [
                    buildUserCollection(userDB),
                    buildResourceCollection(userDB),
                    buildResourceTypeCollection(userDB),
                    buildTopicCollection(userDB),
                    buildStateCollection(userDB),
                    buildStakeholderCollection(userDB),
                    buildRallyCollection(userDB),
                    buildPartyCollection(userDB),
                    buildPageCollection(userDB),
                    buildOfficialCollection(userDB),
                    buildMeetingTypeCollection(userDB),
                    buildInviteCollection(userDB),
                    buildCityCollection(userDB),
                    buildActionPlanCollection(userDB),
                    wiseDemoCollection
                ]
            }
        } else {
            return {
                collections: [
                    buildResourceCollection(userDB),
                    buildRallyCollection(userDB),
                    buildActionPlanCollection(userDB)
                ]
            }
        }
    };

    const myAuthenticator: Authenticator = async (user?: firebase.User) => {
        console.log("Allowing access to", user);
        if (user) {
            // console.log(state.auth, "auth")
            /* if(pathname === "/login") { // move to login component
                window.location.pathname = "/home"
            }  */
            /* TODO: post user.providerData to http://localhost:3032/democraseeclub/us-central1/syncUser
            let firestoreUser = ...
            let mergedUser = {
                displayName:
                cover: firebase.user.photoURL
            }
            */
        }
        return true;
    };

    if (!firebaseConfigInitialized) {
        return <Box display="flex" width={"100%"} height={"100vh"}>
            <Box m="auto">
                <CircularProgress/>
            </Box>
        </Box>
    }

    const {children, ...others} = props;

    return (
        <div className="cms-container">
            <CMSAppProvider
                authentication={myAuthenticator}
                signInOptions={[
                    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                ]}
                navigation={navigation}
                firebaseConfig={firebaseConfig}
                {...others}
            >
                {props.children}
            </CMSAppProvider>
        </div>
    );
}

export default FirebaseCMS;
