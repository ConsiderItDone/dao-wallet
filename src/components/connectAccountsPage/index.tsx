import React, { useEffect, useState } from "react";
import "./index.css";
import { LocalStorage } from "../../services/chrome/localStorage";
import { useAuth } from "../../hooks";
import iconsObj from "../../assets/icons";
import Icon from "../icon";
import { ClipLoader } from "react-spinners";

const appLocalStorage = new LocalStorage();

interface ConnectAccountOption {
  accountId: string;
  isChosen: boolean;
}

interface Props {
  website: string;
}

export const ConnectAccountsPage = ({ website }: Props) => {
  const { accounts } = useAuth();

  const [connectAccountOptions, setConnectAccountOptions] = useState<
    ConnectAccountOption[] | undefined
  >(undefined);

  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  useEffect(() => {
    const getAlreadyConnectedAccounts = async (website: string) => {
      const connectedAccounts =
        await appLocalStorage.getWebsiteConnectedAccounts(website);

      const connectAccountOptions: ConnectAccountOption[] = accounts.map(
        (account) => {
          const isAlreadyChosen = connectedAccounts.some(
            (connectedAccount) =>
              connectedAccount.accountId === account.accountId
          );
          return {
            accountId: account.accountId,
            isChosen: isAlreadyChosen,
          };
        }
      );
      setConnectAccountOptions(connectAccountOptions);
    };

    if (accounts && website) {
      getAlreadyConnectedAccounts(website);
    } else {
      setConnectAccountOptions(undefined);
    }
  }, [accounts, website]);

  const onConfirm = async () => {
    setIsConfirming(true);

    await appLocalStorage.setWebsiteConnectedAccounts(
      website,
      connectAccountOptions
        ? connectAccountOptions
            .filter((account) => account.isChosen)
            .map((account) => account.accountId)
        : []
    );

    setTimeout(() => window.close(), 1000);
  };

  const onCancel = () => {
    window.close();
  };

  return (
    <div className="connectAccountsPageContainer">
      <div className="body">
        <div className="title">Choose accounts for connection with</div>
        <div className="secondaryTitle">{website}</div>
        <div className="accountsContainer">
          {connectAccountOptions?.map((accountOption, index) => (
            <div
              className={`account ${
                accountOption.isChosen ? "chosenAccount" : ""
              }`}
              key={index}
              onClick={() => {
                setConnectAccountOptions([
                  ...connectAccountOptions.slice(0, index),
                  { ...accountOption, isChosen: !accountOption.isChosen },
                  ...connectAccountOptions.slice(index + 1),
                ]);
              }}
            >
              <div className="accountId">{accountOption.accountId}</div>
              {accountOption.isChosen ? (
                <Icon src={iconsObj.success} className="isChosenIcon" />
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="connectAccountsBtn confirm"
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? <ClipLoader color="#fff" size={14} /> : "Confirm"}
        </button>
        <button
          type="button"
          className="connectAccountsBtn cancel"
          onClick={onCancel}
          disabled={isConfirming}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
