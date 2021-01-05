require("dotenv").config();

// Package Requirements
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const fs = require('fs');
const ejs = require("ejs");

const express = require("express");
const app = express();
const path = require('path');

// Set up Express, EJS , bodyParser
app.use(express.static(path.join(__dirname,"public")));
app.use(fileUpload({useTempFiles : true,
    tempFileDir : '/tmp/'}));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}))

// Cloud api setup for users pictures
const cloudinary = require("cloudinary").v2;

cloudinary.config({
cloud_name: process.env.CLOUD_NAME,
api_key: process.env.API_KEY,
api_secret: process.env.API_SECRET
});


// Mongoose Setup
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-mikey:needher101@voila.hdzpc.mongodb.net/voilaDB", {
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

// Random password generator Setup

var generator = require('generate-password');


// Password Salt and Hash Requirements
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

var photos = [];
var publicIds = [];

// Database Setup --------------------------------------------------------------
const voilaUserSchema = new mongoose.Schema ({
  username : String,
  password: String,
  salt: String,
  friendCode: String,
  firstName : String,
  lastName : String,
  beforeWeight : Number,
  afterWeight : Number,
  secrets : String,
  height: Number,
  beforeBmi: Number,
  afterBmi: Number,
  beforePics : {front: String , left : String , right: String, back : String},
  afterPics : {front: String , left : String , right: String, back : String},
  publicIds : {id1: String, id2: String, id3: String, id4: String, id5: String, id6: String, id7: String, id8: String}
});


const VoilaUser = new mongoose.model("VoilaUser", voilaUserSchema);



// Routes ----------------------------------------------------------------------


// INDEX

app.get("/",(req,res) => {
  res.render('index');
});

// LOGIN PAGE

app.get("/login",(req,res) => {
res.render('login');
});

// REGISTER PAGE

app.get("/register",(req,res) => {
res.render('register');
});

app.get("/friendCode", (req,res) => {
  res.render('friendCode');
});


// REGISTER FUNCTIONALITY

app.post("/register", (req,res) => {
  var hashAndSaltPass = saltHashPassword(req.body.password);
  var username = req.body.username;
  var password = hashAndSaltPass[0];
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var beforeWeight = req.body.beforeWeight;
  var afterWeight = req.body.afterWeight;
  var feet = req.body.feet;
  var inches = req.body.inches;
  var secrets = req.body.secrets;

  var friendCode = generator.generate({
      length: 10,
      numbers: true });


  var salt = hashAndSaltPass[1];

  var height = feet+"."+inches;
  var beforeBmiWeight = beforeWeight * 0.453592;
  var afterBmiWeight = afterWeight * 0.453592;
  var bmiHeight = Math.pow(height * 0.3048, 2);
  var beforeBmi = beforeBmiWeight / bmiHeight;
  var afterBmi = afterBmiWeight / bmiHeight;



  // Adds user to database if they dont already exists

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
        beforeWeight : beforeWeight,
        afterWeight : afterWeight,
        height: height,
        beforeBmi: beforeBmi,
        afterBmi: afterBmi,
        secrets: secrets,
        friendCode : friendCode,
      });

      user.save();
      var message = "you've been successfully registered!";
      console.log("you've been successfully registered! Login!");
      console.log("the code to share with friends is : " + friendCode);
      res.render('loginSuccess', {message:message , friendCode : friendCode });
    }

    else {
      var message = "User already exists! Login!";
      console.log("you already have an account!");
      res.render('loginSuccess', {message:message, friendCode: friendCode });
    }

  });
  });



  // Code for user uploading their before and after pics
  app.post('/upload',(req, res, next) => {
  var username = req.body.username;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var height = req.body.height;
  var beforeWeight = req.body.beforeWeight;
  var afterWeight = req.body.afterWeight;
  var beforeBmi = req.body.beforeBmi;
  var afterBmi = req.body.afterBmi;
  var secrets = req.body.secrets;
  var friendCode = req.body.friendCode;


  const file = req.files.image;
  console.log(file);

  cloudinary.uploader.unsigned_upload(file.tempFilePath, "ar2yg47b" , {cloud_name : "hr2frvpey"}, function(err,result) {
    var cloudPhotos = [];
    console.log("Error :", err);
    console.log("Result :", result.url, result.public_id);

   publicIds.push(result.public_id);
   photos.push(result.url);


   console.log("photo link " + photos);
   console.log("public id " + publicIds);
   console.log("Array size " + photos.length)

   if (photos.length === 8) {


  // Adds uploaded photos to users account in database
     VoilaUser.findOneAndUpdate({username: username},
     { $set: { beforePics : {front : photos[0] , left : photos[2], right : photos[4], back: photos[6]},
      afterPics : {front : photos[1] , left : photos[3], right : photos[5], back: photos[7]},
      publicIds : {id1 : publicIds[0], id2 : publicIds[1], id3 : publicIds[2], id4 : publicIds[3],
                  id5 : publicIds[4], id6 : publicIds[5], id7 : publicIds[6], id8 : publicIds[7]}}},
      function (err,doc) {
        if (err){
          console.log(err);
        }
        else {
          console.log(username + firstName + lastName);
          console.log("update successful!");
          console.log(doc);


          res.render('postPics', {firstName : firstName,
            username:username,
            lastName: lastName,
            height : height,
            photos:photos,
            beforeWeight : beforeWeight,
            afterWeight : afterWeight,
            secrets : secrets,
            beforeBmi : Math.round(beforeBmi,2),
            afterBmi: Math.round(afterBmi,2),
            friendCode:friendCode,
            publicIds: publicIds
            });

        }
      });

   }



  });

  });


