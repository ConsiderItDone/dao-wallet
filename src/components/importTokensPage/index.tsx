import React, { ChangeEvent, useEffect, useState } from "react";
import "./index.css";
import Header from "../header";
import { useAuth, useQuery } from "../../hooks";
import { goBack, goTo } from "react-chrome-extension-router";
import { LocalStorage } from "../../services/chrome/localStorage";
import BalancePage from "../balancePage";
import {
  fetchTokenBalance,
  fetchTokenMetadata,
  TokenMetadata,
} from "../../utils/fungibleTokens";
import { VIEW_FUNCTION_METHOD_NAME } from "../../consts/wrapper";
import { ClipLoader } from "react-spinners";
import defaultTokenIcon from "../../images/defaultTokenIcon.svg";
import { toFixedBottom } from "../../utils/common";

const formatBalance = (balance: number) => {
  if (!balance) return balance;

  if (balance > 1) return Number(toFixedBottom(balance, 2));

  return balance;
};

export const ImportTokensPage = () => {
  const [localStorage] = useState<LocalStorage>(new LocalStorage());
  const { currentAccount: account } = useAuth();

  const [contractAddress, setContractAddress] = useState<string>("");
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(
    null
  );
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  const [isValidatingContractAddress, setIsValidatingContractAddress] =
    useState<boolean>(false);
  const [contractAddressError, setContractAddressError] = useState<
    string | null | undefined
  >(undefined);

  const [isTokenAddressInputStep, setIsTokenAddressInputStep] =
    useState<boolean>(true);
  const [isImportingToken, setIsImportingToken] = useState<boolean>(false);

  const [viewFunctionExecute] = useQuery(VIEW_FUNCTION_METHOD_NAME);

  useEffect(() => {
    const getTokenData = async (tokenAddress: string) => {
      setIsValidatingContractAddress(true);

      try {
        if (!tokenAddress) {
          setContractAddressError(undefined);
          return;
        }

        const tokenData = await fetchTokenMetadata(
          tokenAddress,
          viewFunctionExecute
        );
        if (!tokenData) {
          throw new Error("Failed to get token metadata");
        }
        setTokenMetadata(tokenData);

        const hasUserAlreadyAddedChosenToken =
          await localStorage.currentUserHasToken({
            ...tokenData,
            address: tokenAddress,
            icon: tokenData?.icon || defaultTokenIcon,
          });
        if (hasUserAlreadyAddedChosenToken) {
          setContractAddressError("You have already added this token");
          return;
        }

        if (account?.accountId) {
          const tokenBalance = await fetchTokenBalance(
            tokenAddress,
            tokenData.decimals,
            account.accountId,
            viewFunctionExecute
          );
          setTokenBalance(tokenBalance);
        }

        setContractAddressError(null);
      } catch (error) {
        console.error(
          "[GetTokenMetadata]: failed to get token metadata,",
          error
        );
        setContractAddressError("Failed to get token data");
        setTokenMetadata(null);
      } finally {
        setIsValidatingContractAddress(false);
      }
    };

    getTokenData(contractAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress]);

  const onContractAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    setContractAddress(event?.target?.value);
  };

  const handleCancelOnAddressInput = () => {
    goBack();
  };

  const handleCancelOnTokenImportConfirm = () => {
    setIsTokenAddressInputStep(true);
  };

  const handleAddTokenOnAddressInput = () => {
    setIsTokenAddressInputStep(false);
  };

  const handleAddTokenOnTokenImportConfirm = async () => {
    if (!contractAddress || !tokenMetadata || isImportingToken) return;

    setIsImportingToken(true);

    try {
      await localStorage.addTokenForCurrentAccount({
        ...tokenMetadata,
        address: contractAddress,
        icon: tokenMetadata?.icon || defaultTokenIcon,
      });
      goTo(BalancePage);
    } catch (error) {
      console.error("[HandleAddTokenOnTokenImportConfirm]:", error);
    } finally {
      setIsImportingToken(false);
    }
  };

  return (
    <div className="importTokensPageContainer">
      <Header />
      <div className="body">
        <div className="title">Import Tokens</div>
        {isTokenAddressInputStep ? (
          <div className="form">
            {contractAddress && contractAddressError && (
              <div className="errorMessage">{contractAddressError}</div>
            )}
            <input
              type="text"
              name="contractAddress"
              id="contractAddress"
              placeholder="Token Contract Address"
              value={contractAddress}
              onChange={onContractAddressChange}
              key="contractAddress"
              className={
                !!contractAddress && !!contractAddressError ? "inputError" : ""
              }
            />
            <input
              type="text"
              name="symbol"
              id="symbol"
              placeholder="Token Symbol"
              value={tokenMetadata?.symbol || ""}
              key="symbol"
              disabled={true}
            />
            <input
              type="number"
              name="decimals"
              id="decimals"
              placeholder="Token Decimal"
              value={tokenMetadata?.decimals || ""}
              key="decimals"
              disabled={true}
            />
          </div>
        ) : (
          <div className="confirmTokenImportContainer">
            <div className="subtitle">
              Would you like to import these tokens?
            </div>
            <div className="tokenInfoContainer">
              <div className="tokenInfoLeftPart">
                <div className="tokenIconWrapper">
                  <img src={tokenMetadata?.icon} alt="" className="img" />
                </div>
                <div className="tokenSymbolWrapper">
                  <div className="label">Token</div>
                  <div className="symbol">{tokenMetadata?.symbol}</div>
                </div>
              </div>
              <div className="tokenInfoRightPart">
                <div className="label">Balance</div>
                <div className="amount">
                  {tokenBalance ? formatBalance(tokenBalance) : "-"}
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          className={`addTokenBtn ${
            !isTokenAddressInputStep ? "importTokenBtn" : ""
          }`}
          disabled={
            !contractAddress ||
            contractAddressError === undefined ||
            !!contractAddressError ||
            isValidatingContractAddress ||
            isImportingToken
          }
          onClick={
            isTokenAddressInputStep
              ? handleAddTokenOnAddressInput
              : handleAddTokenOnTokenImportConfirm
          }
        >
          {isTokenAddressInputStep ? (
            "Add Token"
          ) : isImportingToken ? (
            <ClipLoader color="#fff" size={14} />
          ) : (
            "Import Token"
          )}
        </button>
        <button
          className="cancel"
          onClick={
            isTokenAddressInputStep
              ? handleCancelOnAddressInput
              : handleCancelOnTokenImportConfirm
          }
          disabled={isImportingToken}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
