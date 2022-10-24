const express = require("express");
const cors = require("cors");
const app = express();
const configFile = require("./config.json");
const axios = require("axios");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./server.db");
const bcrypt = require("bcrypt");
//added security to password hashing
const saltRounds = 10;

//database structure
//table users
//columns: userid int (primary key autoincrement)
//name nvarchar not null
//username nvarchar not null
//password nvarchar not null
//highscore int  not null default 0


const SERVER_API_BASE = configFile.SERVER_API_BASE;
const SERVER_API_PORT = configFile.SERVER_API_PORT;
const API_KEY = configFile.MUSIXMATCH_KEY;
const REMOTE_API_BASE = configFile.MUSIXMATCH_API;

app.use(cors({
	origin: "http://localhost:3000"
}));

app.use(express.json());

//function to convert an artist name to an id for use with the musixmatch api
function getArtistID(artistName) {
	return new Promise((resolve, reject)=>  {
		let requestUrl = `${REMOTE_API_BASE}artist.search?apikey=${API_KEY}&q_artist=${artistName}&page_size=1`;
		axios.get(requestUrl).then((response) => { //TODO: add error handling
			let id = response.data.message.body.artist_list[0].artist.artist_id;
			resolve(id);
		});
	});
}

//function to get a list of albums for a given artist
async function getAlbumsFromArtist(artistID) {
	return new Promise((resolve, reject)=>  {
		let requestUrl = `${REMOTE_API_BASE}artist.albums.get?apikey=${API_KEY}&artist_id=${artistID}`;

		axios.get(requestUrl).then((response) => { //TODO: add error handling
			let albumsJSON = response.data;
			let albumArray = [];
			for(let i = 0; i < albumsJSON.message.body.album_list.length; i++) {
				let albumName = albumsJSON.message.body.album_list[i].album.album_name;
				let albumID = albumsJSON.message.body.album_list[i].album.album_id;
				let albumElement = [albumName, albumID];
				albumArray.push(albumElement);
			}
			resolve(albumArray);
		});
	});
}

//function to return a random track from a given album
async function getTrackFromAlbum(albumName, artistID) {
	return new Promise((resolve, reject)=>  {
		let requestUrl = `${REMOTE_API_BASE}album.tracks.get?apikey=${API_KEY}&album_id=${albumName}&f_has_lyrics=true`;

		axios.get(requestUrl).then((response) => { //TODO: add error handling
			let tracksJSON = response.data;
			let trackArray = [];
			for(let i = 0; i < tracksJSON.message.body.track_list.length; i++) {
				let trackName = tracksJSON.message.body.track_list[i].track.track_name;
				let trackID = tracksJSON.message.body.track_list[i].track.track_id;
				let trackElement = [trackName, trackID];
				trackArray.push(trackElement);
			}
			let randomTrack = trackArray[Math.floor(Math.random() * trackArray.length)];
			resolve(randomTrack);
		});
	});
}

//get the list of artists to select from
app.get(SERVER_API_BASE + "/artists", (req, res) => {
	res.json(configFile.artists);
});

//get the list of albums to select from for a given artist
app.get(SERVER_API_BASE + "/albums", async (req, res) => {
	let artist = req.query.artist;
	let artistID = await getArtistID(artist);
	if(artistID == "No Such Artist") {
		res.send("No Such Artist"); //TODO: potential problem with this res.send sending error with HTTP headers
	}
	
	var albums = await getAlbumsFromArtist(artistID);
	var albumsNameArray = [];
	for(let i = 0; i < albums.length; i++) { 
		albumsNameArray.push([albums[i][0], albums[i][1]]);
	}
	res.json(albumsNameArray);
});

//get a random lyric sample from a song in a given album
app.get(SERVER_API_BASE + "/lyric", async (req, res) => {
	artist = req.query.artist;
	album = req.query.album;

	//ensure proper value for artist
	if(artist == null || artist == "") {
		let numArtists = configFile.artists.length;
		artist = configFile.artists[Math.floor(Math.random() * numArtists)];
	}
	artist = await getArtistID(artist);
	//ensure proper value for album
	if(album == null || album == "") {
		let albums = await getAlbumsFromArtist(artist);
		album = albums[Math.floor(Math.random() * albums.length)][1];
	}

	var randomTrack = await getTrackFromAlbum(album, artist);

	let requestUrl = `${REMOTE_API_BASE}track.snippet.get?apikey=${API_KEY}&track_id=${randomTrack[1]}`;
	axios.get(requestUrl).then(async (response) => { //TODO: add error handling
		if(response.data.message.body.snippet.snippet_body != "" && response.data.message.body.snippet.snippet_body != null) {
			let snippet = response.data.message.body.snippet.snippet_body;
			let songName = randomTrack[0];

			//generate wrong answers to use as options in the app
			var wrongAnswerSongsFromAlbum = [];
			for(let i = 0; i < 3; i++) {
				let albumsWrong = await getAlbumsFromArtist(artist);
				albumWrong = albumsWrong[Math.floor(Math.random() * albumsWrong.length)][1];
				let wrongAnswerSong = await getTrackFromAlbum(albumWrong, artist);
				wrongAnswerSongsFromAlbum.push(wrongAnswerSong[0]);
			}

			res.json({"Song Snippet": snippet, "Song Name": songName, "Wrong Answers": wrongAnswerSongsFromAlbum});
		} else {
			console.log("API Received Broken Song");
		}
	}).catch((error) => {
		console.log(error);
	});
});

// user registration
app.post(SERVER_API_BASE + "/register", (req, res) => {
	let name = req.body.name;
	let username = req.body.username;
	let password = req.body.password;

	//generate salted password hash and then add user to database
	bcrypt.hash(password, saltRounds, function(err, hash) {
		db.run(`INSERT INTO users (name, username, password) VALUES (?, ?, ?)`, [name, username, hash], function(err) { 
			if (err) {
				console.log("registration error: " + err);
				res.json({ "message": err.message });
			}
			console.log("user registered");
			res.json({ "message": "success" });
		});
	});
});

// user login
app.post(SERVER_API_BASE + "/login", (req, res) => { 
	let username = req.body.username;
	let password = req.body.password;

	//check if user exists in database and check password
	db.get(`SELECT * FROM users WHERE username='${username}' LIMIT 1`, (error, row) => {
		bcrypt.compare(password, row.password, function (error, result) {
			if(result) {
				console.log("login success");
				res.json({"message": "success", "highScore": row.highscore, "token": username, "name": row.name});
			} else {
				console.log("incorrect password");
				res.json({"message": "Incorrect Password"});
			}
		});
	})
});

//open the server on port 4242
app.listen(SERVER_API_PORT, () => {
	console.log("Server running on port " + SERVER_API_PORT);
});