// LOGIN FUNCTIONALITY
app.post("/login", (req,res) => {

var username = req.body.username;
var password = req.body.password;
var friendCode = req.body.friendCode;

console.log("user input = " + username);


// Check Database To See If User Exists
VoilaUser.find({ username : username}, function (err, docs) {

     if (err || docs === []) {
     console.log(err)
      }

     if (!docs.length) {
       var error =  "user does not exist!";
       res.render('loginError', {error:error});
       console.log("Password is incorrect!!!");
       console.log(err)
     }



     else if (docs[0].username === username && docs[0].username != undefined ) {
           if (validatePassword(password,docs[0].salt) === docs[0].password) {
                 if (docs[0].beforePics.front != undefined && docs[0].beforePics.front != " ") {
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
                     afterBack:afterBack,
                     username: docs[0].username,
                     firstName: docs[0].firstName,
                     lastName: docs[0].lastName,
                     beforeWeight: docs[0].beforeWeight,
                     afterWeight: docs[0].afterWeight,
                     beforeBmi: Math.round(docs[0].beforeBmi,2),
                     afterBmi: Math.round(docs[0].afterBmi,2),
                     height: docs[0].height,
                     secrets: docs[0].secrets,
                     friendCode:docs[0].friendCode,
                     publicIds:docs[0].publicIds
                      });
                 }
                 else {
                 console.log(docs);
                 res.render('uploadPics', {username: docs[0].username,
                                           firstName: docs[0].firstName,
                                           lastName: docs[0].lastName,
                                           beforeWeight: docs[0].beforeWeight,
                                           afterWeight: docs[0].afterWeight,
                                           beforeBmi: docs[0].beforeBmi,
                                           afterBmi: docs[0].afterBmi,
                                           height: docs[0].height,
                                           secrets: docs[0].secrets,
                                           friendCode : docs[0].friendCode,
                                           publicIds: docs[0].publicIds
                                           });
               }
             }
     else {
       var error =  "password is incorrect";
       res.render('loginError', {error:error});
       console.log("Password is incorrect!!!");
     }
   }
});
});


// POSTING TO FRIEND CODE PAGE
app.post('/friendCode', (req,res) => {

  var friendUsername = req.body.friendUsername;
  var friendCode = req.body.friendCode;

  VoilaUser.find({ username : friendUsername}, function (err, docs) {
       if (err) {
       console.log(err)
       }

       else if (docs[0].username === friendUsername) {
         console.log(docs[0].friendCode);
             if (friendCode === docs[0].friendCode) {

                     res.render('friendPost', {
                       beforeFront: docs[0].beforePics.front,
                       beforeLeft: docs[0].beforePics.left,
                       beforeRight: docs[0].beforePics.right,
                       beforeBack: docs[0].beforePics.back,
                       afterFront: docs[0].afterPics.front,
                       afterLeft: docs[0].afterPics.left,
                       afterRight: docs[0].afterPics.right,
                       afterBack: docs[0].afterPics.back,
                       username: docs[0].username,
                       firstName: docs[0].firstName,
                       lastName: docs[0].lastName,
                       beforeWeight: docs[0].beforeWeight,
                       afterWeight: docs[0].afterWeight,
                       beforeBmi: Math.round(docs[0].beforeBmi),
                       afterBmi: Math.round(docs[0].afterBmi),
                       height: docs[0].height,
                       secrets: docs[0].secrets
                        });
                   }
                   else {
                      console.log("unsuccessful");
                   }
               }
       else {
         console.log("code is incorrect! you dont have access to this magic show!")
         // var error =  "password is incorrect";
         // res.render('loginError', {error:error});
         // console.log("Password is incorrect!!!");
       }
     });
  });



// RESETTING/DELETING PICTURES FROM LOGIN

  app.post('/loginPost', (req,res) =>  {

    var username = req.body.usernameReset;

    VoilaUser.findOneAndUpdate({username: username},
    { $set: { beforePics : {front : " " , left : " ", right : " ", back: " "},
     afterPics : {front : " " , left : " ", right : " ", back: " "}}},
     function (err,doc) {
       if (err){
         console.log(err);
       }
       else {
         cloudinary.api.delete_resources(publicIds, function(err,result) {
           console.log(result,err);
         });
         res.render('login');
       }
     });
  });

  // RESETTING/DELETING PICTURES FROM Upload POST
  app.post('/postPics', (req,res) =>  {


    var username = req.body.usernameReset;
    VoilaUser.findOneAndUpdate({username: username},
    { $set: { beforePics : {front : " " , left : " ", right : " ", back: " "},
     afterPics : {front : " " , left : " ", right : " ", back: " "}}},
     function (err,doc) {
       if (err){
         console.log(err);
       }
       else {
         cloudinary.api.delete_resources(publicIds, function(err,result) {
           console.log(result,err);
         });
         res.render('login');
       }
     });
  });



// SERVER CONNECTIVITY
  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }

app.listen(port,() => {
  console.log("UP AND RUNNINNNN!");
});
