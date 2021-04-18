import React, {useState} from "react";

import {CMSApp} from "@camberi/firecms";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import "typeface-rubik";
import {navigationAdmin, navigationUser} from "./navigation";
import "../../theme/FirebaseCMS.css";
import {fbConfig} from '../../Config';

export function FirebaseCMS() {
    const [navigation, setNavigation] = useState(navigationUser);

    const myAuthenticator = async (user) => {

        console.log("Allowing access to", user?.email, user?.phoneNumber);
        console.log(user);
        try {

            const ref = user?.phoneNumber
                ?
                window.fireDB.collection('users').where("phone", "==", user.phoneNumber)
                :
                window.fireDB.collection('users').where("email", "==", user.email)


            const data = await ref.get()
            data.forEach((d) => {
                const userDB = d.data();

                const userRef = window.fireDB.collection('users').doc(`${d.id}`);
                const rolesRef = window.fireDB.collection('roles').doc(user.uid);

                let uids;
                console.log(userDB?.uids)
                if (!userDB?.uids) {
                    uids = [user.uid];

                } else {
                    let uidsAux = new Set([...userDB.uids, user.uid])
                    uids = Array.from(uidsAux)
                }

                const isAdmin = userDB.admin === true

                if (isAdmin) {
                    setNavigation(navigationAdmin);

                    rolesRef.set({
                        role: "ROLE_ADMIN",
                        email: user?.email,
                        phone: user?.phoneNumber
                    }).then(() => {

                        userRef.update({
                            uids
                        }).then(() => console.log("uids updated"))

                    })

                } else {
                    rolesRef.set({
                        role: "ROLE_USER",
                        email: user?.email,
                        phone: user?.phoneNumber
                    }).then(() => {

                        userRef.update({
                            uids
                        }).then(() => console.log("uids updated"))

                    })
                }
            })
        } catch (e) {
            console.log(e)
        }

        return true;
    }

    return (
        <div className="cms-container">
            <CMSApp
                name={"Democraseeclub"}
                authentication={myAuthenticator}
                allowSkipLogin={true}
                signInOptions={[
                    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    firebase.auth.PhoneAuthProvider.PROVIDER_ID
                ]}
                navigation={navigation}
                firebaseConfig={fbConfig}
                primaryColor={"#095760"}
                secondaryColor={"#B9DFF4"}
            />
        </div>
    );
}

export default FirebaseCMS;
