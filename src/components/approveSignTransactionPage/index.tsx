import React, { useEffect, useState } from "react";
import "./index.css";
import {
  SessionStorage,
  SessionStorageTransactions,
} from "../../services/chrome/sessionStorage";
import { ClipLoader } from "react-spinners";
import { Loading } from "../animations/loading";
import { shortenWalletAddress } from "../../utils/wallet";

function formatAccountId(accountId: string | undefined) {
  if (!accountId) return accountId;
  return accountId?.length >= 16
    ? shortenWalletAddress(accountId, 4, 4)
    : accountId;
}

const appSessionStorage = new SessionStorage();

export const formatTransactionAction = (action: any) => {
  switch (action.enum) {
    case "createAccount": {
      return {
        type: "CreateAccount",
        params: action.createAccount,
      };
    }
    case "deployContract": {
      return {
        type: "DeployContract",
        params: {
          ...action.deployContract,
        },
      };
    }
    case "functionCall": {
      return {
        type: "FunctionCall",
        params: {
          ...action.functionCall,
          args: action.functionCall.args?.toString(),
        },
      };
    }
    case "transfer": {
      return {
        type: "Transfer",
        params: action.transfer,
      };
    }
    case "stake": {
      return {
        type: "Stake",
        params: {
          ...action.stake,
          publicKey: action.stake.publicKey?.toString(),
        },
      };
    }
    case "addKey": {
      return {
        type: "AddKey",
        params: {
          ...action.addKey,
          publicKey: action.addKey.publicKey?.toString(),
        },
      };
    }
    case "deleteKey": {
      return {
        type: "DeleteKey",
        params: {
          ...action.deleteKey,
          publicKey: action.deleteKey.publicKey?.toString(),
        },
      };
    }
    case "deleteAccount": {
      return {
        type: "DeleteAccount",
        params: action.deleteAccount,
      };
    }
    default: {
      return {
        type: action.enum,
        params: (action as any)[action.enum],
      };
    }
  }
};

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
                      {JSON.stringify(formatTransactionAction(action))}
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
