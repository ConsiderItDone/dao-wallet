import React, { useEffect, useState } from "react";
import "./index.css";
import {
  SessionStorage,
  SessionStorageTransactions,
} from "../../services/chrome/sessionStorage";
import { ClipLoader } from "react-spinners";
import { Loading } from "../animations/loading";
import { shortenWalletAddress } from "../../utils/wallet";
import { parseNearTokenAmount } from "../../utils/near";

function formatAccountId(accountId: string | undefined) {
  if (!accountId) return accountId;
  return accountId?.length >= 16
    ? shortenWalletAddress(accountId, 4, 4)
    : accountId;
}

const appSessionStorage = new SessionStorage();

interface Props {
  website: string;
  transactionUuid: string;
}

export const ApproveSignTransactionPage = ({
  website,
  transactionUuid,
}: Props) => {
  const [transactions, setTransactions] = useState<
    SessionStorageTransactions | undefined
  >(undefined);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getTransactionsFromSessionStorage = async (
      transactionUuid: string
    ) => {
      const transaction = await appSessionStorage.getTransaction(
        transactionUuid
      );
      setTransactions(transaction);
      if (!transaction) {
        setError("Failed to find transaction");
      }
    };

    getTransactionsFromSessionStorage(transactionUuid);
  }, [transactionUuid]);

  const onConfirm = async () => {
    setIsConfirming(true);
    await appSessionStorage.updateTransactionsStatus(transactionUuid, true);
    setTimeout(() => window.close(), 1000);
  };

  const onCancel = () => {
    window.close();
  };

  return (
    <div className="approveSignTransactionPageContainer">
      <div className="body">
        <div className="originWebsite">{website}</div>
        <div className="subtitle">
          Requested to sign transaction
          {transactions?.transactionsOptions &&
          transactions?.transactionsOptions?.length > 1
            ? "s"
            : ""}
        </div>
        <div className="data">
          {error ? (
            <div className="error">{error}</div>
          ) : transactions?.transactionsOptions ? (
            transactions.transactionsOptions.map((transaction) => (
              <div className="transactionWrapper">
                <div className="transactionActions">
                  {transaction.actions?.map((action) => (
                    <div className="action">
                      <div>Enum: {action?.enum}</div>
                      <div>
                        Method name: {(action as any)[action?.enum]?.methodName}
                      </div>
                      <div>
                        Gas:{" "}
                        {parseNearTokenAmount(
                          (action as any)[action?.enum]?.gas
                        )}{" "}
                        NEAR
                      </div>
                    </div>
                  ))}
                </div>
                <div className="receiverId">
                  Receiver ID: {formatAccountId(transaction.receiverId)}
                </div>
                <div className="signerId">
                  Signer ID: {formatAccountId(transaction.signerId)}
                </div>
              </div>
            ))
          ) : (
            <div className="clipLoaderContainer">
              <Loading />
            </div>
          )}
        </div>
        <button
          type="button"
          className="approveTxButton confirm"
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? <ClipLoader color="#fff" size={14} /> : "Confirm"}
        </button>
        <button
          type="button"
          className="approveTxButton cancel"
          onClick={onCancel}
          disabled={isConfirming}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
