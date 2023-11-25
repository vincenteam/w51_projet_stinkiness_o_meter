import { useNavigate, redirect, useLoaderData, Link } from "react-router-dom";
import "./anime_details.css";

const tags_color = {};

export function AnimeDetailsLoader({ request }) {
  const url = new URL(request.url);
  if (url.searchParams.get("id") === null) {
    console.log("redirect");
    return redirect("/");
  }

  const id = url.searchParams.get("id");

  return fetch("http://localhost:4200/animeInfo?id=" + id)
    .then((data) => {
      return data.json();
    })
    .then((json) => {
      const promises = json.related.map((id) => {
        return fetch("http://localhost:4200/animeInfo?id=" + id).then(
          (data) => {
            return data.json();
          }
        );
      });

      return Promise.all(promises).then((jsons_related) => {
        const anime_data = json;
        anime_data.related = jsons_related;
        return anime_data;
      });
    });
}

function randomColor() {
  let r = Math.floor(Math.random() * 255);
  let g = Math.floor(Math.random() * 255);
  let b = Math.floor(Math.random() * 255);
  return "rgb(" + r + "," + g + "," + b + ")";
}

export function AnimeDetails() {
  const loaded = useLoaderData();
  console.log("loaded", loaded);

  return (
    <div className="details_container">
      <div key="main" className="details">
        <div key="title" className="title">
          {loaded.title}
        </div>
        <div key="date" className="publication-date">
          <span className="publication-date">{loaded.startdate}</span>
        </div>
        <div key="desc" className="description">
          {loaded.desc}
        </div>
      </div>
      <div key="side" className="details_side">
        <div className="tag_container" key="tags">
          {loaded.tags.map((tag, ind) => {
            let color = null;
            console.log("colors", tags_color, tag);
            if (tag.name in tags_color) {
              color = tags_color[tag.name];
              console.log("in");
            } else {
              color = randomColor();
              tags_color[tag.name] = color;
            }
            const componentStyle = {
              backgroundColor: color,
            };
            return (
              <span key={ind} className="tag" style={componentStyle}>
                {tag.name}
              </span>
            );
          })}
        </div>
        <div className="related-anime" key="related">
          <h3>Related animes</h3>
          {loaded.related.map((related, ind) => {
            return (
              <Link to={"?id=" + related.id} key={ind}>
                <div key="title" className="title">
                  {related.title}
                </div>
                <div key="pub" className="publication-date">
                  {related.startdate}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
