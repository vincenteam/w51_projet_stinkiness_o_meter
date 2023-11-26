import { Link, Outlet, useNavigate, useOutlet } from "react-router-dom";

import "./root.css"

export default function Root() {
  const outlet = useOutlet();
  const navigate = useNavigate()

  return (
    <div>
      <header>
        <div>
          <img className="logo" src="/src/assets/logo.png" alt="logo" />
          <h1 onClick={() => navigate("/")}>
            stink'o'meter
          </h1>
        </div>

      </header>
      <main>
        <div>
          { outlet || (
            <p className="presentation">
              Welcome to the amazing stinkiness measurer based on your anime
              taste, the stink'o'meter !!! -{" "}
              <Link to="/dashboard">Search for your animes</Link>
            </p>
          )}
        </div>
      </main>
      <footer>
        <em>Made with React & react-router</em>
      </footer>
    </div>
  );
}
