var express = require('express');
var path = require('path'); 

var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);;

var Twitter = require('twitter');
var request = require("request");

var mysql = require('mysql');

