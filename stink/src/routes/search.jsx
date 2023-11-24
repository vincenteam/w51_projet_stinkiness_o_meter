import {
  Form,
  Outlet,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { parseString } from "xml2js";
import { Anime } from "./anime.jsx";
import { LinkWithQuery } from "../linkWithQuery";

import "./search.css";

export function searchAnimesLoader({ request }) {
  let url = new URL(request.url);
  let searchTerm = url.searchParams.get("search");
  if (!searchTerm) {
    console.log("no term");
    // If the searchTerm is empty, return an empty list
    return { animes: [], search: null };
  }

  //Request to our backend to get the ids corresponding to the searchTerm
  return fetch("http://localhost:4200/searchAniIds?search=" + searchTerm)
    .then((response) => {
      // Convert text data into json -> data is the ids of ids corresponding
      return response.json();
    })
    .then((animeIds) => {
      return { ids: animeIds.ids, search: searchTerm };
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
            fetch("http://localhost:4200/animeInfo?id=" + id)
              .then((data) => {
                return data.json();
              })
              .catch(function (err) {
                return null;
              })
          );
        }
        return Promise.all(promiseList).then((aniData) => {
          console.log(aniData);
          console.log("recommandations : ");
          console.log(aniData[0].recommendations);
          for (let anime of aniData) {
            if (anime) {
              animeList.push(anime);
            }
          }
          return { animes: animeList, search: searchTerm };
        });
      }
    });
}

function LoadingSign() {
  return <div className="loading"></div>;
}

export function Animes({ addAnime }) {
  let loaded = useLoaderData();
  const [idsToLoad, setIdsToLoad] = useState([]);
  const [animes, setAnimes] = useState([]);
  const [canRequest, setCanRequest] = useState(true);
  const { state } = useNavigation();

  let requestTimeOut = 10; // timeout of requests to backend
  const loadGroupSize = 10;

  function checkScroll(event) {
    const elem = event.target;
    if (elem.scrollTop + elem.clientHeight >= elem.scrollHeight) {
      setIdsToLoad(idsToLoad.slice(loadGroupSize));
      loadAnimeInfo(animes, idsToLoad.slice(0, loadGroupSize));
    }
  }

  function loadAnimeInfo(baseAnime, idsList) {
    // create promises to get info on the animes based on ids on the state

    if (!canRequest) {
      console.log("in timeout");
      return null;
    }
    setCanRequest(false);
    const promiseList = [];
    for (let id of idsList) {
      promiseList.push(
        fetch("http://localhost:4200/animeInfo?id=" + id)
          .then((data) => {
            return data.json();
          })
          .catch(function (err) {
            return null;
          })
      );
    }

    if (promiseList.length !== 0) {
      Promise.all(promiseList).then((aniData) => {
        // get all the results, filter nulls
        const animeList = [];
        for (let anime of aniData) {
          if (anime) {
            animeList.push(anime);
          }
        }
        // add new results to state, avoid duplicates
        setAnimes((_) => {
          const ids = baseAnime.map((a) => a.id);

          const tmp = [...baseAnime];
          for (const a of animeList) {
            if (!ids.includes(a.id)) {
              tmp.push(a);
            }
          }
          console.log("set with", tmp);
          return tmp;
        });
      });
    }
  }

  useEffect(() => {
    if (loaded.ids) {
      console.log("ids change", loaded.ids);
      // remove ids that will be loaded from the state
      setAnimes([])
      setIdsToLoad(loaded.ids.slice(loadGroupSize));
      loadAnimeInfo([], loaded.ids.slice(0, loadGroupSize));
    }
  }, [loaded.ids]);

  useEffect(() => {
    setInterval(() => {
      setCanRequest(true);
    }, 1000 * requestTimeOut);
  }, []);
  
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
          <button type="submit" disabled={state === "loading" ? true : false}>
            Search
          </button>
        </Form>
        {loaded.search !== null ? (
          loaded.ids.length !== 0 || animes.length !== 0 ? (
            <nav>
              <ul className="search_results" onScroll={checkScroll}>
                {animes.map((anime) => {
                  return (
                    <li key={anime.id}>
                      <Anime anime={anime}></Anime> {" "}
                      <button onClick={() => addAnime(anime)}>
                        add to list
                      </button>
                    </li>
                  );
                })}
                {animes.length === 0 || idsToLoad.length !== 0 ? (
                  <li>
                    <LoadingSign></LoadingSign> loading ...
                  </li>
                ) : (
                  <></>
                )}
              </ul>
            </nav>
          ) : (
            <div>no results</div>
          )
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default Animes;
