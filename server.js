var express = require("express")
var mongoose = require("mongoose")
var bodyParser = require("body-parser")
var session = require('express-session');
var path = require('path');

var app = express()
var http = require("http").Server(app)
var io = require("socket.io")(http)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//var conString = "mongodb://admin:admin@ds038319.mlab.com:38319/mylearning"
var conString = "mongodb://localhost:27017/dbchat";
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

mongoose.Promise = Promise

var Chats = mongoose.model("Chats", {
    name: String,
    chat: String
})

mongoose.connect(conString, { useMongoClient: true }, (err) => {
    console.log("Database connection", err)
})

//Session
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));
var auth = function(req, res, next) {
  if (req.session && req.session.user === "amy" && req.session.admin)
    return next();
  else
    return res.sendStatus(401);
};

app.post('/login', function(req, res, next){
    if(req.body.password === req.body.password2){
        req.session.username = req.body.username;
        res.redirect('/chat');
    }
});

app.get('/logout', function(req, res, next){
    req.session.destroy();
    res.redirect('/');
})

//Routes
app.get('/', function(req, res){
    res.render('index');
});

app.get('/chat', function(req, res){
    //res.render('index');
        Chats.find({}, (error, chats) => {
            res.render('chat', {chats: chats, user: req.session.username});
        })
});

//Post y Get info
app.post("/add", async (req, res) => {
    try {
        var chat = new Chats(req.body)
        await chat.save()
        
        res.sendStatus(200)
        //Emit the event
        io.emit("chat", req.body)
        //res.redirect('/')
    } catch (error) {
        res.sendStatus(500)
        console.error(error)
    }
})

app.get("/chats", (req, res) => {
    Chats.find({}, (error, chats) => {
        res.send(chats)
    })
})

app.get('/delete', function(req, res, next) {
  var id = req.param('id');
  //var id = req.body.id;
  Chats.findByIdAndRemove(id).exec();
     res.redirect('/chat');
});

io.on("connection", (socket) => {
    console.log("Socket is connected...")
})

var server = http.listen(3020, () => {
    console.log("Well done, now I am listening on ", server.address().port)
})