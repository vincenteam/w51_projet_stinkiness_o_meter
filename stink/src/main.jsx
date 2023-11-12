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
//import { Dashboard, dashboardLoader } from "./routes/dashboard";
import { Dashboard, dashboardLoader } from "./routes/dashboard";

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
              path : "dashboard",
              loader: dashboardLoader,
              element : <Dashboard/>
            }
          ]
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
