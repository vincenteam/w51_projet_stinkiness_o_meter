import { useNavigate } from "react-router";

import "./error404.css"
import "./general.css"

export function Error404() {
    const navigate = useNavigate()
  return (
    <>
      <div className="container">
        <div className="error-code">404</div>
        <div className="message">
          No stinkiness here
        </div>
        <div className="image-container">
          <img src="/src/assets/404.jpg" alt="Anime Character" />
        </div>
        <br></br>
        <button className="button-49" onClick={()=> {navigate("/")}}>back to main page</button>
      </div>
    </>
  );
}
