import React from "react";
import { format } from "date-fns";
import "./index.css";
import { useAuth } from "../../hooks";
import { AccountActivity } from "../../hooks/useAccountLatestTransactions";
import { openExternalWebsite } from "../../utils/router";
import iconsObj from "../../assets/icons";
import { toFixedBottom } from "../../utils/common";
import { shortenWalletAddress } from "../../utils/wallet";
import { parseNearTokenAmount } from "../../utils/near";

interface ActivityParsedInfo {
  actionType: string;
  actionExtraMessage: string;
  icon: string;
  nearAmount: number;
  day: string;
  time: string;
  hash: string;
}

function formatActivityDate(timestamp: number | null): [string, string] {
  if (!timestamp) return ["", ""];
  const dateJS = new Date(timestamp);
  if (!dateJS || isNaN(dateJS.getTime())) {
    return ["", ""];
  }
  return [format(dateJS, "dd/MM/yy"), format(dateJS, "HH:mm:ss")];
}

function formatActivityNearAmount(amount: number) {
  if (!amount) return 0;
  return amount >= 0.0001 ? Number(toFixedBottom(amount, 4)) : "< 0.0001";
}

function formatActivityAccountId(accountId: string) {
  if (!accountId) return "";
  return accountId?.length >= 25
    ? shortenWalletAddress(accountId, 10, 4)
    : accountId;
}

function parseActivity(activity: AccountActivity): ActivityParsedInfo {
  let activityInfo: {
    actionType: string;
    actionExtraMessage: string;
    icon: string;
    nearAmount: number;
  };

  switch (activity.action_kind) {
    case "ADD_KEY":
      activityInfo = {
        actionType: "Access Key Added",
        actionExtraMessage: formatActivityAccountId(activity?.args?.public_key),
        icon: iconsObj.actionAddKey,
        nearAmount: 0,
      };
      break;
    case "DELETE_KEY":
      activityInfo = {
        actionType: "Access Key Deleted",
        actionExtraMessage: formatActivityAccountId(activity?.args?.public_key),
        icon: iconsObj.actionDeleteKey,
        nearAmount: 0,
      };
      break;
    case "CREATE_ACCOUNT":
      activityInfo = {
        actionType: "Create Account",
        actionExtraMessage: formatActivityAccountId(activity?.receiver_id),
        icon: iconsObj.actionCreateAccount,
        nearAmount: 0,
      };
      break;
    case "DEPLOY_CONTRACT":
      activityInfo = {
        actionType: "Deploy Contract",
        actionExtraMessage: formatActivityAccountId(activity?.receiver_id),
        icon: iconsObj.actionDeployContract,
        nearAmount: 0,
      };
      break;
    case "DELETE_ACCOUNT":
      activityInfo = {
        actionType: "Delete Account",
        actionExtraMessage: formatActivityAccountId(activity?.receiver_id),
        icon: iconsObj.actionDeleteAccount,
        nearAmount: 0,
      };
      break;
    case "FUNCTION_CALL":
      activityInfo = {
        actionType: "Method Called",
        actionExtraMessage: `${
          activity?.args?.method_name
        } in ${formatActivityAccountId(activity?.receiver_id)}`,
        icon: iconsObj.actionFunctionCall,
        nearAmount: 0,
      };
      break;
    case "TRANSFER":
      activityInfo = {
        actionType: "Transfer",
        actionExtraMessage: formatActivityAccountId(activity?.receiver_id),
        icon: iconsObj.actionTransfer,
        nearAmount: parseNearTokenAmount(activity?.args?.deposit || 0),
      };
      break;
    case "STAKE":
      activityInfo = {
        actionType: "Stake",
        actionExtraMessage: formatActivityAccountId(activity?.receiver_id),
        icon: iconsObj.actionStake,
        nearAmount: parseNearTokenAmount(activity?.args?.stake || 0),
      };
      break;
    default:
      activityInfo = {
        actionType: "Unknown Action",
        actionExtraMessage: activity?.receiver_id
          ? formatActivityAccountId(activity?.receiver_id)
          : "",
        icon: iconsObj.defaultTokenIcon,
        nearAmount: 0,
      };
  }

  const [day, time] = formatActivityDate(
    Math.floor(Number(activity?.block_timestamp) / 1000000)
  );

  return {
    ...activityInfo,
    day,
    time,
    hash: activity?.hash,
  };
}

interface Props {
  activities: AccountActivity[] | undefined;
}

export const AccountLatestActivitiesList = ({ activities }: Props) => {
  const { currentAccount, explorerUrl } = useAuth();

  const openTransaction = (hash: string) => {
    openExternalWebsite(`${explorerUrl}/transactions/${hash}`);
  };

  const handleAllActivities = () => {
    openExternalWebsite(`${explorerUrl}/accounts/${currentAccount?.accountId}`);
  };

  return (
    <div className="accountLatestActivitiesContainer">
      {activities?.length ? (
        <>
          <div className="activitiesList">
            {activities.map(parseActivity).map((parsedActivity, index) => (
              <div
                className="activity"
                key={index}
                onClick={() => {
                  openTransaction(parsedActivity.hash);
                }}
              >
                <div className="iconWrapper">
                  <img src={parsedActivity.icon} className="icon" alt="" />
                </div>
                <div className="actionAndSubInfoWrapper">
                  <div className="action">{parsedActivity.actionType}</div>
                  <div className="subInfo">
                    {parsedActivity.actionExtraMessage}
                  </div>
                </div>
                <div className="amountAndDateWrapper">
                  <div className="nearAmountWrapper">
                    <img src={iconsObj.nearIcon} className="icon" alt="" />
                    <div className="value">
                      {formatActivityNearAmount(parsedActivity.nearAmount)} NEAR
                    </div>
                  </div>
                  <div className="dateTimeWrapper">
                    <div className="date">{parsedActivity?.day}</div>
                    <div className="time">{parsedActivity?.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="allActivitiesButton" onClick={handleAllActivities}>
            All Activity
          </button>
        </>
      ) : (
        <div className="noTransactions">You have no transactions</div>
      )}
    </div>
  );
};
