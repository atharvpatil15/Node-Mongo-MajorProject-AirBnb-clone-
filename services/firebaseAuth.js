const { getAuth } = require("firebase-admin/auth");
const { db } = require("../utils/firebase");
const {
  createUserProfile,
  upsertUserProfile,
} = require("./firestore");

const auth = getAuth();

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing`);
  }
  return value;
}

async function signUpUser({ username, email, password, phone }) {
  const userRecord = await auth.createUser({
    email,
    password,
    displayName: username,
  });

  const profile = await createUserProfile(userRecord.uid, { username, email, phone });
  return profile;
}

async function signInUser({ email, password, phone }) {
  const apiKey = getRequiredEnv("FIREBASE_WEB_API_KEY");
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorCode = result?.error?.message || "INVALID_LOGIN_CREDENTIALS";
    const error = new Error(errorCode);
    error.code = errorCode;
    throw error;
  }

  const account = await auth.getUser(result.localId);
  return upsertUserProfile(account.uid, {
    email: account.email || email,
    username: account.displayName || email.split("@")[0],
    phone,
  });
}

async function signInWithGoogle(idToken, phone) {
  if (!idToken) {
    const error = new Error("Missing Google ID token");
    error.code = "MISSING_GOOGLE_ID_TOKEN";
    throw error;
  }

  if (!phone) {
    const error = new Error("Phone number is required");
    error.code = "PHONE_REQUIRED";
    throw error;
  }

  const decodedToken = await auth.verifyIdToken(idToken);
  const account = await auth.getUser(decodedToken.uid);

  if (!account.email) {
    const error = new Error("Google account email is required");
    error.code = "GOOGLE_EMAIL_REQUIRED";
    throw error;
  }

  return upsertUserProfile(account.uid, {
    email: account.email,
    username: account.displayName || account.email.split("@")[0],
    phone,
  });
}

async function deleteUserProfileAndAuth(uid) {
  await db.collection("users").doc(uid).delete();
  await auth.deleteUser(uid);
}

module.exports = {
  signUpUser,
  signInUser,
  signInWithGoogle,
  deleteUserProfileAndAuth,
};
