import React from "react";
import ReactDOM from "react-dom/client";

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useParams,
  Link,
  Navigate,
} from "react-router-dom";

//import '@/index.css';

import Root from "./routes/root";
import { Animes, searchAnimesLoader } from "./routes/search";
import Error from "./error";
import { Dashboard, dashboardLoader } from "./routes/dashboard";
import { AnimeDetails, AnimeDetailsLoader} from "./routes/animeDetails"

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "dashboard",
          loader: searchAnimesLoader,
          element : <Dashboard/>,
          errorElement: <Error />,
        },
        {
          path: "animeDetails",
          loader: AnimeDetailsLoader,
          element: <AnimeDetails/>,
          errorElement: <Error />,
        }
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ],
  {
    future: {
      v7_normalizeFormMethod: true,
    },
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
