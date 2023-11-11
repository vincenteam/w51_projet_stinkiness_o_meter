"use strict";
const xml2js = require("xml2js");
const fs = require("fs");
const { writeFileSync } = require("fs");

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
const max_ban_words = 10; // limit of custom banwords for purgo malum
const language_code = "en"; // code used by anidb for english

while (ban_words_file.words.length > 0)
  // cut our list of banwords in sublists of len 10
  ban_words.push(ban_words_file.words.splice(0, max_ban_words).join(","));

let anim_list = null;

fs.readFile("anime-titles.xml", "utf8", function (err, f) {
  // read anims titles list local xml file
  xml2js.parseString(f, function (err, json) {
    anim_list = json.animetitles.anime;
    console.log("file loaded");
  });
});

const anime_info_cache_path = "./anime_info_cache.json";
let anime_info_cache = require(anime_info_cache_path);

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
        ban_word_count += censored.result.split(replacement_char).length - 1;
      }
      res.json({ count: ban_word_count });
    });
  });
});

app.get("/searchAniIds", (req, res, next) => {
  const s = req.query.search;
  console.log(s);
  const ids = [];
  for (const anim of anim_list) {
    for (const title of anim.title) {
      if (title.$["xml:lang"] === language_code) {
        if (title._.toLowerCase().includes(s)) {
          console.log(anim);
          console.log(title);
          ids.push(anim.$.aid);
          break;
        }
        break;
      }
    }
  }

  res.json({ ids: ids });
});

app.get("/animeInfo", (req, res, next) => {
  const id = req.query.id;

  if (id in anime_info_cache) {
    res.json(anime_info_cache[id]);
    console.log("using cache");
  } else {
    fetch(
      "http://api.anidb.net:9001/httpapi?client=stinkinessclienn&clientver=1&protover=1&request=anime&aid=" +
        id
    )
      .then((data) => {
        return data.text();
      })
      .then((anime_desc) => {
        xml2js.parseString(anime_desc, (err, jsonAnime) => {
          if (err) {
            res.json({ error: "an error ocurred" });
          } else {
            const info = jsonAnime.anime;

            res.json(info);

            const info_formatted = {};

            info_formatted.id = info.$.id;
            info_formatted.episode_count = info.episode_count;
            /*for(title of ){

            }*/

            anime_info_cache[id] = info_formatted;
            console.log("formatted", info_formatted);

            console.log("using anidb");
          }
        });
      });
  }
});

// launch server
const server = app.listen(4200, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log("App listening at http://%s:%s", host, port);
});

process.on("SIGINT", function () {
  console.log("Caught interrupt signal");

  try {
    writeFileSync(
      anime_info_cache_path,
      JSON.stringify(anime_info_cache),
      "utf8"
    );
    console.log("anime cache saved");
  } catch (error) {
    console.log("could not save anime cache", error);
  }

  process.exit();
});
