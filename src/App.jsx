//import { useState } from 'react'
import './App.css'
import React from 'react'
import { useState } from 'react';

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
  const [page, setPage] = useState(1);

  if (page === 1) {
    return (
    <body className='AnimBG'>
      <header className="fixed-header">
        <h1 style={{ color: 'white', margin: 0 }}>Phishing Challenge!</h1>
        <button className="button2" onClick={() => setPage(2)}>Login</button>
      </header>
      <body>
        <div className="card">
          <h2>Hello!</h2>
          <button className="button" onClick={() => null}>Start Challenge</button>
          <h3>Click here to start the Phishing Challenge and test how well you can spot phishing emails.</h3>
        </div>
      </body>
      <footer className="fixed-footer" style={{ backgroundColor: 'black', textAlign: 'left', padding: '1rem' }}>  
        <h3 style={{ color: 'white' }}>Created by Philip Colborn, Alexander Chambers</h3>
      </footer>
      <div> 
      </div>
    </body>
    );
  } else if (page === 2) {
    return (
      <div></div>
    );
  }
}

export default App
