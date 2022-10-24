import React, { useState } from "react";
import axios from 'axios';

export default function Login({ setToken }) {
  //function to handle sending data to server upon login
  const loginExecute = event => {
    event.preventDefault();
    var loginContents = {"username": document.getElementById("username").value, "password": document.getElementById("password").value};
    var config = {headers: {'Content-Type': 'application/json'}};

    //send the data to the server and check if the login was successful
    axios.post('http://localhost:4242/api/login', loginContents, config).then(function (response) {
      if(response.data.message === "success") {
        console.log(response.data.token);
        localStorage.setItem('name', response.data.name);
        localStorage.setItem('highScore', response.data.highScore);
        setToken(response.data.token);
      }
      else {
        console.log(response.data.message);
        document.getElementById("errormsg").innerHTML = response.data.message;
      }
    }).catch(function (error) {
      console.log(error);
    });
  }

  //function to handle sending data to server upon registration
  const registerExecute = event => {
    event.preventDefault();
    var registerContents = {"name": document.getElementById("name").value, "username": document.getElementById("username").value, "password": document.getElementById("password").value};
    var config = {headers: {'Content-Type': 'application/json'}};

    //send registration information to the server and check if the registration was successful
    axios.post('http://localhost:4242/api/register', registerContents, config).then(function (response) {
      if(response.data.message === "success") {
        window.location.replace("/");
      }
      else {
        console.log(response.data.message);
        document.getElementById("errormsg").innerHTML = response.data.message;
      }
    }).catch(function (error) {
      console.log(error);
    });
  }

  let [pageDisplay, setPageDisplay] = useState("login")

  const changePageDisplay = () => {
    setPageDisplay(pageDisplay === "login" ? "createaccount" : "login")
  }

  //using bootstrap form element for easier styling
  if(pageDisplay === "login") {
    return (
      <div className="login-container">
        <form className="login-form">
          <div className="login-form-content">
            <h3 className="login-form-title">Sign In</h3>
            <h5 className="login-form-subtitle" id="errormsg"> </h5>
            <div className="form-group mt-3">
              <label>Username</label>
              <input type="text" className="form-control mt-1" placeholder="Enter username" id="username"/>
            </div>
            <div className="form-group mt-3">
              <label>Password</label>
              <input type="password" className="form-control mt-1" placeholder="Enter password" id="password"/>
            </div>
            <div className="d-grid gap-2 mt-3">
              <button type="submit" onClick={loginExecute} className="btn btn-primary">
                Submit
              </button>
            </div>
            <br></br>
            <div className="text-center">
              Not registered yet?{" "}
              <span className="link-primary" onClick={changePageDisplay}>
                Sign Up
              </span>
            </div>
          </div>
        </form>
      </div>
    )
  }
  //again using bootstrap form element for easier styling
  return (
    <div className="login-container">
      <form className="login-form">
        <div className="login-form-content">
          <h3 className="login-form-title">Register</h3>
          <h5 className="login-form-subtitle" id="errormsg"> </h5>
          <div className="form-group mt-3">
            <label>Full Name</label>
            <input type="text" className="form-control mt-1" placeholder="Full Name" id="name" />
          </div>
          <div className="form-group mt-3">
            <label>Username</label>
            <input type="text" className="form-control mt-1" placeholder="Username" id="username" />
          </div>
          <div className="form-group mt-3">
            <label>Password</label>
            <input type="password" className="form-control mt-1" placeholder="Password" id="password" />
          </div>
          <div className="d-grid gap-2 mt-3">
            <button type="submit" onClick={registerExecute} className="btn btn-primary">
              Submit
            </button>
          </div>
          <br></br>
          <div className="text-center">
            Already registered?{" "}
            <span className="link-primary" onClick={changePageDisplay}>
              Sign In
            </span>
          </div>
        </div>
      </form>
    </div>
  )
}