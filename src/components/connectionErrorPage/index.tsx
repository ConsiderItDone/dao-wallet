import React from "react";
import Header from "../header";
import "./index.css";

const ConnectionErrorPage = () => {
  return (
    <div className="connectionErrorPageContainer">
      <Header />
      <div className="body">
        <div className="title">Connection Error</div>
        <div className="textError">Ooops, something went wrong</div>
        <div className="errorIcon" />
        <button type="button" className="retryBtn">
          Retry
        </button>
      </div>
    </div>
  );
};

export default ConnectionErrorPage;
