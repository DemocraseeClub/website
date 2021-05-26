import firebase from "firebase/app";

async function getUserData(uid: string) {
    const roomRef = firebase.firestore().collection("users").doc(uid)
    const data = await roomRef.get();
    return (data.exists) ? data.data() : {};
}





function isOwner() {
    //
}

function isAdmin() {

}

function hasFieldReference() {
    // is 'moderators', 'speakers',  'subscriber', coauthors, sponsors, officials
}
