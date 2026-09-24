import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.js";
import Admin from "./pages/Admin.js";
import Bar from "./portals/bar/Bar.js";
import Floor from "./portals/floor/Floor.js";
import Home from "./pages/Home.js";
import Kitchen from "./portals/kitchen/Kitchen.js";
import TableMenu from "./pages/TableMenu.js";
import "./index.css";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "t/:token", element: <TableMenu /> },
      { path: "kitchen", element: <Kitchen /> },
      { path: "bar", element: <Bar /> },
      { path: "floor", element: <Floor /> },
      { path: "admin", element: <Admin /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
