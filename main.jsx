import React from "react";
import ReactDOM from "react-dom/client";

// Style stack (see styles/site.css for why custom.css isn't imported whole):
import "./styles/reference/normalize.css";
import "./styles/reference/skeleton.css";
import "./styles/site.css";

import QuaternionExplorer from "./quaternion-explorer.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QuaternionExplorer />
  </React.StrictMode>
);
