import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/*
auth.currentUser.linkWithRedirect(provider).then().catch();
explore: use Firebase Functions to set [Custom Claim](https://firebase.google.com/docs/auth/admin/custom-claims) for faster database Security Rules
*/

// TODO: investigate ways to merge users (avoid duplicate accounts) when the same person registers from multiple provider accounts ?


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
