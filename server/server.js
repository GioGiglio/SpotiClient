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
app.use(bodyParser.json());

/* serves main page */
app.get('/', function(req, res) {
    res.sendFile(path.resolve('public/index.html'));
});

// static files
app.use(express.static('public'));

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'SpotiClient'
});
 
connection.connect(function(error){
	if (error) throw new Error('MYSQL: Error while connecting');
});
 
app.listen(8080, () => console.log('App listening on port 8080!'));

app.post("", function(req, res){
    console.log(req.body.username);    
    console.log(req.body.password);
    querySongs(res);
  });

function querySongs(res){
    connection.query('SELECT * FROM Songs', function (error, results, fields) {
    if (error) throw error;
        console.log('The solution is: ', results[0].solution);
    });
    connection.end();
}