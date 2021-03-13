import React, { useState } from "react";

import { CMSApp } from "@camberi/firecms";
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

  const myAuthenticator = async (user) => {
 
      console.log("Allowing access to", user?.email, user?.phoneNumber);
      console.log(user);
      try {

        const ref = user?.phoneNumber 
                      ?  
                      window.db.collection('users').where("phone", "==", user.phoneNumber)
                      :
                      window.db.collection('users').where("email", "==", user.email)
               

        const data = await ref.get()
        let id = '';
        data.forEach((d) => {
          const userDB = d.data();
          console.log(userDB)

          const userRef =  window.db.collection('users').doc(`${d.id}`);
          const rolesRef =  window.db.collection('roles').doc(user.uid);
          
          userRef.update({
            uid: user.uid
          }).then(() => console.log("uid updated"))

          
          const isAdmin = userDB.admin === true
          
          if (isAdmin){
            setNavigation(navigationAdmin);

            rolesRef.set({
              role : "ROLE_ADMIN",
              email: user?.email,
              phone: user?.phoneNumber 
            })
          } else {
            rolesRef.set({
              role : "ROLE_USER",
              email: user?.email,
              phone: user?.phoneNumber
            })
          }
          
        })
       
        
      } catch(e) {
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
