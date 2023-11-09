import { Link, Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div>
      <header>
        <h2>
          Welcome to the amazing stinkiness measurer based on your anime taste, the stink'o'meter !!! - <Link to="/search">Search for your animes</Link>
        </h2>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <em>Made with React & react-router</em>
      </footer>
    </div>
  );
}
