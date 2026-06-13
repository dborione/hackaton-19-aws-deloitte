import React, { useState, useEffect } from "react";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import DocumentList from "./components/DocumentList";
import UploadDocument from "./components/UploadDocument";
import config from "./config";

const userPool = new CognitoUserPool({
  UserPoolId: config.userPoolId,
  ClientId:   config.userPoolClientId
});

const styles = {
  nav:  { background: "#232f3e", color: "#fff", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  main: { maxWidth: 900, margin: "32px auto", padding: "0 16px" },
  btn:  { background: "#bd2430", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }
};

export default function App() {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [screen, setScreen] = useState("login"); // "login" | "register"

  useEffect(() => {
    const current = userPool.getCurrentUser();
    if (current) {
      current.getSession((err, session) => {
        if (!err && session.isValid()) {
          setUser(current);
          setToken(session.getIdToken().getJwtToken());
        }
      });
    }
  }, []);

  const handleLogin = (username, password) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: username, Pool: userPool });
      const authDetails = new AuthenticationDetails({ Username: username, Password: password });
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          setUser(cognitoUser);
          setToken(session.getIdToken().getJwtToken());
          resolve();
        },
        onFailure: reject,
        newPasswordRequired: (_userAttr) => {
          reject(new Error("Changement de mot de passe requis. Contactez l'administrateur."));
        }
      });
    });
  };

  const handleRegister = (email, password) => {
    return new Promise((resolve, reject) => {
      userPool.signUp(email, password, [], null, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  const handleConfirm = (email, code) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  const handleLogout = () => {
    userPool.getCurrentUser()?.signOut();
    setUser(null);
    setToken(null);
  };

  if (!user && screen === "register") {
    return (
      <Register
        onRegister={handleRegister}
        onConfirm={handleConfirm}
        onGoLogin={() => setScreen("login")}
      />
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} onGoRegister={() => setScreen("register")} />;
  }

  return <Dashboard token={token} onLogout={handleLogout} />;
}
