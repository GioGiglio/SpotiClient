const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
var request;
var query = require('./queries.js');

// MySql
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'SpotiClient'
});

// Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.json());
app.listen(8080, () => console.log('App listening on port 8080!'));

// connect to database
connection.connect(function(error){
	if (error) throw new Error('MYSQL: Error while connecting');
});

// serve static files
app.use(express.static('public'));

// Routes

/* serve main page */
app.get('/', function(req, res) {
    /* if user is already logged -> public/index.html
    else -> public/login.html */
    res.sendFile(path.resolve('public/index.html'));
});


/* Login form */
app.post('/login', function(req, res){
    var uname = req.body.uname;
    var psw = req.body.psw;
    query.login(res, connection, uname, psw);
});

app.post('/register',function(req, res){
    var uname = req.body.username;
    var email = req.body.email;
    var psw = req.body.psw1;
    query.addUser(res, connection, uname, email, psw);
});

app.post('/userSongs',function(req, res){
    query.songsForUser(res, connection, req.body.uname);
});

app.post('/userPlaylists',function(req, res){
    query.playlistsForUser(res, connection, req.body.uname);
});

// Gets a the ids of user's playlists.
// Returns for each playlist, the ids of the songs contained.
app.post('/playlistsSongs',function(req, res){
    query.playlistsSongs(res, connection, req.body);
});

app.get('/allSongs',function(req,res){
    query.allSongs(res,connection);
});

app.post('/updatePlaylist', function(req,res){
    var playlist_id = req.body.playlist_id;
    var to_add = req.body.to_add;
    var to_remove = req.body.to_remove;

    var r;
    if (to_add.length > 0){
        r = query.addSongsToPlaylist(connection,playlist_id,to_add);
    }
    if (to_remove.length > 0){
        r = query.removeSongsFromPlaylist(connection, playlist_id, to_remove);
    }
    res.json(r);
});