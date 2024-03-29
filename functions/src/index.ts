// import * as functions from "firebase-functions"
const fs = require("fs");
const path = require("path");

// const firebase = require("firebase");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors"); // ({origin: true});
// const {auth} = require("firebase-admin");
// const {bucket} = require("firebase-functions/lib/providers/storage");

const app = express();

app.use(cors());

if (process.env.NODE_ENV === "development") {
    admin.initializeApp({
        credential: admin.credential.cert("../democraseeclub-firebase-admin.json"),
        databaseURL: "https://democraseeclub.firebaseio.com",
        storageBucket: "gs://democraseeclub.appspot.com",
    });
} else {
    admin.initializeApp();
}

const db = admin.firestore();
// const storage = admin.storage()

// Retrieve services via the defaultApp variable...
// var defaultAuth = defaultApp.auth();
// var defaultDatabase = defaultApp.database();

// TODO: SECURE read of private fields (field_email | field_phone |
app.get("/citizen/:uid", async (req, res) => {
    try {

        const userRef = db.collection("users").doc(req.params.uid)

        const userSnapshot = await userRef.get()

        const citizen = {...userSnapshot.data()}

        const resourcesSnapshot = await db
            .collection("resources")
            .where("author", "==", userRef)
            .get();

        const {docs} = resourcesSnapshot;

        const resources = docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        for(let i = 0; i< resources.length; i++) {

            if(resources[i]?.resource_type) {

                const resource_type = await resources[i].resource_type.get()

                resources[i].resource_type = {...resource_type.data()}
            }

        }

        return res.status(200).json({resources, citizen});
    } catch (error) {
        return res.status(500).send(error);
    }
});


/* TODO: secure update of Badge roles like "contributor", ...
app.post("/user/:uid", async (req, res) => {

}) */

