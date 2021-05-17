// import * as functions from "firebase-functions"
const fs = require('fs');
var path = require('path');

// const firebase = require('firebase');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const { auth } = require('firebase-admin');
const { bucket } = require('firebase-functions/lib/providers/storage');


const app = express()

app.use(cors())


admin.initializeApp({
    credential: admin.credential.cert("./democraseeclub-firebase-admin.json"),
    databaseURL: "https://democraseeclub.firebaseio.com",
    storageBucket: "gs://democraseeclub.appspot.com"
});

const db = admin.firestore();
// const storage = admin.storage()

// Retrieve services via the defaultApp variable...
// var defaultAuth = defaultApp.auth();
// var defaultDatabase = defaultApp.database();

// TODO: replace all with Express app: https://firebase.google.com/docs/functions/http-events

app.get("/user/:uid", async (req, res) => {

    try {

        const user = await admin.auth().getUser(req.params.uid)

        return res.status(200).json(user)

    } catch (error) {

        return res.status(500).send(error);

    }

})

app.get("/users/:role", async (req, res) => {

    try {

        const usersSnapshot = await db.collection("users").where("roles", "array-contains", req.params.role).get()
        const {docs} = usersSnapshot

        const response = docs.map(doc => (
            {
                id: doc.id,
                ...doc.data()
            }
        ))

        return res.status(200).json(response)

    } catch (error) {
        
        return res.status(500).send(error);

    }



})



app.get("/resources", async (req, res, next) => {

    try {

        const resourcesSnapshot = await db.collection("resources").get()
        const { docs } = resourcesSnapshot

        const response = docs.map(doc => (
            {
                id: doc.id,
                ...doc.data()
            }
        ))

        for (let i = 0; i < response.length; i++) {
            if (response[i]?.author) {
                const author = await response[i].author.get()
                response[i].author = {id: author.id, ...author.data() }
            }
        }

        return res.status(200).json(response)

    } catch (error) {

        return res.status(500).send(error);
    }



})

app.get("/rallies", async (req, res, next) => {

    try {

        const ralliesSnapshot = await db.collection("rallies").get()
        const { docs } = ralliesSnapshot

        const response = docs.map(doc => (
            {
                id: doc.id,
                ...doc.data()
            }
        ))

        for (let i = 0; i < response.length; i++) {

            if (response[i]?.author) {
                const author = await response[i].author.get()
                response[i].author = {id:author.id, ...author.data() }
            }

            if (response[i]?.meetings) {

                for (let j = 0; j < response[i].meetings.length; j++) {

                    const meeting = await response[i].meetings[j].get()
                    response[i].meetings[j] = {id: meeting.id, ...meeting.data() }

                }
            }

            if (response[i]?.topics) {

                for (let j = 0; j < response[i].topics.length; j++) {

                    const topic = await response[i].topics[j].get()
                    response[i].topics[j] = {id: topic.id, ...topic.data() }

                }
            }

            if (response[i]?.stakeholders) {

                for (let j = 0; j < response[i].stakeholders.length; j++) {

                    const stakeholder = await response[i].stakeholders[j].get()
                    response[i].stakeholders[j] = {id: stakeholder.id, ...stakeholder.data() }

                }
            }

        }

        return res.status(200).json(response)

    } catch (error) {

        return res.status(500).send(error);
    }
})

app.get("/syncUser", (req, res, next) => {



})

const site_root = path.resolve(__dirname + '/..');


app.post("/injectMeta", (req, res, next) => {

    const pathname = req.path; // Short-hand for url.parse(req.url).pathname
    if (pathname.indexOf('/rally/') === 0) {
        let template = fs.readFileSync(`${site_root}/build/index.html`, 'utf8');
        console.log("INJECTING ON " + pathname)
        // TODO: query for rally meta data (description, video, image , ...)
        let meta = `<meta property="og:description" content="Incentivizing Civic Action" />
            <meta property="Description" content="Incentivizing Civic Action || Tailgate your townhall" />
            <meta property="og:url" content="https://democraseeclub.web.app/${pathname}" />`; // strip query params
        /* meta += `<meta property="fb:app_id" content="267212653413336" />
        <meta property="og:type" content="music.radio_station" />
        <meta property="og:title" content="TAM :: Crowdsourced Communal Playlists" />
        <meta property="og:video" content="https://trackauthoritymusic.com/videos/ftb/mobile/custom/ftb.ts.mp4" />
        <meta property="og:video:secure_url" content="https://trackauthoritymusic.com/videos/ftb/mobile/custom/ftb.ts.mp4" />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="360" />
        <meta property="og:video:height" content="640" />`;
        */

        template = template.replace("<head>", "<head>" + meta);
        res.status(200).send(template);
    } else {
        next();
    }

})

