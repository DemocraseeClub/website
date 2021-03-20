import React, { useState } from "react";

import {
  Authenticator,
  buildCollection,
  buildProperty,
  buildSchema,
  CMSApp,
  NavigationBuilder,
  NavigationBuilderProps,
  PermissionsBuilder
} from "@camberi/firecms"
import firebase from "firebase/app";
import "typeface-rubik";
import "../../theme/FirebaseCMS.css";

import userSchema from "./collections/user"


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

  const navigation: NavigationBuilder = ({ user }: NavigationBuilderProps) => ({
    collections: [
        buildCollection({
            relativePath: "users",
            schema: userSchema,
            name: "Users",
            permissions:
             ({user, entity}) => 
              {
                if(entity) {
                  console.log("entity", entity )
                  entity.reference.get().then(data => console.log(data.data()))

                }

                return {
                  edit: false,
                  create: false,
                  delete: false
                }
              },
        })
    ]
});

  const myAuthenticator : Authenticator = (user? : firebase.User) => {
    console.log("Allowing access to", user?.email);
    
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
        primaryColor={"#000000"}
      />
    </div>
  );
}

export default FirebaseCMS;
