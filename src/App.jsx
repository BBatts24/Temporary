import './App.css'
import React, { useState, useEffect, use } from 'react'
import { auth } from './firebaseConfig'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { database } from "./firebaseConfig";
import { ref, set, get } from "firebase/database";
import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = import.meta.env.VITE_GEMINI_KEY;
const ai = new GoogleGenerativeAI(apiKey);
const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

function App() {
  //const [page, setPage] = useState(1);
  const [user, setUser] = useState(null);
  const [currentScore, setCurentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log('User info:', result.user);

      await set(ref(database, 'users/' + result.user.uid), {
        name: result.user.displayName,
        email: result.user.email,
        score: 0
      });

    } catch (error) {
      console.error('Login error:', error);
      //alert('Login failed: ' + error.message);
    }
  };
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function createPhishingEmail() {
    setLoading(true);

    try {
      const mail = await model.generateContent(
        "Generate an email that is either a phishing email or a legitimate email."
      );

      const text = mail.response.text();
      setEmail(text);
      console.log(text);
    } catch (err) {
      console.error("Gemini error:", err);
      setEmail("Error generating email.");
    }

    setLoading(false);
  }

  const updateHighScore = async () => {
    let score;
    try {
      if (!user) {
        return;
      }
      const snapshot = await get(ref(database, 'users/' + user.uid));
      if (snapshot.exists()) {
        const data = snapshot.val();
        score = data.score;
      } else {
        console.log("No data found");
        return null;
      }
      if (score < currentScore) {
        await set(ref(database, 'users/' + user.uid + '/score'), currentScore);
      }
    } catch (error) {
      console.error('error:', error);
      //alert('Login failed: ' + error.message);
    }

  }


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (user) {
        const snapshot = await get(ref(database, 'users/' + user.uid));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setHighScore(data.score);
        } else {
          console.log("No data found");
        }
      }
    }
    fetchData();
  }, [user]);
  return (
    <div className="animBG">
      <header className="fixed-header">
        <h1 style={{ color: 'white', margin: 0, justifyContent: 'right' }}>Phishing Challenge!</h1>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p>Score: {highScore}</p>
            <button className="button2" onClick={handleLogout}>Logout</button>
          </div>
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
