/*
token=BQ9zKt8gVZAUo0HVqVPYMCGd
team_id=T0001
team_domain=example
channel_id=C2147483705
channel_name=test
user_id=U2147483697
user_name=Steve
command=/weather
text=94070
response_url=https://hooks.slack.com/commands/1234/5678
*/

var express = require('express')
  , http = require('http')
  , app = express()
  , bodyParser = require('body-parser')
  , server = http.createServer(app);

const HOST = '190.24.186.215';
const PORT = 3000;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/',function(req,res){
  res.end("This channel now it's locked");
});

app.post('/',function(req,res){
  console.log(req.body);
  res.end("This channel now it's locked");
});

server.listen(PORT, function(){
  console.log("Server listening on: %s:%s", HOST, PORT);
});
