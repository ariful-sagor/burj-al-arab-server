const express = require('express');
const app = express();
const port = 4000;
const cors= require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config()

const admin = require('firebase-admin');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dm8wp.mongodb.net/burjAlArab?retryWrites=true&w=majority`;


var serviceAccount = require("./burj-al-arab-f4d41-firebase-adminsdk-auoay-354e1e6c81.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then( result => {
        res.send(result.insertedCount >0);
    })
    })

  app.get('/bookings', (req, res)=>{
      const bearer= req.headers.authorization;
      if(bearer && bearer.startsWith("Bearer ")){
        const idToken= bearer.split(' ')[1] ;
        admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
          const tokenEmail = decodedToken.email;
          const queryEmail= req.query.email;
          if(tokenEmail== queryEmail){
            bookings.find({email: queryEmail})
                  .toArray((err,documents) =>{
                      res.send(documents);
                  })
          }
          else{
            res.status(401).send("Unauthorized Access");
          }
        

        }).catch(function(error) {
          res.status(401).send("Unauthorized Access")
        });
      }
      else{
          res.status(401).send("Unauthorized Access");
        }
      

      
    })


});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)