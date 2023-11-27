import { useState } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Anime } from "./anime";
import { Animes } from "./search";
import { LoadingSign } from "./search";
import { Link } from "react-router-dom";
import "./doughnut.css";
import "./dashboard.css";
Chart.register(ArcElement, Tooltip, Legend);

export function dashboardLoader({ request }) {}

//returns a list of { id, points }, with the id 0 being the total score and the ids 1 to 7 the different parts of the score
async function computeStinkiness(anime) {
  let promiseList = [];
  //BanWords points
  promiseList.push(
    fetch("http://localhost:4200/purgoAnimeum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // You can add other headers as needed
      },
      body: JSON.stringify({ text: anime.title }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        let nameBans = response.count * 15;
        return { id: "1", points: nameBans };
      })
  );

  //Concatener toutes les valeurs en une string pour ne pas avoir de problèmes d'objets
  let concatenatedRecommendations = "";

  if (anime.recommendations.length !== 0) {
    for (const rec of anime.recommendations) {
      concatenatedRecommendations += rec.text;
    }

    for (const rec of anime.recommendations) {
      concatenatedRecommendations += rec.text;
    }

    /*console.log(
    "rec text",
    JSON.stringify({ text: concatenatedRecommendations })
  );*/

    let recommendationsTexts = concatenatedRecommendations.match(/.{1,1500}/g);

    for (const element of recommendationsTexts) {
      promiseList.push(
        fetch("http://localhost:4200/purgoAnimeum", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // You can add other headers as needed
          },
          body: JSON.stringify({ text: element }),
        })
          .then((res) => {
            return res.json();
          })
          .then((response) => {
            let recommendationsBans = response.count * 2;
            return { id: "2", points: recommendationsBans };
          })
      );
    }
  }

  promiseList.push(
    fetch("http://localhost:4200/purgoAnimeum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // You can add other headers as needed
      },
      body: JSON.stringify({ text: anime.desc }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        const descBans = response.count * 2;
        return { id: "3", points: descBans };
      })
  );

  let tagsNDesc = "";

  for (const tag of anime.tags) {
    tagsNDesc += tag.name + " " + tag.desc;
  }

  promiseList.push(
    //Ne va peut-être pas marcher (liste d'objets js)
    fetch("http://localhost:4200/purgoAnimeum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // You can add other headers as needed
      },
      body: JSON.stringify({ text: tagsNDesc }),
    })
      .then((res) => {
        return res.json();
      })
      .then((response) => {
        let tagsBans = response.count * 0.7;
        return { id: "4", points: tagsBans };
      })
  );

  if (anime.characters.length !== 0) {
    let characterTexts = anime.characters.join().match(/.{1,1500}/g);
    characterTexts = characterTexts ? characterTexts : ""
    console.log("char tet", characterTexts)

    for (const element of characterTexts) {
      promiseList.push(
        fetch("http://localhost:4200/purgoAnimeum", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // You can add other headers as needed
          },
          body: JSON.stringify({ text: element }),
        })
          .then((res) => {
            return res.json();
          })
          .then((response) => {
            let charactersBans = response.count * 3;
            return { id: "5", points: charactersBans };
          })
      );
    }
  }

  //Recommendations points
  //Points on number of recommendations
  let recommendationsPoints = 0;
  if (anime.recommendations.length < 6) {
    recommendationsPoints += 10;
  } else if (anime.recommendations.length < 16) {
    recommendationsPoints += 5;
  }

  //Points on recommendations ranking
  let forFansCount = 0;
  let recommendedCount = 0;
  let mustWatchCount = 0;
  for (const opinion of anime.recommendations) {
    if (opinion.rank.toLowerCase() === "recommended") {
      recommendedCount++;
    } else if (opinion.rank.toLowerCase() === "for fans") {
      forFansCount++;
    } else if (opinion.rank.toLowerCase() === "must watch") {
      mustWatchCount++;
    }
  }
  /*console.log(
    "Number of for fans : " +
      forFansCount +
      "\nNumber of recommended : " +
      recommendedCount +
      "\nNumber of must watch : " +
      mustWatchCount
  );*/

  if (forFansCount > recommendedCount) {
    recommendationsPoints += 5;
  } else if (forFansCount > mustWatchCount) {
    recommendationsPoints += 10;
  }
  if (forFansCount > recommendedCount + mustWatchCount) {
    recommendationsPoints += 15;
  }
  if (recommendedCount > mustWatchCount) {
    recommendationsPoints += 5;
  }

  //Points on number of episodes
  let episodeCountPoints = 0;
  if (anime.episode_count > 20) {
    episodeCountPoints += 0.5 * (anime.episode_count - 20);
  }

  let stinkList = [];
  await Promise.all(promiseList).then((stinkLst) => {
    for (const elem of stinkLst) {
      stinkList.push(elem);
    }
  });
  stinkList.push({ id: "6", points: episodeCountPoints });
  stinkList.push({ id: "7", points: recommendationsPoints });

  let stinkiness = 0;
  for (const element of stinkList) {
    stinkiness += element.points;
  }
  stinkList.push({ id: "0", points: stinkiness });

  let returnLst = [{ id: "0", points: stinkiness }];
  for (const element of stinkList) {
    returnLst.push(element);
  }
  //console.log(returnLst);

  return returnLst;
}

