import React, { useState } from "react";

import { Authenticator, CMSApp } from "@camberi/firecms";
import firebase from "firebase/app";
import "typeface-rubik";
import { navigationAdmin, navigationUser } from "./navigation";
import "../../theme/FirebaseCMS.css";
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

export function FirebaseCMS() {
  const [navigation, setNavigation] = useState(navigationUser);

  const myAuthenticator = (user) => {
    console.log("Allowing access to", user?.email);
    //TODO get udsuario de fb
    window.db
      .collection("users")
      .where("email", "==", user.email)
      .get()
      .then((data) => {
        data.forEach((d) => {
          const user = d.data();
          const isAdmin = user.roles.some((r) => r === "ROLE_ADMIN");
          if (isAdmin) setNavigation(navigationAdmin);
        });
      })
      .catch((e) => console.log(e));
    console.log(navigation);
    return true;
  };
  console.log( firebase.auth);
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
            firebase.auth.OAuthProvider.providerId
        ]}
        navigation={navigation}
        firebaseConfig={firebaseConfig}
        primaryColor={"#000000"}
      />
    </div>
  );
}

export default FirebaseCMS;