app.get("/users/:role", async (req, res) => {
    try {
        const usersSnapshot = await db
            .collection("users")
            .where("roles", "array-contains", req.params.role)
            .get();
        const {docs} = usersSnapshot;

        const response = docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

app.post("/syncUser", async (req, res) => {
    if (!req.body || !req.body.idToken) {
        return res.status(400).send('invalid post');
    }

    return admin
        .auth()
        .verifyIdToken(req.body.idToken)
        .then(async (decodedToken) => {
            let uid = decodedToken.uid;

            if (!uid) {
                functions.logger.error("UID IS NULL: ", decodedToken);
                return res.status(204).send({message:'invalid uid'});
            }
            let snapshot = await db.collection("users").doc(uid).get();

            if (!snapshot.exists && decodedToken.phone_number) {
                let query = await db.collection("users").where("phoneNumber", "==", decodedToken.phone_number).limit(1).get();
                if (query.size > 0) {
                    snapshot = query.docs[0];
                    uid = query.docs[0].id;
                    functions.logger.warn("found user by phone "  + uid, snapshot.data());
                } else {
                    functions.logger.info("no user by phone " + decodedToken.phone_number);
                }
            }

            if (!snapshot.exists && decodedToken.email) {
                let query = await db.collection("users").where("email", "==", decodedToken.email).limit(1).get();
                if (query.size > 0) {
                    snapshot = query.docs[0];
                    uid = query.docs[0].id;
                    functions.logger.warn("found user by email"  + uid, snapshot.data());
                } else {
                    functions.logger.info("no user by email " + decodedToken.email);
                }
            }

            const now = admin.firestore.FieldValue.serverTimestamp();

            let firebaseUser =  (snapshot.exists) ?
                snapshot.data()
                :
                {created: now, modified: now}

            firebaseUser.lastSync = now;

            if (decodedToken.roles && firebaseUser?.roles.includes("email_verified") === false) {
                firebaseUser.roles?.push("email_verified");
            }
            if (decodedToken.email && (!firebaseUser.email || firebaseUser.email === '')) {
                firebaseUser.email = decodedToken.email;
            }
            if (decodedToken.phone_number && (!firebaseUser.phoneNumber || firebaseUser.phoneNumber === '')) {
                firebaseUser.phoneNumber = decodedToken.phone_number;
            }
            if (decodedToken.picture && (!firebaseUser.picture || firebaseUser.picture === '')) {
                firebaseUser.picture = decodedToken.picture;
            }

            let identities = decodedToken.firebase.identities;
            functions.logger.info(identities)
            let mergers = getIdentityMap(decodedToken.firebase.sign_in_provider)
            for (let prop in mergers) {
                if (!firebaseUser[prop] || firebaseUser[prop] === '') {
                    let val = identities[decodedToken.firebase.sign_in_provider][mergers[prop]];
                    if (val && val !== '') {
                        firebaseUser[prop] = val;
                    }
                }
            }

            if (!firebaseUser.displayName) {
                firebaseUser.displayName = decodedToken.name; // random string
            }
            if (!firebaseUser.roles) {
                firebaseUser.roles = [];
            }

            // explore: use Firebase Functions to set [Custom Claim](https://firebase.google.com/docs/auth/admin/custom-claims) for faster database Security Rules

            await db.collection("users").doc(uid).set(firebaseUser, {merge:true});
            const doc = await db.collection('users').doc(uid).get();
            if (!doc.exists) {
                functions.logger.log('Failed to sync doc ',  firebaseUser);
                return res.status(500).json({message:'Failed to sync your account profiles'});
            }

            let obj = doc.data();
            obj.uid = uid;
            functions.logger.info("synced user: " + uid, obj);
            return res.status(200).json(obj);


        })
        .catch((error) => {
            return res.status(500).send(error);
        });
});

app.post("/citizen/:uid/edit", async (req, res) => {

    console.log(req);

    return res.status(200).json({});
});

function getIdentityMap(provider) {
    // phone { phone: [ '+18088555665' ] }
    // password { email: [ 'eliabrahamtaylor@gmail.com' ] }
    // sign_in_providconst now = admin.firestore.FieldValue.serverTimestamp();er === "anonymous", "password", "facebook.com", "github.com", "google.com", "twitter.com", "apple.com", "microsoft.com", "yahoo.com", "phone", "playgames.google.com", "gc.apple.com", or "custom"`.
    if (provider === 'google.com') {
        return {email: "email", phoneNumber: "phoneNumber", displayName: "displayName"}
    } else {

    }
    return {};
}

const site_root = path.resolve(__dirname + "/..");

exports.api = functions.https.onRequest(app);

exports.injectMeta = functions.https.onRequest((req, res, next) => {
    const pathname = req.path; // Short-hand for url.parse(req.url).pathname
    if (pathname.indexOf("/rally/") === 0) {
        let template = fs.readFileSync(`${site_root}/build/index.html`, "utf8");
        // functions.logger.log("INJECTING ON " + pathname);
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
});

//listen for updates and changing modified timestamp in every collection


function onUpdateEntity(change, context){

    const data = change.after.data();
    const previousData = change.before.data();

    if(JSON.stringify(data?.modified) !== JSON.stringify(previousData?.modified)) {
         return null
    }

    const modified = admin.firestore.FieldValue.serverTimestamp();

    return change.after.ref.set({
        modified,
    }, {merge: true});
}

exports.onUpdateUser = functions.firestore.document('users/{userId}').onUpdate( onUpdateEntity );

exports.onUpdateCity = functions.firestore.document('cities/{cityId}').onUpdate( onUpdateEntity );

exports.onUpdateMeetingType = functions.firestore.document('meeting_types/{meeting_typeId}').onUpdate( onUpdateEntity );

exports.onUpdateOfficial = functions.firestore.document('officials/{officialId}').onUpdate( onUpdateEntity );

exports.onUpdateParty = functions.firestore.document('parties/{partyId}').onUpdate( onUpdateEntity );

exports.onUpdateRally = functions.firestore.document('rallies/{rallyId}').onUpdate( onUpdateEntity );

exports.onUpdateResourceType = functions.firestore.document('resource_types/{resource_typeId}').onUpdate( onUpdateEntity );

exports.onUpdateResource = functions.firestore.document('resources/{resourceId}').onUpdate( onUpdateEntity );

exports.onUpdateStakeholder = functions.firestore.document('stakeholders/{stakeholderId}').onUpdate( onUpdateEntity );

exports.onUpdateStates = functions.firestore.document('states/{stateId}').onUpdate( onUpdateEntity );

exports.onUpdateTopics = functions.firestore.document('topics/{topicId}').onUpdate( onUpdateEntity );

exports.onUpdateWiseDemocracy = functions.firestore.document('wise_democracy/{wise_democracyId}').onUpdate( onUpdateEntity );

exports.onUpdateActionPlan = functions.firestore.document('action_plans/{action_planId}').onUpdate( onUpdateEntity );

exports.onUpdateSubscription = functions.firestore.document('subscriptions/{subscriptionId}').onUpdate( onUpdateEntity );

exports.onUpdatePage = functions.firestore.document('pages/{pageId}').onUpdate( onUpdateEntity );



//listen for new entities creation

function onCreateEntity(snap, context) {

    const now = admin.firestore.FieldValue.serverTimestamp();

    return snap.ref.set({
        created: now,
        modified: now
    }, {merge: true})

}

exports.onCreateUser = functions.firestore.document('users/{usersId}').onCreate( onCreateEntity );

exports.onCreateCity = functions.firestore.document('cities/{cityId}').onCreate( onCreateEntity );

exports.onCreateMeetingType = functions.firestore.document('meeting_types/{meeting_typeId}').onCreate( onCreateEntity );

exports.onCreateOfficial = functions.firestore.document('officials/{officialId}').onCreate( onCreateEntity );

exports.onCreateParty = functions.firestore.document('parties/{partyId}').onCreate( onCreateEntity );

exports.onCreateRally = functions.firestore.document('rallies/{rallyId}').onCreate( onCreateEntity );

exports.onCreateResourceType = functions.firestore.document('resource_types/{resource_typeId}').onCreate( onCreateEntity );

exports.onCreateResource = functions.firestore.document('resources/{resourceId}').onCreate( onCreateEntity );

exports.onCreateStakeholder = functions.firestore.document('stakeholders/{stakeholderId}').onUpdate( onCreateEntity );

exports.onCreateStates = functions.firestore.document('states/{stateId}').onCreate( onCreateEntity );

exports.onCreateTopics = functions.firestore.document('topics/{topicId}').onCreate( onCreateEntity );

exports.onCreateWiseDemocracy = functions.firestore.document('wise_democracy/{wise_democracyId}').onCreate( onCreateEntity );

exports.onCreateActionPlan = functions.firestore.document('action_plans/{action_planId}').onCreate( onCreateEntity );

exports.onCreateSubscription = functions.firestore.document('subscriptions/{subscriptionId}').onCreate( onCreateEntity );

exports.onCreatePage = functions.firestore.document('pages/{pageId}').onCreate( onCreateEntity );





/*
TODO: programmatically add `created` and `modified` fields to EVERY document.
ex. https://firebase.google.com/docs/functions/firestore-events
// Listen for updates to any document.
exports.onWriteDocs = functions.firestore
    .document('users/{userId}')
    .onUpdate((change, context) => {
      // Retrieve the current and previous value
      const data = change.after.data();
      const previousData = change.before.data();

      // We'll only update if the name has changed.
      // This is crucial to prevent infinite loops.
      if (data.name == previousData.name) {
        return null;
      }

      // Retrieve the current count of name changes
      let count = data.name_change_count;
      if (!count) {
        count = 0;
      }

      // Then return a promise of a set operation to update the count
      return change.after.ref.set({
        name_change_count: count + 1
      }, {merge: true});
    });
*/


