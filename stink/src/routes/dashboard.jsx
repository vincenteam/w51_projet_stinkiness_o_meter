import { useState } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import {Doughnut} from 'react-chartjs-2';
import { Form, Link, Outlet, useLoaderData } from "react-router-dom";

Chart.register(
  ArcElement,
  Tooltip,
  Legend
);

export function dashboardLoader({ request }) {
  console.log("dashboard loader", request);
}

export function Dashboard() {
  let loaded = useLoaderData();

  return (
    <>
      <Doughnutchart></Doughnutchart>
      <br />
      <UserAnimes></UserAnimes>
    </>
  );
}

export function Doughnutchart() {
  //Data that will be used in the doughnutChart
  //Will need to be changed based on UserAnimes list
  const data = {
    labels: ['Yes', 'No'],
    datasets:[{
      label: 'Poll',
      data: [3,6],
      backgroundColor: ['black', 'red'],
      borderColor: ['black', 'red']
    }]
  }

  const options = {

  }
  return (
    <div style={ { width: '50%', height: '50%' } }>
      <Doughnut data= {data} options= {options}></Doughnut>
    </div>
  );
}

export function UserAnimes() {
  const anime_list = useState([]);

  return (
    <>
      <p>UserAnime will be here in the future</p>
    </>
  );
}
