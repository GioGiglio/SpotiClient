/*
var http = require('http');

http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(req.toString());
    
}).listen(8080);
*/

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
})

app.post('/userPlaylists',function(req, res){
    query.playlistsForUser(res, connection, req.body.uname);
})
