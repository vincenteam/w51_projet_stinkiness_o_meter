import { Form, Link, Outlet, useLoaderData } from "react-router-dom";
import { useEffect } from "react";
import { parseStringPromise } from 'xml2js';

export function searchAnimesLoader({ request }) {
  let url = new URL(request.url);
  let searchTerm = url.searchParams.get("animes");
  if (!searchTerm) {
    // If the searchTerm is empty, return an empty list
    return { animes: [], search: "" };
  }

  //Request to our backend to get the ids corresponding to the searchTerm
  return fetch("http://localhost:4200/searchAniIds?s=" + searchTerm)
    .then((response) => {
      // Convert text data into json -> data is the ids of ids corresponding
      return response.json();
    })
    .then((data) => {
      // Fetch-ception to get the other infos on the animes that match the searchTerm
      if (data.ids.length === 0) {
        // If the list of ids is empty, return an empty list
        return { animes: [], search: searchTerm };
      } else {
        let animeList = [];
        for (let id in data.ids) {
          animeList.push((id) => {
            return fetch(
              "http://api.anidb.net:9001/httpapi?client=stinkinessclient&clientver=1&protover=1&request=anime&aid=" + id
            ).then({
                
            });
          });
        }

        // list of ids
        // search infos from this list of ids

        return { animes: data.drinks, search: searchTerm };
      }
    });
}

function Animes() {
  let loaded = useLoaderData();
  return (
    <>
      <div id="sidebar">
        <Form>
          {" "}
          <input
            id="search"
            type="text"
            name="animes"
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