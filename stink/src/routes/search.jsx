import { Form, Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { parseString } from "xml2js";
import { Anime } from "./anime.jsx";
import { LinkWithQuery } from "../linkWithQuery";

export function searchAnimesLoader({ request }) {
  let url = new URL(request.url);
  let searchTerm = url.searchParams.get("search");
  if (!searchTerm) {
    console.log("no term");
    // If the searchTerm is empty, return an empty list
    return { animes: [], search: "" };
  }

  //Request to our backend to get the ids corresponding to the searchTerm
  return fetch("http://localhost:4200/searchAniIds?search=" + searchTerm)
    .then((response) => {
      // Convert text data into json -> data is the ids of ids corresponding
      return response.json();
    })
    .then((animeIds) => {
      // Fetch-ception to get the other infos on the animes that match the searchTerm
      if (animeIds.length === 0) {
        // If the list of ids is empty, return an empty list
        return { animes: [], search: searchTerm };
      } else {
        // If not, then ask the backend for the full anime data
        let animeList = [];
        let promiseList = [];
        for (let id of animeIds.ids) {
          promiseList.push(
            fetch("http://localhost:4200/animeInfo?id=" + id).then((data) => {
              return data.json();
            }).catch(function(err)
            {
               return null
            })
          );
        }
        return Promise.all(promiseList).then((aniData) => {
          for (let anime of aniData) {
            if (anime){
              animeList.push(anime);
            }
          }
          return { animes: animeList, search: searchTerm };
        });
      }
    });
}

export function Animes({addAnime}) {
  let loaded = useLoaderData();
  const navigate = useNavigate();

  function onSelectAnime(){

  }

  return (
    <>
      <div id="sidebar">
        <Form>
          {" "}
          <input
            id="search"
            type="text"
            name="search"
            placeholder="Search for animes"
            value={useEffect(() => {
              document.getElementById("search").value = loaded.search;
            }, [loaded.search])}
          />{" "}
          <button type="submit">Search</button>
        </Form>
        {loaded.animes.length > 0 ? (
          <nav>
            <ul>
              {
              loaded.animes.map((anime) => {
                return (
                  <li
                    key={anime.id}
                    onClick={()=>addAnime(anime)}
                  >
                    <Anime anime={anime}></Anime>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : (
          <nav>
            <br />
            Search for animes
          </nav>
        )}
      </div>
    </>
  );
}

export default Animes;
