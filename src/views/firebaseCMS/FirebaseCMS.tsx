import React, {useEffect, useRef, useState} from "react";

import {Authenticator, CMSApp, NavigationBuilder, NavigationBuilderProps,} from "@camberi/firecms";

import firebase from "firebase/app";
import "typeface-rubik";
import "../../theme/FirebaseCMS.css";

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
import buildMeetingCollection from "./collections/meeting";
import buildMeetingTypeCollection from "./collections/meeting_types";
import buildInviteCollection from "./collections/invite";
import buildCityCollection from "./collections/city";
import buildActionPlanCollection from "./collections/action_plan";


// This is the actual config
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

/*
const updateUserRole = (userDB: firebase.firestore.DocumentData) => {
    if (userDB?.uids) {

        // ??? shouldn't this already be defined!?!?
        if (userDB?.admin) {
            userDB.uids.forEach(async (uid: string) => {
                firebase.firestore().collection('roles').doc(uid).update({
                    role: "ROLE_ADMIN"
                });
            })

        } else {
            userDB.uids.forEach(async (uid: string) => {
                firebase.firestore().collection('roles').doc(uid).update({
                    role: "ROLE_USER"
                })
            })
        }
    }
}
 */

export function FirebaseCMS() {

    const [userDB, setUserDB] = useState<firebase.firestore.DocumentData>();

    /*
    const flag = useRef(false);
    useEffect(() => {

        if (userDB && !flag.current) {
            flag.current = true;
            updateUserRole(userDB)
        }

    }, [userDB])
     */

    const navigation: NavigationBuilder = ({user}: NavigationBuilderProps) => {

        if (userDB?.admin) {

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
                    buildMeetingCollection(userDB),
                    buildMeetingTypeCollection(userDB),
                    buildInviteCollection(userDB),
                    buildCityCollection(userDB),
                    buildActionPlanCollection(userDB)
                ],
            }

        } else {

            return {
                collections: [
                    buildResourceCollection(userDB),
                    buildRallyCollection(userDB),
                    buildMeetingCollection(userDB),
                    buildActionPlanCollection(userDB)
                ],
            }

        }

    };

    const myAuthenticator: Authenticator = async (user?: firebase.User) => {
        console.log("Allowing access to", user);
        if (user) {
            let prop = user.email ? 'email' : 'phone'

            const resp = await firebase.firestore()
                .collection("users")
                .where(prop, "==", prop === 'email' ? user.email : user.phoneNumber)
                .get();
            if (resp.size > 0) {
                let auxUser: any
                if (resp.size > 1) {
                    console.error("!!!!DUPLICATE USERS!!!!", resp);
                }

                resp.forEach(doc => {
                    auxUser = {...doc.data(), id: doc.id}
                });


                // porque uids???
                let uids = new Set([...auxUser.uids])
                uids.add(user?.uid)

                await firebase.firestore().collection("users").doc(auxUser?.id).update({
                    uids: Array.from(uids)
                })

                await firebase.firestore().collection('roles').doc(user?.uid).set({ // huh?
                    email: user?.email, phone: user?.phoneNumber
                })

                auxUser.uids = Array.from(uids);
                setUserDB(auxUser);
            }
        }

        return true;
    };

    return (
        <div className="cms-container">
            <CMSApp
                name={"Democraseeclub"}
                authentication={myAuthenticator}
                allowSkipLogin={true}
                signInOptions={[
                    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                ]}
                navigation={navigation}
                firebaseConfig={firebaseConfig}
                primaryColor={"#095760"}
                secondaryColor={"#B9DFF4"}
            />
        </div>
    );
}

export default FirebaseCMS;
