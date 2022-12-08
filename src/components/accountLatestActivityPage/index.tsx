import React from "react";
import "./index.css";
import { useAuth } from "../../hooks";
import Header from "../header";
import { useAccountLatestActivity } from "../../hooks/useAccountLatestTransactions";
import { goBack } from "react-chrome-extension-router";
import { Loading } from "../animations/loading";
import { openExternalWebsite } from "../../utils/router";

export const AccountLatestActivityPage = () => {
  const { currentAccount, explorerUrl } = useAuth();

  const { activities, isLoading } = useAccountLatestActivity(
    currentAccount?.accountId
  );

  const openTransaction = (hash: string) => {
    openExternalWebsite(`${explorerUrl}/transactions/${hash}`);
  };

  const handleMoreActivities = () => {
    openExternalWebsite(`${explorerUrl}/accounts/${currentAccount?.accountId}`);
  };

  const onBack = () => {
    goBack();
  };

  return (
    <div className="accountLatestActivityPageContainer">
      <Header />
      <div className="body">
        <div className="title">Latest Activities</div>
        <div className="activitiesWrapper">
          {isLoading ? (
            <div className="clipLoaderContainer">
              <Loading />
            </div>
          ) : activities && activities.length > 0 ? (
            <>
              {activities?.map((activity, index) => (
                <div
                  className="activity"
                  key={index}
                  onClick={() => {
                    openTransaction(activity.hash);
                  }}
                >
                  <div className="activityKind">{activity.action_kind}</div>
                </div>
              ))}
              <button
                className="moreActivitiesButton"
                onClick={handleMoreActivities}
              >
                More Activities
              </button>
            </>
          ) : (
            <div>No activities</div>
          )}
        </div>
        <div className="buttonsContainer">
          <button className="backBtn" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
