import './App.css'
import React, { useState, useEffect } from 'react'
import { auth } from './firebaseConfig'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { database } from "./firebaseConfig";
import { ref, set, get } from "firebase/database";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_KEY
const ai = new GoogleGenerativeAI(apiKey);
const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

function App() {
  //const [page, setPage] = useState(1);
  const [user, setUser] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isLoading, setisLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isPhishing, setIsPhishing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highestScore, setHighestScore] = useState(0);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log('User info:', result.user);
      const snapshot = await get(ref(database, 'users/' + result.user.uid));
      if (!snapshot.exists()) {
        await set(ref(database, 'users/' + result.user.uid), {
          name: result.user.displayName,
          email: result.user.email,
          score: 0
        });
      }

    } catch (error) {
      console.error('Login error:', error);
      //alert('Login failed: ' + error.message);
    }
  };

  async function createPhishingEmail() {
    setisLoading(true);
    const f = Math.random();
    try {
      if (f < 0.5) {
        setIsPhishing(true);
        const mail = await model.generateContent(
          `Generate a professional looking phishing email that attempts to trick the user in some way. The email should be 150 words or less and be formatted like a real email with a subject line, greeting, body, and signature. 
          Use made up names for people and companies. Never use the word phishing. Indent the email using spaces to make it look like a real email.
          Use the following template:
          Subject: [Subject Line]

          From: [Sender Name] <[Sender Email]>
          To: [Recipient Name] <[Recipient Email]>

          [Body of the email]

          [Signature]
          
          Replace [Subject Line], [Sender Name], [Sender Email], [Recipient Name], [Recipient Email], [Body of the email], and [Signature] with appropriate content for an email. The body should contain a call to action that attempts to trick the user in some way, such as asking them to click a link or provide personal information.
          `

        );
        setEmail(mail.response.text());
        console.log(mail.response.text());
      } else {
        setIsPhishing(false);
        const mail = await model.generateContent(
          `Generate a professional email. The email should be 150 words or less and be formatted like a real email with a subject line, greeting, body, and signature. 
          Use made up names for people and companies. Indent the email using spaces to make it look like a real email.
          Use the following template:
          Subject: [Subject Line]

          From: [Sender Name] <[Sender Email]>
          To: [Recipient Name] <[Recipient Email]>

          [Body of the email]

          [Signature]
          
          Replace [Subject Line], [Sender Name], [Sender Email], [Recipient Name], [Recipient Email], [Body of the email], and [Signature] with appropriate content for an email. 
          `
        );
        console.log("IsPhishing:", isPhishing);
        setEmail(mail.response.text());
        console.log(mail.response.text());
      }
    } catch (error) {
      console.error("Gemini error:", error);
      setEmail("Error generating email.");
    }
    setisLoading(false);
  }

  const updateHighScore = async () => {
    let score;
    try {
      console.log("user: ", user);
      if (!user) {
        return;
      }
      const snapshot = await get(ref(database, 'users/' + user.uid));
      console.log("snapshot: ", snapshot);
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("data: ", data);
        score = data.score;
      } else {
        console.log("No data found");
        return null;
      }
      console.log("score: ", score); console.log("currentScore: ", currentScore);
      if (score < currentScore) {
        await set(ref(database, 'users/' + user.uid + '/score'), currentScore);
      }
      const snapshot2 = await get(ref(database, 'highscore'));
      if (snapshot2.exists()) {
        const highScore = snapshot2.val();
        if (currentScore > highScore) {
          await set(ref(database, 'highscore'), currentScore);
        }
      } else {
        await set(ref(database, 'highscore'), currentScore);
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
      const snapshot2 = await get(ref(database, 'highscore'));
      if (snapshot2.exists()) {
        const hs = snapshot2.val();
        setHighestScore(hs);
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
            <p>Highest Score: {highestScore}</p>
            <p>Your High Score: {highScore}</p>
            <button className="button2" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p>Highest Score: {highestScore}</p>
            <button className="button2" onClick={handleGoogleLogin}>Login</button>
          </div>
        )}
      </header>
      <div>
        {!email && !isLoading && !gameOver? (
          <div>
            <div className="card">
              <h2>Hello!</h2>
              <button className="button" onClick={createPhishingEmail}>Start Challenge</button>
              <h3>Click here to start the Phishing Challenge and test how well you can spot phishing emails.</h3>
            </div>
          </div>
        ) : isLoading ? (
          <div className="card">
            <h3>Score: {currentScore}</h3>
            <p>Loading...</p>
          </div>
        ) : email && !gameOver ? (
          <div className="card2">
            <h3>Score: {currentScore}</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{email}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
              <button className="button" onClick={() => {
                if (isPhishing) {
                  setCurrentScore(currentScore + 1);
                  createPhishingEmail();
                } else {
                  updateHighScore();
                  setGameOver(true);
                }
                setEmail("");
              }}>Phishing</button>
              <button className="button" onClick={() => {
                if (!isPhishing) {
                  setCurrentScore(currentScore + 1);
                  createPhishingEmail();
                } else {
                  updateHighScore();
                  setGameOver(true);
                }
                setEmail("");
              }}>Not Phishing</button>
            </div>
          </div>
        ) : (
          <div className="card">
            <h2>You got Phished!🐟 Your score: {currentScore}</h2>
            <button className="button" onClick={() => {
              setGameOver(false);
              setCurrentScore(0);
            }}>Return Home</button>
          </div>
        )}
      </div>
      <footer className="fixed-footer" style={{ backgroundColor: 'black', textAlign: 'left', padding: '1rem' }}>
        <h3 style={{ color: 'white' }}>Created by Philip Colborn, Alexander Chambers</h3>
      </footer>
    </div>
  );
}

export default App
