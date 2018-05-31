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
    res.sendFile(path.resolve('public/index.html'));
});


/* Login form */
app.post('/login', function(req, res){
    var uname = req.body.uname;
    var psw = req.body.psw;
    queryLogin(res, uname, psw);
});

function querySongs(res){
    connection.query('SELECT * FROM Songs', function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    });
}

function queryLogin(res, uname, psw){
    connection.query("SELECT * FROM Users WHERE username = '"+uname+"' AND psw_hash = '"+psw+"'",
    function(error, results, fields){
        if (error) throw error;
        
        // check if result is valid
        if (results[0] !== undefined){
            // Access granted, redirect to /
            res.redirect('/');
        }
        else {
            // Access denied, redirect to login.html
            res.redirect('login.html');
        }
    });
}