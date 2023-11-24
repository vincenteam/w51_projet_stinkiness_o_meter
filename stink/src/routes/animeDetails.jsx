import { useNavigate, redirect, useLoaderData } from "react-router-dom";

export function AnimeDetailsLoader({ request }) {
  const url = new URL(request.url);
  console.log("req", request);
  if (url.searchParams.get("id") === null) {
    console.log("redirect");
    return redirect("/");
  }

  const id = url.searchParams.get("id");

  return fetch("http://localhost:4200/animeInfo?id=" + id).then((data) => {
    return data.json();
  });
}

export function AnimeDetails() {
    const loaded = useLoaderData()

    return <>
    <div>
      <div class="title">
        Anime Title
        <span class="tag tag-action">Action</span>
        <span class="tag tag-comedy">Comedy</span>
        <span class="tag tag-fantasy">Fantasy</span>
      </div>
      <div class="publication-date">Published on: <span class="publication-date">January 1, 2023</span></div>
      <div class="description">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed aliquam justo ut turpis ultrices, vel scelerisque velit fermentum.
        Nullam ut libero vitae arcu ultricies ultrices eu at ligula. Nullam a urna sed turpis aliquam volutpat.
      </div>
    </div>
    </>
}
