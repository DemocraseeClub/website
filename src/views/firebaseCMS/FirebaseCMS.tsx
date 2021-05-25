import React, {useEffect, useState} from "react";

import {
    Authenticator,
    CMSAppProvider,
    NavigationBuilder,
    NavigationBuilderProps,
    useAuthContext,
    useSideEntityController
} from "@camberi/firecms";

import firebase from "firebase/app";
import "typeface-rubik";
import "../../theme/FirebaseCMS.css";
import buildSubscriptionCollection from "./collections/subscriptions";
import buildUserCollection from "./collections/user";
import buildResourceCollection from "./collections/resource";
import buildResourceTypeCollection from "./collections/resource_types";
import buildTopicCollection from "./collections/topic";
import buildStateCollection from "./collections/state";
import buildStakeholderCollection from "./collections/stakeholder";
import buildRallyCollection from "./collections/rally";
import buildPartyCollection from "./collections/party";
import buildOfficialCollection from "./collections/official";
import buildMeetingTypeCollection from "./collections/meeting_types";
import buildCityCollection from "./collections/city";
import buildActionPlanCollection from "./collections/action_plan";
import wiseDemoCollection from "./collections/wise_demo";
import {Box, CircularProgress} from "@material-ui/core";
// import {useSelector} from 'react-redux'

// import {useLocation} from "react-router-dom";


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

interface FbUser {
    email: string,
    phoneNumber: string,
    displayName: string,
    website: string,
    bio: string,
    picture: string,
    coverPhoto: string,
    roles: Array<string>
}

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

export function withCmsHooks(PassedComponent: any) {
    return function WrappedComponent(props: object) {
        const sideEntityController = useSideEntityController();
        const authController = useAuthContext();
        return <PassedComponent {...props} sideEntityController={sideEntityController}
                                authController={authController}/>;
    }
}

export function FirebaseCMS(props: any) {

    const [fbUser, setFbUser] = useState<FbUser>();
    // const {pathname} = useLocation();
    // const state: any = useSelector(state => state) //global state

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
                if (process.env.REACT_APP_FUNCTIONS_URL && process.env.REACT_APP_FUNCTIONS_URL.indexOf('http://localhost:') === 0) {
                    fbApp.functions().useEmulator("localhost", 5001);
                    fbApp.auth().useEmulator("http://localhost:9099");
                    (window as any).fireDB.useEmulator("localhost", 8080);
                }
                if (document.location.port.length === 0) { // ignore dev environments
                    (window as any).logUse = fbApp.analytics();
                } else {
                    (window as any).logUse = {
                        logEvent: (e: any, d: any) => console.log('FB LOG ' + e, d),
                        setUserProperties: (o: any) => console.log('FB SET ', o)
                    };
                }
                console.log("FIREBASE INITIALIZED");
                setFirebaseConfigInitialized(true);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);


    const navigation: NavigationBuilder = ({user}: NavigationBuilderProps) => {
        console.log('navigation fb user: ', user, fbUser)
        const navItems = [];

        if (user?.emailVerified === true) {
            navItems.push(
                buildResourceCollection(user, fbUser),
                buildRallyCollection(user, fbUser),
                buildActionPlanCollection(user, fbUser)
            )
            if (fbUser?.roles.includes('editor')) {
                navItems.push(
                    buildMeetingTypeCollection(user, fbUser),
                    buildSubscriptionCollection(user, fbUser),
                    buildTopicCollection(user, fbUser),
                    buildResourceTypeCollection(user, fbUser),
                    buildStateCollection(user, fbUser),
                    buildStakeholderCollection(user, fbUser),
                    buildPartyCollection(user, fbUser),
                    buildOfficialCollection(user, fbUser),
                    buildCityCollection(user, fbUser),
                    wiseDemoCollection(user, fbUser)
                )
            }
            if (fbUser?.roles.includes('admin')) {
                navItems.push(buildUserCollection(user, fbUser))
            }
        }
        // console.log(navItems);
        return {collections: navItems};
    };

    const myAuthenticator: Authenticator = async (user?: firebase.User) => {
        console.log("Allowing access to", user?.toJSON());
        if (user) {

            let authUser = user.toJSON();
            let idToken = await user.getIdToken(true).then(idToken => idToken);
            console.log("sync with " + idToken, authUser);

            await postData(process.env.REACT_APP_FUNCTIONS_URL + '/syncUser', {authUser, idToken})
                .then(data => {
                    if (!data) {
                        console.error("invalid sync request")
                    } else if (data.message) {
                        console.error(data.message);
                    } else {
                        console.log('setting fbUser', data);
                        setFbUser(data);
                    }
                    // TODO: set mergedUser redux store or ideally FireCMS authContext() - awaiting answer from https://github.com/Camberi/firecms/issues/72
                    // authController.setAuthResult(mergedUser);
                    return data
                })
                .catch(e => console.error(e))

            return true;
        }
        return false;
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
                    firebase.auth.PhoneAuthProvider.PROVIDER_ID
                ]}
                allowSkipLogin={false}
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
