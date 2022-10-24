import React, { useState, useEffect } from "react";
import axios from 'axios';

//variables needed to be declared globally and used throughout the component
var selectedArtist = "";
var selectedAlbum = "";
var currentCorrectAnswer = "";
var questionNum = 1;
var numCorrect = 0;
var totalQuestions = 5;

export default function Play(props) {
    //go back to the main screen after fininshing
    const resetGame = () => {
        window.location.reload(false);
    }

    //screen that display the results after finishing the game and allows the user to play again
    const displayResults = () => {
        var mainContainer = document.getElementById("mainContainer");
        mainContainer.innerHTML = "";
        var gameTitle = document.getElementById("gameTitle");
        gameTitle.innerHTML = "Results";
        mainContainer.innerHTML += "<p className='login-form-title'  style='text-align: center'>You got " + numCorrect + " out of " + totalQuestions + " correct!</p>";
        var backButton = document.createElement("button");
        backButton.innerHTML = "Play Again!";
        backButton.className = "btn btn-primary";
        backButton.onclick = function() {resetGame()};
        mainContainer.appendChild(backButton);
        mainContainer.innerHTML += "</div>";
    }

    //update the list of albums after a user selects a new artist
    const handleArtistChange = () => {
        axios.get('http://localhost:4242/api/albums?artist=' + document.getElementById("artistsList").value).then(function (response) {
            var albumList = "";
            for (var i = 0; i < response.data.length; i++) {
                albumList += "<option value=\"" + response.data[i][1] + "\">" + response.data[i][0] + "</option>";
            }
            console.log(albumList);
            document.getElementById("albumsList").innerHTML = albumList;
        });
    }
    
    //check if the button that the user clicked was the one corresponding to the correct answer
    const checkAnswerCorrectness = (answerGuess) => {
        if(answerGuess === currentCorrectAnswer) {
            console.log("Correct!");
            questionNum++;
            numCorrect++;
            gameLoop();
        }
        else {
            console.log("Incorrect!");
            questionNum++;
            gameLoop();
        }
    }
    
    //main game loop that updates the screen with the next question
    const gameLoop = () => {
        //get the user selections before the first question
        if(questionNum === 1) {
            selectedArtist = document.getElementById("artistsList").value;
            selectedAlbum = document.getElementById("albumsList").value;
        }
        //if the user has answered all the questions, display the results
        if(questionNum === totalQuestions+1) {
            displayResults();
        }
        //otherwise, update the screen with the next question
        else {
            //main question header
            var mainContainer = document.getElementById("mainContainer");
            mainContainer.innerHTML = "";
            var gameTitle = document.getElementById("gameTitle");
            gameTitle.innerHTML = `Question ${questionNum}`;
    
            //create the div to contain the question
            mainContainer.innerHTML += "<div className='form-group mt-3'><h5 className='login-form-title'  style='text-align: center'>Which song is this lyric from?</h5>";
            var requestUrl = 'http://localhost:4242/api/lyric?artist=' + encodeURIComponent(selectedArtist) + '&album=' + encodeURIComponent(selectedAlbum);
            console.log(requestUrl);
            //request a song snippet and wrong answers to display
            axios.get(requestUrl).then(function (response) { 
                let responseJSON = response.data;
                var snippet = responseJSON["Song Snippet"];
                var songName = responseJSON["Song Name"];
                var wrongAnswers = responseJSON["Wrong Answers"];
    
                mainContainer.innerHTML += "<p className='login-form-title' style='text-align: center'> \"" + snippet + "\"</p></div>";
    
                //merge the wrong and right answers into one array
                var answerChoices = [songName];
                currentCorrectAnswer = songName;
                while (wrongAnswers.length) {
                    answerChoices.splice(Math.floor(Math.random() * (answerChoices.length + 1)), 0, wrongAnswers.pop());
                }
    
                //generate all the buttons
                for(var i = 0; i < answerChoices.length; i++) {
                    var answerButton = document.createElement("button");
                    answerButton.innerHTML = answerChoices[i];
                    answerButton.className = "btn btn-primary";
                    answerButton.onclick = function() {checkAnswerCorrectness(this.innerHTML)};
                    mainContainer.appendChild(answerButton);
    
                    var answerButtonBreak = document.createElement("br");
                    mainContainer.appendChild(answerButtonBreak);
                    var answerButtonBreak2 = document.createElement("br");
                    mainContainer.appendChild(answerButtonBreak2);
                }
            });
        }
    }

    //implementation of useState to not let the user interact with the app while it is still requesting artists
    const [isLoading, setLoading] = useState(true);
    var [artistItems, setArtists ] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:4242/api/artists").then(response => {
            artistItems = [];
            for(var i = 0; i < response.data.length; i++) {
                artistItems.push({value: response.data[i], label: response.data[i]});
            }
            setArtists(artistItems);
            setLoading(false);
        });
      }, []);

    if (isLoading) {
        return <div className="App">Loading...</div>;
    }
    
    //main contents to display upon first loading in
    return (
        <div className="login-container">
          <form className="login-form">
            <div className="login-form-content">
              <h3 className="login-form-title" id="gameTitle">Taylor's Version</h3>
              <h5 className="login-form-error" id="errormsg"> </h5>
              <div className="mainContainer" id="mainContainer">
              <h5 className="login-form-subtitle" id="welcomemsg"> Welcome {localStorage.getItem('name')}!</h5>
                <div className="form-group mt-3">
                    <label>Artist</label>
                    <select className="form-control mt-1" id="artistsList" onChange={handleArtistChange} >
                        <option value="" selected disabled> -- Select Artist -- </option>
                        {artistItems.map((option) => (
                            <option key={option.value} value={option.value}>{option.value}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group mt-3">
                    <label>Album</label>
                    <select className="form-control mt-1" id="albumsList"/>
                </div>
                <div className="d-grid gap-2 mt-3">
                    <button type="submit" className="btn btn-primary" onClick={gameLoop}>
                    Play Game!
                    </button>
                </div>
              </div>
              <br></br>
            </div>
          </form>
        </div>
      )
}