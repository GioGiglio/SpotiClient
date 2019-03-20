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
    user     : 'gruppo15_admin',
    password : 'root',
    database : 'Gruppo15'
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

// Routes

/* serve main page */
app.get('/', function(req, res) {

    // check cookie
    if (parseUsername(req) === undefined){
        // user not logged
        res.sendFile(path.resolve('public/login.html'));
        console.log('User not logged, redirecting to login.html');
    } else {
        // user logged
        res.sendFile(path.resolve('public/index.html'));
        console.log('User logged, redirecting to main page');
    }
});

app.get('/index.html', function(req, res){
    if (parseUsername(req) !== undefined){
        res.sendFile(path.resolve('public/index.html'));
    } else {
        console.log('invalid cookie');
        // redirect to error page
        res.redirect('https://www.youtube.com/watch?v=Sagg08DrO5U');
    }
});

// serve static files
app.use(express.static('public'));

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

app.get('/userSongs',function(req, res){
    query.songsForUser(res, connection, parseUsername(req));
});

app.post('/addToUserSongs',function(req, res){
    var uname = parseUsername(req);
    var song_id = req.body.song_id;

    query.addUserSong(res, connection,uname, song_id);
});

app.post('/removeFromUserSongs',function(req, res){
    var uname = parseUsername(req);
    var song_id = req.body.song_id;

    query.removeUserSong(res, connection,uname, song_id);
});

app.get('/userPlaylists',function(req, res){
    query.playlistsForUser(res, connection, parseUsername(req));
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
        try{
            query.addSongsToPlaylist(connection,playlist_id,to_add);
        }
        catch (err){
            console.log(err.message);
            res.sendStatus(500);
            return;
        }
    }
    if (to_remove.length > 0){
        try{
            query.removeSongsFromPlaylist(connection, playlist_id, to_remove);
        }
        catch (err){
            console.log(err.message);
            res.sendStatus(500);
            return;
        }
    }
    res.sendStatus(200);
});

app.post('/createPlaylist',function(req,res){
    var uname = parseUsername(req);
    var playlist_name = req.body.playlist_name;

    query.newPlaylist(res,connection,uname,playlist_name);
})

app.post('/deletePlaylist', function(req, res){
    var playlist_id = req.body.playlist_id;

    query.deletePlaylist(res, connection, playlist_id);
});

app.post('/updateListeningSong', function(req, res){
    var uname = parseUsername(req);
    var song_id = req.body.song_id;

    query.updateListening(res, connection, uname, song_id);
});

app.get('/friendsListeningSongs', function(req, res){
    query.friendsListening(res, connection, parseUsername(req));
});

app.post('/addFriend', function(req, res){
    var uname = parseUsername(req);
    var friend = req.body.friend;
    query.addFriend(res, connection, uname, friend);
});

app.post('/removeFriend', function(req, res){
    var uname = parseUsername(req);
    var friend = req.body.friend;
    query.removeFriend(res, connection, uname, friend);
});

/**
 * Gets the username from the cookie of a request
 * @param {String} cookie the request
 * @returns the username value contained in the cookie
 */
function parseUsername(req){
    var cookie = req.headers.cookie;

    if (cookie === undefined || cookie === 'username='){
        return undefined;
    }
    return req.headers.cookie.split('=')[1];
}
