require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

//require all needed and connecting to mongoose

const mongoose = require('mongoose');
mongoose .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }) .then(() => console.log("MongoDB connected")) .catch((err) => console.log(err));

app.use(bodyParser.urlencoded({extended: false}))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});




// ******************
//URL Shortener Project Starts

//creating schema and model

let urlSchema = new mongoose.Schema({
  "original_url": {
    "type": String,
    "required": true
  },
  "short_url": {
    "type": Number
  }
})

let Url = new mongoose.model("Url", urlSchema);

//POST

app.post("/api/shorturl", (req, res) => {

  let originalUrl = req.body.url
  let shortUrl = 1

  //check if url is valid
  let validUrl = originalUrl.slice(0, 4)

  if (validUrl !== "http") {
    return res.json({
      "error": "invalid url"
    })
  }

  //find if url already exist in the database
  Url.findOne({"original_url": req.body.url}).sort({"short_url": -1}).exec((err, found) => {
    if (err) {
      return console.log(err)
    }
    //if dont exist yet
    if (found === null) {

      Url.findOne().sort({"short_url": -1}).exec((err, foundAgain) => {
        if (err) {
          return console.log(err)
        }
        
        //if its the first data send to the database
        if (foundAgain === null) {
          let create = new Url({
            "original_url": originalUrl, 
            "short_url": shortUrl
          })
    
          create.save()
    
          res.json({
            "original_url": create.original_url, 
            "short_url": create.short_url
          })
        } 
        //url doesnt exist, find the latest url added and get its short_url and add 1
        else {
          let create = new Url({
            "original_url": originalUrl, 
            "short_url": foundAgain.short_url + 1
          })
    
          create.save()
    
          res.json({
            "original_url": create.original_url, 
            "short_url": create.short_url
          })
        }

      })

    } 
    //if url already exist
    else {
      res.json({
        "original_url": found.original_url, 
        "short_url": found.short_url
      })
    }
  })
  
})


//GET
app.get("/api/shorturl/:short", (req, res) => {
  Url.findOne({"short_url": req.params.short}, (err, bingo) => {
    if (err) {
      return console.log(err)
    }
    res.redirect(bingo.original_url)
  })
})



//URL Shortener Project End
// *****************


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
