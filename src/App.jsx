import './App.css'
import React, { useState } from 'react'
import { auth } from './firebaseConfig'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { database } from "./firebaseConfig";
import { ref, set } from "firebase/database";

/*
const apiKey = process.env.REACT_APP_GEMINI_KEY;

fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Hello Gemini" }] }]
    })
  }
);
*/

function App() {
  //const [page, setPage] = useState(1);
  const [user, setUser] = useState(null);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log('User info:', result.user);
      
      await set(ref(database, 'users/' + result.user.uid), {
      name: result.user.displayName,
      email: result.user.email
      });

    } catch (error) {
      console.error('Login error:', error);
      //alert('Login failed: ' + error.message);
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  return (
    <div className="animBG">
      <header className="fixed-header">
        <h1 style={{ color: 'white', margin: 0 }}>Phishing Challenge!</h1>
        {user ? (
          <button className="button2" onClick={handleLogout}>Logout</button>
        ) : (
          <button className="button2" onClick={handleGoogleLogin}>Login</button>
        )}
      </header>
      <div>
        <div className="card">
          <h2>Hello!</h2>
          <button className="button" onClick={() => null}>Start Challenge</button>
          <h3>Click here to start the Phishing Challenge and test how well you can spot phishing emails.</h3>
        </div>
      </div>
      <footer className="fixed-footer" style={{ backgroundColor: 'black', textAlign: 'left', padding: '1rem' }}>
        <h3 style={{ color: 'white' }}>Created by Philip Colborn, Alexander Chambers</h3>
      </footer>
    </div>
  );
}

export default App
