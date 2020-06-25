import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const config = {
  apiKey: "AIzaSyDqXonVWN-g-k-MRq8YteLVQWdUQfcKajY",
  authDomain: "way-bill-scanner.firebaseapp.com",
  databaseURL: "https://way-bill-scanner.firebaseapp.com",
  projectId: "way-bill-scanner",
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const fb = firebase;
