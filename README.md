# Taylors-Version
Quick project implemented using React.js, node.js, and sqlite that manages users on a game and allows them to play a quiz for any of their favorite music artists. The quiz dynamically prompts the user with a lyric from a random song or selected album and asks players to guess which song the lyric corresponds to competing for a high score.

Installation Instruction:
- ensure nodejs, npm, npx, and react are installed
- clone the repository by running (git clone https://github.com/ChangePlusPlusVandy/change-coding-challenge-2022-ZeroDayTea.git) in a terminal
- change your working directory to the backend folder (cd change-coding-challenge-2022-ZeroDayTea/backend)
- install all necessary packages (npm install)
- start the backend server by running (node server.js)
- open a new terminal instance and change your working directory to the frontend folder (cd [/path/to/base]/change-coding-challenge-2022-ZeroDayTea/frontend)
- install all necessary packages (npm install)
- start the frontend react app (npm start)


Instructions for Gameplay:
- there are two default test users built into the database already with username and passwords (asdf:asdf) and (dobranp:dobranp)
- either sign in with one of the two users by entering their usernames and passwords or click "Sign Up" to register a new user
- after signing in you will be prompted with two dropdowns: Artist and Album
- select an Artist from the Artist dropdown
- the Album dropdown will be autopopulated with albums from that artist so select an Album
- click "Play Game!"
- after requesting a random lyric, the screen will display a song lyric along with four clickable buttons of song options. click the one you think that the song lyric corresponds to
- the game will continue showing questions until you have answered 5 of them after which it will display your score
- click "Play Again!" to go back to the home screen

Known Issues:
- requesting song lyrics can sometimes take some time because of the free version of the musixmatch API as well as due to poor internet connection
- if the user selects a solo album from an artist then it will display the same lyric repeatedly as a limitation of the musixmatch track.snippet.get API endpoint
- if the server is not running and the react app attempts to connect it will not throw the user an error message
- after clicking "Play Again!" the page will occasionally redirect to the login screen instead of the select Album and Artist screen depending on whether the user is in an incognito tab or in certain browsers
