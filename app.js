require("dotenv").config();

const fileUpload = require("express-fileupload");

const bodyParser = require("body-parser");
const fs = require('fs');
const ejs = require("ejs");




const express = require("express");
const app = express();
const port = 3000;
const path = require('path');

app.use(express.static(path.join(__dirname,"public")));
app.use(fileUpload({useTempFiles : true,
    tempFileDir : '/tmp/'}));
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json());
app.set('view engine', 'ejs');


const cloudinary = require("cloudinary").v2;

cloudinary.config({
cloud_name: process.env.CLOUD_NAME,
api_key: process.env.API_KEY,
api_secret: process.env.API_SECRET
});


const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/testVoiladb", {
  useNewUrlParser: "true",
});
mongoose.connection.on("error", err => {
  console.log("err", err)
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected")
});

const Mongoose = require("mongoose")






// --------------------------------------------------------------------

var weight = 220 * 0.453592;
var height = Math.pow(6 * 0.3048, 2);
var bmi = weight / height;

// ----------------------------------------------------------------------
var photos = [];
module.exports = photos;


const voilaUserSchema = new mongoose.Schema ({
name : String,
password : String,
weight : Number,
height : Number,
beforePics : {front: String , left : String , right: String, back : String},
afterPics : {front: String , left : String , right: String, back : String}
});

const VoilaUser = new mongoose.model("VoilaUser", voilaUserSchema);

const selah = new VoilaUser ({
  name : "selah",
  password: "selahlovesmelo",
  weight : 180,
  height: 5.2,
  beforePics : {front : photos[0] , left : photos[2], right : photos[4], back: photos[6]},
  afterPics : {front : photos[1] , left : photos[3], right : photos[5], back: photos[7]},
});




app.get("/",(req,res) => {
  var drinks = "blueberry faygo";
res.render('yop' , {drinks: drinks , photos:photos});
});

app.get("/login",(req,res) => {
res.render('login');
});

app.get("/register",(req,res) => {
res.render('register');
});

app.post("/register", (req,res) => {
  var username = req.body.username;
  var password = req.body.password;

  VoilaUser.find({ name: "selah", password: "selahlovesmelo"}, function (err, docs) {
    if (err) {
      console.log(err);
    }
    else if (docs[0].password === password){
      console.log("you already have an account!");
      res.render('login');
    }
    else {
      const user = new VoilaUser ({
        name : username,
        password: password,
        weight : 300,
        height: 5.2,
        beforePics : {front : photos[0] , left : photos[2], right : photos[4], back: photos[6]},
        afterPics : {front : photos[1] , left : photos[3], right : photos[5], back: photos[7]},
      });

      user.save();

      console.log(docs)
      console.log("you've been successfully registered!");
      res.render('login');
    }

  });
  });



app.post('/upload',(req, res, next) => {
const file = req.files.image;
console.log(file);

cloudinary.uploader.upload(file.tempFilePath, function(err,result) {
  var cloudPhotos = [];
  console.log("Error :", err);
  console.log("Result :", result.url);

 photos.push(result.url);
 console.log(photos);
 console.log("Array size " + photos.length )


});

if (photos.length === 8) {

  // const selah = new VoilaUser ({
  //   name : "selah",
  //   password: "selahlovesmelo",
  //   weight : 180,
  //   height: 5.2,
  //   beforePics : {front : photos[0] , left : photos[2], right : photos[4], back: photos[6]},
  //   afterPics : {front : photos[1] , left : photos[3], right : photos[5], back: photos[7]},
  // });
  //
  // selah.save();

  res.render('yopPost', {photos:photos});


}


});



app.listen(port,() => {
  console.log("UP AND RUNNINNNN!");
});
