const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin:true});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
 exports.helloWorld = functions.https.onRequest((request, response) => {
     cors(function (request, response){
        admin.database().ref('posts').push({
            id: request.body.id,
            title: request.body.title,
            location: request.body.location,
            image: request.body.image
        })
        .then(function(){
            response.status(201).json({message: 'Data Stored', id: request.body.id});
        });
     });
  //response.send("Hello from Firebase!");
 });
