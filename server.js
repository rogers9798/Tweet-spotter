var express = require('express');
var path = require('path'); 

var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);;

var Twitter = require('twitter');
var request = require("request");

var mysql = require('mysql');

var mysql = require('mysql');

var connect =  mysql.createPool({
host : 'localhost',
user : 'root',
password : '',
database : '' 
});

server.listen(3000);

//Twitter Credentials
var client = new Twitter({
    consumer_key: 'YOUR_CONSUMER_KEY',
    consumer_secret: 'YOUR_CONSUMER_SECRET',
    access_token_key: 'YOUR_ACCESS_TOKEN_KEY',
    access_token_secret: 'YOUR_ACCESS_TOKEN_SECRET'
  });

 
app.get('/',function(req,res){
	res.set({
		'Access-Control-Allow-Origin' : '*'
	});
	return res.redirect('/public/index.html');
});

console.log("Server listening at : 3000");

app.use('/public', express.static(__dirname + '/public'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ 
	extended: true
}));

io.on('connection', function (socket) {
	
	socket.emit('welcome', { data: 'welcome' });
	
	socket.on('keyword' , function(data){
		console.log(data);
		var keyword = data.keyword;
		var stream = client.stream('statuses/filter', {track: keyword});
		
		stream.on('data', function(event) {
			var tweet = event.text;
			var user = event.user.name;
			
			var insert_R = 'INSERT INTO tweet_repo(keyword,user,tweet) VALUE(?,?,?)';
			
			connect.getConnection(function(err, connection){				
			 
				connection.query(insert_R,[keyword,user,tweet], function(error,res){
					if(error) throw error;
					else {
							var content = {
								keyword : keyword,
								user : user,
								tweet : tweet
							}
							console.log("Keyword is ::>> " + keyword);
							console.log("Tweeted by ::>>" + event.user.name);
							console.log("Tweet is ::>>" + event.text );
							console.log('Details added successfully');
							
							socket.emit('livetweets' , { data : content })

					}
				});
			
				socket.on('stop' , function(data){
					connection.release();
				});
				
			});
			
		});

		stream.on('error', function(error) {
			throw error;
		});	  
	});
});