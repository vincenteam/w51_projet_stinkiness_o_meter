import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

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

import Root from "@/routes/root";
import { SearchAni } from "@/routes/search";
import Error from "@/error";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "search",
          loader: searchAnimesLoader,
          element: <Animes />,
          errorElement: <Error />,
          children: [
            {
              index: true,
              element: <span>No animes to show</span>,
            },
            {
              path: ":animeId",
              loader: searchAniLoader,
              element: <SearchAni />,
            },
          ],
        },
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
