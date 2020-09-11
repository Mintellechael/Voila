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
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}))

const cloudinary = require("cloudinary").v2;

cloudinary.config({
cloud_name: process.env.CLOUD_NAME,
api_key: process.env.API_KEY,
api_secret: process.env.API_SECRET
});


const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/testVoiladb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false });

mongoose.connection.on("error", err => {
  console.log("err", err)
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected")
});

const Mongoose = require("mongoose")


var crypto = require("crypto");
var genRandomString = function(length){
  return crypto.randomBytes(Math.ceil(length/2)).toString("hex").slice(0,length);
}
var sha512 = function(password,salt){
  var hash = crypto.createHmac("sha512", salt);
  hash.update(password);
  var value = hash.digest('hex');
  return {
    salt:salt,
    passwordHash:value
  };
};

function saltHashPassword(userpassword) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(userpassword, salt);
    console.log('UserPassword = '+userpassword);
    console.log('Passwordhash = '+passwordData.passwordHash);
    console.log('nSalt = '+passwordData.salt);
    return [passwordData.passwordHash, passwordData.salt];
}

function validatePassword(userpassword,salt) {
  var passwordData = sha512(userpassword, salt);
  return passwordData.passwordHash;
}







// --------------------------------------------------------------------



// ----------------------------------------------------------------------
var photos = [];
var userName1 = "";
module.exports = photos;


const voilaUserSchema = new mongoose.Schema ({
  username : String,
  password: String,
  salt: String,
  firstName : String,
  lastName : String,
  weight : Number,
  height: Number,
  bmi: Number,
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
  res.render('login');
});

app.get("/login",(req,res) => {
res.render('login');
});

app.post("/login", (req,res) => {

var username = req.body.username;
var password = req.body.password;

VoilaUser.find({ username : username}, function (err, docs) {

     if (err) {
     console.log(err)
     }

     else if (docs[0].username === username) {
           if (validatePassword(password,docs[0].salt) === docs[0].password) {
                 if (docs[0].beforePics.front != undefined) {
                   var beforeFront = docs[0].beforePics.front ;
                   var beforeLeft = docs[0].beforePics.left ;
                   var beforeRight = docs[0].beforePics.right ;
                   var beforeBack = docs[0].beforePics.back ;

                   var afterFront = docs[0].afterPics.front ;
                   var afterLeft = docs[0].afterPics.left ;
                   var afterRight = docs[0].afterPics.right ;
                   var afterBack = docs[0].afterPics.back;

                   res.render('loginPost', {
                     beforeFront:beforeFront,
                     beforeLeft:beforeLeft,
                     beforeRight:beforeRight,
                     beforeBack:beforeBack,
                     afterFront:afterFront,
                     afterLeft:afterLeft,
                     afterRight:afterRight,
                     afterBack:afterBack
                      });
                 }
                 else {
                 console.log(docs);
                 res.render('yop', {username: docs[0].username} );
               }
             }

     }
     else {
       console.log("password or username is incorrect!")
     }
});


});

app.get("/register",(req,res) => {
res.render('register');
});

app.post("/register", (req,res) => {
  var hashAndSaltPass = saltHashPassword(req.body.password);
  var username = req.body.username;
  var password = hashAndSaltPass[0];
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var weight = req.body.weight;
  var height = req.body.height;
  var salt = hashAndSaltPass[1];

  var bmiWeight = weight * 0.453592;
  var bmiHeight = Math.pow(height * 0.3048, 2);
  var bmi = bmiWeight / bmiHeight;

  VoilaUser.find({ username: username}, function (err, docs) {
    if (err) {
      console.log(err);
    }
    else if (docs.length === 0) {

      const user = new VoilaUser ({
        username : username,
        password: password,
        salt: salt,
        firstName : firstName,
        lastName : lastName,
        weight : weight,
        height: height,
        bmi: bmi
      });

      user.save();

      console.log("you've been successfully registered!");
      res.render('login');
    }

    else {
      console.log("you already have an account!");
      res.render('login');
    }

  });
  });



app.post('/upload',(req, res, next) => {
var username = req.body.username;

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

  VoilaUser.findOneAndUpdate({username: username},
  { $set: { beforePics : {front : photos[0] , left : photos[2], right : photos[4], back: photos[6]},
   afterPics : {front : photos[1] , left : photos[3], right : photos[5], back: photos[7]}}},
   function (err,doc) {
     if (err){
       console.log(err);
     }
     else {
       console.log(username);
       console.log("update successful!");
       console.log(doc);
     }
   });





  res.render('yopPost', {photos:photos});


}


});



app.listen(port,() => {
  console.log("UP AND RUNNINNNN!");
});
