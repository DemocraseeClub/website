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

// TODO: SECURE retrieval of read fields
app.get("/user/:uid", async (req, res) => {
    try {

        const user = await admin.auth().getUser(req.params.uid);

        return res.status(200).json(user);
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

app.get("/rallies", async (req, res) => {
    try {
        const collection = db.collection("rallies");
        const query = (req.query.hasMeetings) ?
            collection.where("meetings", "!=", []).limit(25) // TODO: search by subcollection instead of field
            :
            collection.limit(25)

        let snapshots = await query.get();
        const response = await Promise.all(snapshots.docs.map(async (doc) => {
            let obj = {
                id : doc.id,
                ...doc.data()
            };

            if (obj?.author) {
                const author = await obj.author.get();
                obj.author = {id: author.id, ...author.data()}; // TODO: WRITE NORMALIZER FOR adding title, image, id
            }

            /*
            investigate https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase
            console.log("RALLY PHOTO " + obj.id, obj.picture);
            if (obj.picture) {
                let path = storage.ref(obj.picture);
                const url = await path.getDownloadURL();
                obj.picture = url;
            }
            */

            if (req.query.fields && req.query.fields.indexOf('meetings') > -1) {
                let meetingDocs = await collection.doc(doc.id).collection("meetings").get()
                if (meetingDocs) {
                    obj.meetings = [];
                    meetingDocs.forEach((meeting, j) => {
                        obj.meetings[j] = {
                            id: meeting.id,
                            ...meeting.data(),
                        };
                    });
                }
            }

            if (obj?.topics) {
                for (let j = 0; j < obj.topics.length; j++) {
                    const topic = await obj.topics[j].get();
                    obj.topics[j] = {id: topic.id, ...topic.data()};
                }
            }

            if (obj?.stakeholders) {
                for (let j = 0; j < obj.stakeholders.length; j++) {
                    const stakeholder = await obj.stakeholders[j].get();
                    obj.stakeholders[j] = {
                        id: stakeholder.id,
                        ...stakeholder.data(),
                    };
                }
            }

            if (obj?.wise_demo) {
                for (let j = 0; j < obj.wise_demo.length; j++) {
                    const wise_dem = await obj.wise_demo[j].get();
                    obj.wise_demo[j] = {
                        id: wise_dem.id,
                        ...wise_dem.data(),
                    };
                }
            }

            return obj;
        }))

        return res.status(200).json(response);

    } catch (error) {
        console.log("RALLY ERROR", error);
        return res.status(500).send(error);
    }
});

app.post("/syncUser", async (req, res, next) => {
    if (!req.body || !req.body.idToken) {
        return res.status(500).send('invalid post');
    }

    // console.log("POST DATA", req.body);

    return admin
        .auth()
        .verifyIdToken(req.body.idToken)
        .then(async (decodedToken) => {
            const uid = decodedToken.uid;
            let snapshot = await db.collection("users").doc(uid).get();

            if (!snapshot.exists && req.body.authUser.providerData.length > 0) {
                for(let i=0; i < req.body.authUser.providerData.length; i++) {
                    if (req.body.authUser.providerData[i].phoneNumber) {
                        snapshot = await db.collection("users").where("phone", "==", req.body.authUser.providerData[i].phoneNumber).get();
                        if (snapshot.exists) {
                            console.log("user by phone", snapshot.data().toJSON());
                            break;
                        } else {
                            console.log("no user by phone");
                        }
                    }

                    if (req.body.authUser.providerData[i].email) {
                        snapshot = await db.collection("users").where("email", "==", req.body.authUser.providerData[i].email).get();
                        if (snapshot.exists) {
                            console.log("user by email", snapshot.data().toJSON());
                            break;
                        } else {
                            console.log("no user by email");
                        }
                    }
                }
            }

            let firebaseUser =  (snapshot.exists) ?
                snapshot.data()
                :
                {
                    email:"",
                    phone:"",
                    userName:"",
                    realName: "",
                    website: "",
                    bio: "",
                    picture: "", // req.body.authUser.providerData.photoURL, // TODO: hotlink or move to storage???
                    coverPhoto: "",
                    topic_def_json: "",
                    resources: [],
                    roles: [],
                    providerData :{}
                }

            for (let i = 0; i < req.body.authUser.providerData.length; i++) {
                let data = req.body.authUser.providerData[i];
                firebaseUser.providerData[data.providerId] = data;
                let mergers = {email: "email", phone: "phoneNumber", userName: "displayName"}
                for (let prop in mergers) {
                    if (!firebaseUser[prop] || firebaseUser[prop] === '') {
                        let val = data[mergers[prop]];
                        if (val && val !== '') {
                            firebaseUser[prop] = val;
                        }
                    }
                }
            }

            // auth.currentUser.linkWithRedirect(provider).then().catch();
            // explore: use Firebase Functions to set [Custom Claim](https://firebase.google.com/docs/auth/admin/custom-claims) for faster database Security Rules

            await db.collection("users").doc(uid).set(firebaseUser);
            firebaseUser.uid = uid;
            console.info("synced user: ", JSON.stringify(firebaseUser));

            return res.status(200).json(firebaseUser);
        })
        .catch((error) => {
            return res.status(500).send(error);
        });
});


const site_root = path.resolve(__dirname + "/..");

exports.api = functions.https.onRequest(app);

exports.injectMeta = functions.https.onRequest((req, res, next) => {
    const pathname = req.path; // Short-hand for url.parse(req.url).pathname
    if (pathname.indexOf("/rally/") === 0) {
        let template = fs.readFileSync(`${site_root}/build/index.html`, "utf8");
        // console.log("INJECTING ON " + pathname);
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
