import { useState } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useParams,
} from "react-router-dom";
import { Anime } from "./anime";
import { useEffect } from "react";
import { Animes } from "./search";

Chart.register(ArcElement, Tooltip, Legend);

export function dashboardLoader({ request }) {
  console.log("dashboard loader", request);

  return { title: "haaaaaaaaaaaa" };
}

export function Dashboard() {
  const [anime_list, setAnime_list] = useState([]);

  function onAddAnime(anime) {
    const ids = anime_list.map(a => a.id)
    if (! ids.includes(anime.id)){ // check if anime is already selected to avoid duplicates
      setAnime_list((prevArray) => [...prevArray, anime]);
    }
  }

  return (
    <>
      <Animes addAnime={onAddAnime} />
      <Doughnutchart></Doughnutchart>
      <br />
      <UserAnimes anime_list={anime_list}></UserAnimes>
    </>
  );
}

export function Doughnutchart() {
  //Data that will be used in the doughnutChart
  //Will need to be changed based on UserAnimes list

  const data = {
    labels: ["Yes", "No"],
    datasets: [
      {
        label: "Poll",
        data: [3, 6],
        backgroundColor: ["black", "red"],
        borderColor: ["black", "red"],
      },
    ],
  };

  const options = {};
  return (
    <div style={{ width: "50%", height: "50%" }}>
      <Doughnut data={data} options={options}></Doughnut>
    </div>
  );
}

export function UserAnimes({ anime_list }) {
  console.log("anime_list in user", anime_list)
  return (
    <>
      <h3>Selected animes</h3>
      <ul>
        {anime_list.map((anime) => {
          return <Anime key={anime.id} anime={anime}></Anime>;
        })}
      </ul>
    </>
  );
}
