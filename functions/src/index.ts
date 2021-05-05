import * as functions from "firebase-functions";
const fs = require('fs');
const url = require('url');

exports.injectMeta = functions.https.onRequest((req, res) => {
    let template = fs.readFileSync(`../../build/index.html`, 'utf8');
    const URL = url.parse(req.url);
    const pathname = URL.pathname;
    if (pathname.indexOf('/rally/') === 0) {
        // TODO: query for rally meta data (description, video, image , ...)
        let meta = `<meta property="og:url" content="https://api.trackauthoritymusic.com/sharer${pathname}" />`;
        /* meta += `<meta property="fb:app_id" content="267212653413336" />
            <meta property="og:type" content="music.radio_station" />
            <meta property="og:title" content="TAM :: Crowdsourced Communal Playlists" />
            <meta property="og:video" content="https://trackauthoritymusic.com/videos/ftb/mobile/custom/ftb.ts.mp4" />
            <meta property="og:video:secure_url" content="https://trackauthoritymusic.com/videos/ftb/mobile/custom/ftb.ts.mp4" />
            <meta property="og:video:type" content="video/mp4" />
            <meta property="og:video:width" content="360" />
            <meta property="og:video:height" content="640" />
            <meta property="og:description" content="Rewarding Musical Tastes" />
            <meta property="Description" content="Crowdsourced Communal Playlists :: Rewarding Musical Tastes" />`;
         */
        template = template.replace("<head>", "<head>" + meta);
    }
    res.status(200).send(template);
});


// TODO: investigate ways to merge users (avoid duplicate accounts) when the same person registers from multiple provider accounts ?
/*
auth.currentUser.linkWithRedirect(provider).then().catch();
explore: use Firebase Functions to set [Custom Claim](https://firebase.google.com/docs/auth/admin/custom-claims) for faster database Security Rules
*/


/*
this was just copied from some examples online:...

exports.createUser = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        try {
            const userId = snap.id;
            const batch = admin.firestore().batch();
            const newUser = await admin.auth().createUser({
                disabled: false,
                displayName: snap.get('name'),
                email: snap.get('email'),
                password: snap.get('password')
            });

            const ref1 = await admin.firestore().collection('user').doc(newUser.uid);
            await batch.set(ref1, {
                id: newUser.uid,
                email: newUser.email,
                name: newUser.displayName,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const ref3 = await admin.firestore().collection('user').doc(userId);
            await batch.delete(ref3);
            return await batch.commit();
        }
        catch (error) {
            console.error(error);
        }

    });
*/
