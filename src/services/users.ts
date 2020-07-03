import { auth } from "../firebase";

export const signIn = (email: string, password: string) =>
  auth.signInWithEmailAndPassword(email, password);

export const signOut = () => {
  localStorage.clear();
  auth.signOut();
};

export const doSendResetPasswordEmail = async (email: string) => {
  await auth.sendPasswordResetEmail(email);
};