export function Dashboard() {
  const [anime_list, setAnime_list] = useState([]);
  const [data, updateDoughnutData] = useState({
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        backgroundColor: [],
        borderColor: [],
      },
    ],
  });

  const [loadingCount, setLoadingCount] = useState(0);

  function dynamicColors() {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  //console.log(computeStinkiness(testAnime));

  function onAddAnime(anime) {
    const ids = anime_list.map((a) => a.id);
    if (!ids.includes(anime.id)) {
      // check if anime is already selected to avoid duplicates
      setLoadingCount((previous) => {
        return previous + 1;
      });
      setAnime_list((prevArray) => [...prevArray, anime]);

      //Updating Doughnut
      computeStinkiness(anime).then((stinkLst) => {
        /*
      Idées d'implémentations :
      - Classement de points par anime, on voit les détails de provenance des points quand on hover
      - Classement de points par origine (genre tags ou desc) et on voit quels animes donnent tant de points quand on hover
      - Classement de quels animes donnent combien de points, et aucune info quand on hover

      Idée qui semble la plus pertinente : la troisième, parce que dans le premier cas l'utilisateur peut rentrer trop d'animes (même si dans le 3 aussi),
      et dans le deuxième ça va faire trop surnaturel de voir écrit genre "points de la description" ou "points des tags"

      StinkLst contains 8 elements :
      0:stinkiness 1:name 2:recommendations(text) 3:desc 4:tags 5:characters 6:recommendations(ranks) 7:nbEpisodes
      */

        const dynamiColor = dynamicColors();
        let labelsAnimes = [anime.title];
        let datasetAnimes = {
          label: "Animes",
          data: [stinkLst[0].points],
          backgroundColor: [dynamiColor],
          borderColor: [dynamiColor],
        };

        //{...exampleState,  masterField:{new value}
        updateDoughnutData((previous) => {
          return {
            labels: [...previous.labels, ...labelsAnimes],
            datasets: [
              {
                label: previous.datasets[0].label,
                data: [...previous.datasets[0].data, datasetAnimes.data[0]],
                backgroundColor: [
                  ...previous.datasets[0].backgroundColor,
                  ...datasetAnimes.backgroundColor,
                ],
                borderColor: [
                  ...previous.datasets[0].borderColor,
                  ...datasetAnimes.borderColor,
                ],
              },
            ],
          };
        });
        setLoadingCount((previous) => {
          return previous - 1;
        });
      });
    }
  }

  function handleDelete(id, titleToRemove) {
    //Update Doughnut data -> 
    updateDoughnutData((previous) => {
      let indexToDelete;
      for (const index in previous.labels){
        if (previous.labels[index] === titleToRemove){
          indexToDelete = index;
        }
      }

      const labelToRemove = previous.labels[indexToDelete];
      const newBackgroundColor = [];
      const newBorderColor = [];
      for (const index in previous.datasets[0].backgroundColor){
        if (index !== indexToDelete){
          newBackgroundColor.push(previous.datasets[0].backgroundColor[index])
          newBorderColor.push(previous.datasets[0].borderColor[index])
        }
      }

      for (const element of previous.labels){
        console.log(element);
      }

      return {
        labels: previous.labels.filter(label => label !== labelToRemove),
        datasets: [
          {
            label: previous.datasets[0].label,
            data: previous.datasets[0].data.splice(indexToDelete, 1),
            backgroundColor: newBackgroundColor,
            borderColor: newBorderColor,
          },
        ],
      };
    });

    console.log("updated doughnut data = " + data.datasets + " labels = " + data.labels);
    
    // Update userList data
    setAnime_list(() => {
      let newList = [];
      for (const element of anime_list) {
        if (element.id !== id) {
          newList.push(element);
        }
      }
      return newList;
    })
  }

  /*if (anime_list.length === 0) {
    return (
      <>
        <Animes addAnime={onAddAnime} />
        <UserAnimes anime_list={anime_list}></UserAnimes>
      </>
    );
  } else {*/
  console.log("loading ?", loadingCount);
  return (
    <div className="dashboard">
      <Doughnutchart data={data} loading={loadingCount !== 0}></Doughnutchart>
      <div className="user_data">
        <Animes addAnime={onAddAnime} />
        <UserAnimes anime_list={anime_list} handleDelete={handleDelete}></UserAnimes>
      </div>
    </div>
  );
  //}
}

function UserAnimes({ anime_list, handleDelete }) {
  return (
    <div className="anime_search">
      <h3>Selected animes</h3>
      <nav>
        <ul>
          {anime_list.map((anime) => {
            return (
              <li key={anime.id}>
                <Link to={"/animeDetails?id=" + anime.id}>
                  <Anime anime={anime}></Anime>
                </Link>{" "}
                <button className="button-50"
                  onClick={ () => handleDelete(anime.id, anime.title) }
                >
                  X
                </button>
                <br />
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function Doughnutchart({ data, loading }) {
  //Data that will be used in the doughnutChart
  //Will need to be changed based on UserAnimes list

  const options = {};
  return (
    <div className="doughnut_chart">
      {loading ? (
        <div>
          <LoadingSign></LoadingSign> computing stinkiness ...
        </div>
      ) : (
        <>
          <Doughnut data={data} options={options}></Doughnut>
          <StinkinessScore
            score={data.datasets[0].data.reduce((acc, current) => {
              return acc + current;
            }, 0)}
          />
        </>
      )}
    </div>
  );
}

function StinkinessScore({ score }) {
  const elements = [
    [0, 40, <>You Smell Good</>],
    [40, 75, <>Neither smart fella nor fart smella</>],
    [75, 150, <>A little bit smelly</>],
    [150, 200, <>You are more of a fart smella than a smart fella</>],
    [200, -1, <>(つ✧ω✧)つ YOU SHOULD TAKE A BATH NOW (*≧ω≦)</>],
  ];

  return (
    <div className="score_container">
      <div key="score" className="score">
        {score}
      </div>
      <div key="message">
        {elements.map((elem, ind) => {
          if (score >= elem[0] && (score < elem[1] || elem[1] == -1)) {
            return <div key={ind}>{elem[2]}</div>;
          }
        })}
      </div>
    </div>
  );
}
