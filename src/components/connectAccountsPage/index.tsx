import React, { useEffect, useState } from "react";
import "./index.css";
import { LocalStorage } from "../../services/chrome/localStorage";
import { useAuth } from "../../hooks";
import iconsObj from "../../assets/icons";
import Icon from "../icon";
import { ClipLoader } from "react-spinners";
import { getImplicitAccountId } from "../../utils/account";
import { ReactComponent as ArrowIcon } from "../../images/arrow.svg";

const appLocalStorage = new LocalStorage();

interface ConnectAccountOption {
  accountId: string;
  publicKey: string | undefined;
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

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<1 | 2>(1);

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
            publicKey: account.publicKey,
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

  const handleNext = () => {
    setTabIndex(2);
  };

  const handleConnectAccounts = async () => {
    setIsConnecting(true);

    await appLocalStorage.setWebsiteConnectedAccounts(
      website,
      connectAccountOptions
        ? connectAccountOptions
            .filter((account) => account.isChosen)
            .map((account) =>
              account.publicKey
                ? getImplicitAccountId(account.publicKey)
                : account.accountId
            )
        : []
    );

    setTimeout(() => window.close(), 1000);
  };

  const onCancel = () => {
    window.close();
  };

  const goBack = () => {
    setTabIndex(1);
  };

  const updateConnectedAccount = (
    accountOption: ConnectAccountOption,
    index: number
  ) => {
    setConnectAccountOptions((prevState) =>
      prevState
        ? [
            ...prevState.slice(0, index),
            { ...accountOption, isChosen: !accountOption.isChosen },
            ...prevState.slice(index + 1),
          ]
        : []
    );
  };

  const onSelectAll = () => {
    const areAllSelected = connectAccountOptions?.every(
      (account) => account.isChosen
    );
    const newIsChosenValue = !areAllSelected;
    setConnectAccountOptions((prevState) => {
      return prevState?.map((account) => ({
        ...account,
        isChosen: newIsChosenValue,
      }));
    });
  };

  const isAnyAccountChosen = connectAccountOptions?.some(
    (account) => account.isChosen
  );

  return (
    <div className="connectAccountsPageContainer">
      <header>
        <div className="tabSelector">
          <button onClick={goBack} className="backBtn" disabled={tabIndex <= 1}>
            <ArrowIcon />
          </button>
          <div className="tabInfo">{tabIndex} of 2</div>
        </div>
        <div className="brandName">DAO Wallet</div>
      </header>
      <div className="body">
        <div className="websiteWrapper">
          <img
            src={`https://s2.googleusercontent.com/s2/favicons?domain=${website}`}
            alt=""
            className="favicon"
          />
          <div className="website">{website}</div>
        </div>
        <div className="title">
          {tabIndex === 1 ? (
            <>
              <span>
                Connect with <br /> DAO Wallet
              </span>
            </>
          ) : (
            <>
              <span>Connect To</span>
              <Icon className="arrowDown" src={iconsObj.arrowDownGroup} />
            </>
          )}
        </div>
        {tabIndex === 1 ? (
          <div className="subtitle">
            Select the account(s) to use on this site
          </div>
        ) : null}
        {tabIndex === 1 ? (
          <div className="connectAccountCheckboxWrapper selectAll">
            <input
              type="checkbox"
              className="connectAccountCheckbox"
              id="selectAll"
              name="selectAll"
              checked={connectAccountOptions?.every(
                (account) => account.isChosen
              )}
              onClick={onSelectAll}
            />
            <label htmlFor="selectAll">Select all</label>
          </div>
        ) : null}
        <div className="accountsContainer">
          {tabIndex === 1
            ? connectAccountOptions?.map((accountOption, index) => (
                <div className="connectAccountCheckboxWrapper" key={index}>
                  <input
                    type="checkbox"
                    className="connectAccountCheckbox"
                    id={`account#${index}`}
                    name={`account#${index}`}
                    checked={accountOption.isChosen}
                    onClick={() => updateConnectedAccount(accountOption, index)}
                  />
                  <label
                    className="connectAccountCheckboxLabel"
                    htmlFor={`account#${index}`}
                  >
                    {accountOption.accountId}
                  </label>
                </div>
              ))
            : connectAccountOptions
                ?.filter((accountOption) => accountOption?.isChosen)
                ?.map((accountOption, index) => (
                  <div
                    className="connectAccountCheckboxWrapper chosenAccount"
                    key={index}
                  >
                    <div className="connectAccountCheckboxLabel">
                      {accountOption.accountId}
                    </div>
                  </div>
                ))}
        </div>
      </div>
      <footer>
        {tabIndex === 2 ? (
          <div className="allowsMessage">
            Allow this site to: See address, account balance, <br /> activity
            and suggest transactions to approve
          </div>
        ) : null}
        <div className="warningMessage">Only connect with sites you trust.</div>
        <button
          type="button"
          className="connectAccountsBtn confirm"
          onClick={
            tabIndex === 1 && isAnyAccountChosen
              ? handleNext
              : handleConnectAccounts
          }
          disabled={isConnecting}
        >
          {isConnecting ? (
            <ClipLoader color="#fff" size={14} />
          ) : tabIndex === 1 && isAnyAccountChosen ? (
            "Next"
          ) : isAnyAccountChosen ? (
            "Connect"
          ) : (
            "Confirm"
          )}
        </button>
        <button
          type="button"
          className="connectAccountsBtn cancel"
          onClick={onCancel}
          disabled={isConnecting}
        >
          Cancel
        </button>
      </footer>
    </div>
  );
};
