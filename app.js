var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var dummyList = {};
var whoIsAlive = {};
var sixSecondsTooOld = 1000 * 6;
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express["static"](__dirname + '/public'));

app.post('/register-user', function(req, res) {
  dummyList[req.body["userName"]] = req.body["peerId"];
  res.send();
});

app.get("/read-user", function(req, res) {
  var theID = req.query["name"];
  res.send(dummyList[theID]);
});

app.get("/who-is-online", function(req, res) {
  var iam = req.query["iam"];
  if(iam !== "") {
    whoIsAliveTouch(iam);
  }
  res.send(Object.keys(dummyList));
});

var server = app.listen(port, function() {
  var host = server.address().address;
  var express_port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, express_port);
});

setInterval(cleanUpOldUsers, 2000);

function cleanUpOldUsers(){
  var now = Date.now();
  Object.keys(whoIsAlive).forEach(function(item) {
    if((whoIsAlive[item] + sixSecondsTooOld) < (now)) {
      console.log("Removing - " + item);
      delete whoIsAlive[item];
      delete dummyList[item];
    }
  });
}

function whoIsAliveTouch(name) {
  var now = Date.now();
  whoIsAlive[name] = now;
}