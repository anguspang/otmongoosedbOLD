const express = require("express");
const app = express();
const mongoose = require('mongoose')
require('./models/player')
const playerModel = mongoose.model('Player')
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@otwhitelistdb.cui00.mongodb.net/OTRBXDB?retryWrites=true&w=majority`, {useNewUrlParser: true});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
  console.log("Connection To MongoDB Atlas Successful!");
});

app.get("/player-data/:id", async (request, response) => {
  async function playerDataCheck() {
    const playerData = await playerModel.findOne({ userID: `${request.params.id}` })
    // We use the mongoose findOne method to check if a record exists
   // with the given ID
    if (playerData) {
     // If exists return the data
      return playerData
    } else {
      const newPlayerDataInstance = new playerModel({
        userID: `${request.params.id}`,
        Whitelisted: false,
        Banned: false,
        WhitelistedPlaces: ["0"]
      })
      const newPlayerData = await newPlayerDataInstance.save()
      // If not exists, we save a new record and return that
      return newPlayerData
    }
  }

  response.json(await playerDataCheck());
// Finally we return the response from the async function!
});

app.post("/player-data/update-info/:id", async (request, response) => {
  var Places = [];
  console.log(request.body.WhitelistedPlaces)
  for(var i=1;request.body.WhitelistedPlaces.length;i++){Places.push(request.body.WhitelistedPlaces[i])}
  // We use a mongoose method to find A record and update!
  await playerModel.findOneAndUpdate(
    { userID: `${request.params.id}` },
    { $set: { Whitelisted: request.body.Whitelisted,Baned: request.body.Banned,WhitelistedPlaces:Places} }
  );
  response.send("Updated Database.");
  // Just a response.
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});