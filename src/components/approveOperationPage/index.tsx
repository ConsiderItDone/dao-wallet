import React, { useEffect, useState } from "react";
import "./index.css";
import {
  SessionStorage,
  TransactionsDataType,
} from "../../services/chrome/sessionStorage";
import { ClipLoader } from "react-spinners";
import { Loading } from "../animations/loading";
import { shortenWalletAddress } from "../../utils/wallet";
import {
  InjectedAPISignInParamsDTO,
  InjectedAPISignOutParamsDTO,
  InjectedAPITransactionOptions,
} from "../../scripts/injectedAPI/injectedAPI.types";

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
  operationType: TransactionsDataType;
}

export const ApproveOperationPage = ({
  website,
  transactionUuid,
  operationType,
}: Props) => {
  const [transactions, setTransactions] = useState<
    InjectedAPITransactionOptions[] | undefined
  >(undefined);
  const [signInData, setSignInData] = useState<
    InjectedAPISignInParamsDTO | undefined
  >(undefined);
  const [signOutData, setSignOutData] = useState<
    InjectedAPISignOutParamsDTO | undefined
  >(undefined);

  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getOperationDataFromSessionStorage = async (
      transactionUuid: string
    ) => {
      setTransactions(undefined);
      setSignInData(undefined);
      setSignOutData(undefined);
      setError(undefined);

      const operationData = await appSessionStorage.getTransactionsData(
        transactionUuid
      );
      if (!operationData) {
        setError("Failed to find transaction");
      }

      switch (operationType) {
        case "signTransactions":
          setTransactions(
            operationData?.data as InjectedAPITransactionOptions[]
          );
          break;
        case "signIn":
          setSignInData(operationData?.data as InjectedAPISignInParamsDTO);
          break;
        case "signOut":
          setSignOutData(operationData?.data as InjectedAPISignOutParamsDTO);
          break;
        default:
          setError("Failed to find operation data");
          break;
      }
    };

    getOperationDataFromSessionStorage(transactionUuid);
  }, [transactionUuid, operationType]);

  const onConfirm = async () => {
    setIsConfirming(true);
    await appSessionStorage.updateTransactionsDataStatus(transactionUuid, true);
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
          {operationType === "signIn" ? (
            <>Requested to sign in</>
          ) : operationType === "signOut" ? (
            <>Requested to sign out</>
          ) : (
            <>
              Requested to sign transaction
              {transactions && transactions.length > 1 ? "s" : ""}
            </>
          )}
        </div>
        <div className="data">
          {error ? (
            <div className="error">{error}</div>
          ) : transactions ? (
            transactions.map((transaction) => (
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
          ) : signInData ? (
            <div className="signInData">
              <div className="permission">
                {JSON.stringify(signInData.permission)}
              </div>
              <div className="accountsWrapper">
                {signInData.accounts?.map((account, index) => (
                  <div className="account" key={index}>
                    <div className="accountId">{account.accountId}</div>
                    <div className="publicKey">{account.publicKey}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : signOutData ? (
            <div className="signOutData">
              <div className="accountsWrapper">
                {signOutData.accounts?.map((account, index) => (
                  <div className="account" key={index}>
                    <div className="accountId">{account.accountId}</div>
                    <div className="publicKey">{account.publicKey}</div>
                  </div>
                ))}
              </div>
            </div>
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
