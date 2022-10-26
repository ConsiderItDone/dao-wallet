import React, { ChangeEvent, useEffect, useState } from "react";
import "./index.css";
import { NFT } from "../../types";
import Header from "../header";
import { accountExists } from "../../utils/account";
import { useQuery } from "../../hooks";
import { AccountBalance } from "../balancePage";
import { ClipLoader } from "react-spinners";
import { goBack, goTo } from "react-chrome-extension-router";
import { makeNftTransfer } from "../../utils/nfts";
import { NftTransferSuccessPage } from "../nftTransferSuccessPage";
import { ACCOUNT_BALANCE_METHOD_NAME } from "../../hooks/useAccountNearBalance";

interface Props {
  nft: NFT;
}

export const TransferNftPage = ({ nft }: Props) => {
  const [recipientAccountId, setRecipientAccountId] = useState<string>("");
  const [recipientAccountIdError, setRecipientAccountIdError] = useState<
    string | null | undefined
  >(undefined);

  const [isValidatingRecipientAccountId, setIsValidatingRecipientAccountId] =
    useState<boolean>(false);
  const [isTransferringNft, setIsTransferringNft] = useState<boolean>(false);

  const [isRecipientEnterStep, setIsRecipientEnterStep] = useState(true);

  const [executeAccountBalanceQuery] = useQuery<AccountBalance>(
    ACCOUNT_BALANCE_METHOD_NAME
  );
  const [functionCallExecute] = useQuery("functionCall");

  useEffect(() => {
    const validateRecipientAccountId = async (
      accountId: string | null | undefined
    ) => {
      if (!accountId) {
        setRecipientAccountIdError(undefined);
        return;
      }

      setIsValidatingRecipientAccountId(true);

      try {
        if (accountId === nft?.owner) {
          setRecipientAccountIdError("You can't transfer NFT to yourself");
          return;
        }

        const exists = await accountExists(
          accountId,
          executeAccountBalanceQuery
        );
        if (!exists) {
          setRecipientAccountIdError("Account doesn't exist");
          return;
        }

        setRecipientAccountIdError(null);
      } catch (error) {
        console.error("[ValidateRecipientAccountId]:", error);
        setRecipientAccountIdError("Account ID validation failed");
      } finally {
        setIsValidatingRecipientAccountId(false);
      }
    };

    validateRecipientAccountId(recipientAccountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientAccountId, nft?.owner]);

  const onRecipientAccountIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    setRecipientAccountId(value);
  };

  const onProceedToNextStep = () => {
    setIsRecipientEnterStep(false);
  };

  const onCancel = () => {
    goBack();
  };

  const handleTransferNft = async () => {
    if (isTransferringNft) return;

    setIsTransferringNft(true);
    try {
      await makeNftTransfer(
        nft?.contractName,
        nft?.tokenId,
        nft?.owner,
        recipientAccountId,
        functionCallExecute
      );
      goTo(NftTransferSuccessPage);
    } catch (error) {
      console.error("[HandleTransferNft]:", error);
    } finally {
      setIsTransferringNft(false);
    }
  };

  const onBack = () => {
    setIsRecipientEnterStep(true);
  };

  return (
    <div className="transferNftPageContainer">
      <Header />
      <div className="body">
        <div className="title">Transfer NFT</div>
        {isRecipientEnterStep ? (
          <>
            <div className="subtitle">
              Enter the recipient address, then proceed to confirm your
              transaction
            </div>
            <div className="nftMediaWrapper">
              <img src={nft?.media} alt="" className="nftMedia" />
            </div>
            <div className="form">
              <div className="accountIdInputWrapper">
                <input
                  className="accountIdInput"
                  placeholder="Send to (Account ID)"
                  onChange={onRecipientAccountIdChange}
                  value={recipientAccountId}
                  disabled={isTransferringNft}
                />
              </div>
              {!!recipientAccountId && recipientAccountIdError && (
                <div className="errorMessage">{recipientAccountIdError}</div>
              )}
            </div>
            <button
              onClick={onProceedToNextStep}
              disabled={
                !recipientAccountId ||
                recipientAccountIdError === undefined ||
                !!recipientAccountIdError ||
                isValidatingRecipientAccountId
              }
              className="button nextStepButton"
            >
              {isValidatingRecipientAccountId ? (
                <ClipLoader color="#9896F0" size={14} />
              ) : (
                "Next Step"
              )}
            </button>
            <button className="cancel" onClick={onCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="smallNftMediaWrapper">
              <img src={nft?.media} alt="" className="smallNftMedia" />
            </div>
            <div className="transferDetailsContainer">
              <div className="transferDetail">
                <div className="label">From</div>
                <div className="value">{nft?.owner}</div>
              </div>
              <div className="transferDetail">
                <div className="label">To</div>
                <div className="value">{recipientAccountId}</div>
              </div>
            </div>
            <button
              onClick={handleTransferNft}
              disabled={
                !recipientAccountId ||
                recipientAccountIdError === undefined ||
                !!recipientAccountIdError ||
                isValidatingRecipientAccountId ||
                isTransferringNft
              }
              className="button transferNftButton"
            >
              {isValidatingRecipientAccountId || isTransferringNft ? (
                <ClipLoader color="#9896F0" size={14} />
              ) : (
                "Confirm Transfer"
              )}
            </button>
            <button
              className="cancel"
              onClick={onBack}
              disabled={isTransferringNft}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};
