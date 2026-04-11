/* global firebase */
(function () {
  const googleButton = document.querySelector("[data-google-auth]");
  const messageNode = document.querySelector("[data-google-auth-message]");
  const firebaseConfig = window.firebaseClientConfig;

  if (
    !googleButton ||
    !firebaseConfig ||
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    typeof firebase === "undefined"
  ) {
    if (googleButton) {
      googleButton.disabled = true;
    }
    if (messageNode) {
      messageNode.textContent = "Firebase web configuration is missing.";
    }
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  googleButton.addEventListener("click", async () => {
    googleButton.disabled = true;
    if (messageNode) {
      messageNode.textContent = "Signing in with Google...";
    }

    try {
      const result = await auth.signInWithPopup(provider);
      const idToken = await result.user.getIdToken();
      const response = await fetch("/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Google sign-in failed");
      }

      window.location.assign(payload.redirectUrl || "/listing");
    } catch (error) {
      if (messageNode) {
        messageNode.textContent = error.message || "Google sign-in failed";
      }
      googleButton.disabled = false;
    }
  });
})();
