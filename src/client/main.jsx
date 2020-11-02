import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.tsx";
import "./styles.css";

// eslint-disable-next-line no-undef
console.log("Running version (client):", ADDON_VERSION);

ReactDOM.render(<App />, document.getElementById("index"));
