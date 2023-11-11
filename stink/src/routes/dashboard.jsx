import { useState } from "react";

export function dashboardLoader({ request }) {
  console.log("dashboard loader", request);
}

export function Dashboard() {
  let loaded = useLoaderData();

  return <></>;
}

export function Piechart(){
    return <></>
}

export function UserAnimes(){
    const anime_list = useState([])

    return ;
}