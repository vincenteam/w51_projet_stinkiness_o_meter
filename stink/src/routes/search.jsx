import { Form, Link, Outlet, useLoaderData } from "react-router-dom";
import { useEffect } from "react";
import { parseString } from "xml2js";

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
    .then((animeData) => {
      // Fetch-ception to get the other infos on the animes that match the searchTerm
      if (animeData.ids.length === 0) {
        // If the list of ids is empty, return an empty list
        return { animes: [], search: searchTerm };
      } else {
        // Else, for each id in the returned list, fetch the corresponding data from the anidb api
        let animeList = [];
        let promiseList = [];
        for (let id of animeData.ids) {
          promiseList.push(
            fetch(
              "http://api.anidb.net:9001/httpapi?client=stinkinessclienn&clientver=1&protover=1&request=anime&aid=" +
                id
            ).then((data) => {
              return data.text();
            })
          );
        }
        return Promise.all(promiseList).then((aniData) => {
          for (let anime of aniData) {
            console.log(anime);
            parseString(anime, ({err, jsonAnime}) => {
              animeList.push(jsonAnime);
              console.log(err);
            });
          }
          console.log(animeList);
          return { animes: animeList, search: searchTerm };
        });
      }
    });
}

export function Animes() {
  let loaded = useLoaderData();
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
        {loaded.cocktails.length > 0 ? (
          <nav>
            <ul>
              {loaded.cocktails.map((drink) => {
                return (
                  <li key={drink.idDrink}>
                    <Link to={drink.idDrink}>{drink.strDrink}</Link>
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
      <div id="detail">
        <Outlet />{" "}
        {/* la sous-route (détail du cocktail courant) sera rendue ici */}
      </div>
    </>
  );
}

export default Animes;
