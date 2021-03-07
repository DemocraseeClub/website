import React from "react";

import { Authenticator, CMSApp, EntityCollection } from "@camberi/firecms";
import firebase from "firebase/app";
import "typeface-rubik";

import "../../theme/FirebaseCMS.css";

import userCollection from "./collections/user";
import resourceCollection from "./collections/resource";
import resourceTypesCollection from "./collections/resource_types";
import officialCollection from "./collections/official";
import partyCollection from "./collections/party";
import cityCollection from "./collections/city";
import stateCollection from "./collections/state";
import rallyCollection from "./collections/rally";

// This is for test
const firebaseConfig = {
  apiKey: "AIzaSyBXelhalX-QVA2V9DImADLkGo9GdjAsLEY",
  authDomain: "firecms-test.firebaseapp.com",
  projectId: "firecms-test",
  storageBucket: "firecms-test.appspot.com",
  messagingSenderId: "720140535017",
  appId: "1:720140535017:web:2f7550d8c2bb37a0095c78",
};

export function FirebaseCMS() {
  const navigation: EntityCollection[] = [
    userCollection,
    resourceCollection,
    resourceTypesCollection,
    officialCollection,
    partyCollection,
    cityCollection,
    stateCollection,
    rallyCollection,
  ];

  const myAuthenticator: Authenticator = (user?: firebase.User) => {
    console.log("Allowing access to", user?.email);
    return true;
  };

  return (
    <div className="cms-container">
      <CMSApp
        name={"Democraseeclub"}
        authentication={myAuthenticator}
        navigation={navigation}
        firebaseConfig={firebaseConfig}
        primaryColor={"#000000"}
      />
    </div>
  );
}

export default FirebaseCMS;