exports.app = functions.https.onRequest(app);





// docs: https://firebase.google.com/docs/reference/functions/providers_https_.request
// exports.injectMeta = functions.https.onRequest((req, res, next) => {
//     const pathname = req.path; // Short-hand for url.parse(req.url).pathname
//     if (pathname.indexOf('/rally/') === 0) {
//         let template = fs.readFileSync(`${site_root}/build/index.html`, 'utf8');
//         console.log("INJECTING ON " + pathname)
//         // TODO: query for rally meta data (description, video, image , ...)
//         let meta = `<meta property="og:description" content="Incentivizing Civic Action" />
//             <meta property="Description" content="Incentivizing Civic Action || Tailgate your townhall" />
//             <meta property="og:url" content="https://democraseeclub.web.app/${pathname}" />`; // strip query params
//             /* meta += `<meta property="fb:app_id" content="267212653413336" />
//             <meta property="og:type" content="music.radio_station" />
//             <meta property="og:title" content="TAM :: Crowdsourced Communal Playlists" />
//             <meta property="og:video" content="https://trackauthoritymusic.com/videos/ftb/mobile/custom/ftb.ts.mp4" />
//             <meta property="og:video:secure_url" content="https://trackauthoritymusic.com/videos/ftb/mobile/custom/ftb.ts.mp4" />
//             <meta property="og:video:type" content="video/mp4" />
//             <meta property="og:video:width" content="360" />
//             <meta property="og:video:height" content="640" />`;
//             */

//         template = template.replace("<head>", "<head>" + meta);
//         res.status(200).send(template);
//     } else {
//         next();
//     }
// });






// // use FireCMS token to merge POST'd provider with tfirestore doc (or crate new one
// exports.syncUser = functions.https.onRequest((req, res) => {
//     if (!req.body || !req.body.idToken) return false;
//     console.log(req.body);
//     validate accessToken...
//     return admin
//         .auth()
//         .verifyIdToken(req.body.idToken)
//         .then((decodedToken) => {
//             const uid = decodedToken.uid;
//             let fbUser = getUser(uid);
//             if (!fbUser) {
//                 fbUser = {};
//                 // TODO: create user
//             }
//             let merged = Object.assign({}, fbUser, req.body.authUser);
//             delete merged.idToken;
//             /* Investigate:
//             auth.currentUser.linkWithRedirect(provider).then().catch();
//             explore: use Firebase Functions to set [Custom Claim](https://firebase.google.com/docs/auth/admin/custom-claims) for faster database Security Rules
//              */
//             console.log("MERGING USER!!", merged);
//             db.doc('users/'+uid).set(merged)
//         })
//         .catch((error) => {
//             return console.error(error);
//         });
// });





// async function getUser(uid) {
    // admin.auth.getUserByEmail(),  getUserByPhoneNumber...


/*
exports.createUser = functions.firestore
    .document('users/{userId}')
    .onCreate((snap, context) => {
        let uid = context.auth?.uid || context.params.userId;
        const authUser = snap.data();
        const fbUser = getUser(uid);
        let merged = Object.assign({}, fbUser, authUser);
        // TODO: auto award promo citizencoin?
        console.log("CREATING MERGED USER!!", context, merged);
        db.doc('users/'+uid).set(merged)
    });

exports.updateUser = functions.firestore
    .document('users/{userId}')
    .onUpdate((change, context) => {
        // TODO: verify no auth fields / scopes / permissions have changed
    });

exports.deleteUser = functions.firestore
    .document('users/{userId}')
    .onDelete((change, context) => {
        // TODO cleanup orphan records
    });
*/

/*
https://firebase.google.com/docs/auth/extend-with-functions
exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
    // ...
});
exports.sendByeEmail = functions.auth.user().onDelete((user) => {
  // ...
});
*/
