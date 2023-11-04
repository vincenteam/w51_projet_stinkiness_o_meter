"use strict";

const express = require("express"),
  cors = require("cors");

const app = express();

// app.use(express.static('../build'));
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  setTimeout(next, Math.random() * 2000);
});

// register error handling middleware
app.use(function (err, req, res, next) {
  if (err.status === undefined) {
    return res.status(500).send(err.message);
  } else {
    return res.status(err.status).send(err.message);
  }
});

const ban_words_file = require("./ban_anime_words.json");
const ban_words = [];
const max_ban_words = 10; // limit given by purgo malum

while (ban_words_file.words.length > 0)
  ban_words.push(ban_words_file.words.splice(0, max_ban_words).join(","));

// declare routes
app.get("/testBackend", (req, res, next) => {
  res.json("bakend stinks");
});

app.post("/purgoAnimeum", (req, res, next) => {
  const replacement_char = "*";

  const full_text = req.body.text.replaceAll(replacement_char, "_"); // to  avoid counting a star as a banword
  let texts = full_text.match(/.{1,1500}/g); // to stay under 2048 char url

  console.log(texts);

  const fetches = [];

  for (const text of texts) {
    for (let words of ban_words) {
      const url = `https://www.purgomalum.com/service/json?text=${text}&add=${words}&fill_text=*`;
      console.log(url);
      fetches.push(fetch(url));
    }
  }

  let ban_word_count = 0;

  Promise.all(fetches).then((responses) => {
    Promise.all(responses.map((response) => response.json())).then((data) => {
      for (const censored of data) {
        ban_word_count += censored.result.split(replacement_char).length -1
      }
      res.json({count: ban_word_count})
    });
  });
});



// launch server
const server = app.listen(4200, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log("App listening at http://%s:%s", host, port);
});
