import './App.css';
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./components/login"
import Play from "./components/play"

//my unfamiliarity with css is showing here
import "bootstrap/dist/css/bootstrap.min.css"

function App() {
  const [token, setToken] = useState();

  if(!token) {
    return <Login setToken={setToken} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Play />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
