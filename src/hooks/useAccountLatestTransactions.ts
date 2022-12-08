import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type ActivityActionKind =
  | "DEPLOY_CONTRACT"
  | "STAKE"
  | "TRANSFER"
  | "FUNCTION_CALL"
  | "ADD_KEY"
  | "DELETE_KEY"
  | "CREATE_ACCOUNT"
  | "DELETE_ACCOUNT";

export interface AccountActivity {
  action_index: number;
  action_kind: ActivityActionKind;
  args: object;
  block_hash: string;
  block_timestamp: string;
  hash: string;
  receiver_id: string;
  signer_id: string;
}

export const useAccountLatestActivity = (
  accountId: string | undefined
): { activities: AccountActivity[] | undefined; isLoading: boolean } => {
  const { currentNetwork, indexerServiceUrl } = useAuth();

  const [accountActivities, setAccountActivities] = useState<
    AccountActivity[] | undefined
  >(undefined);

  useEffect(() => {
    const getAccountLatestActivities = async (
      accountId: string | undefined
    ) => {
      setAccountActivities(undefined);
      if (!accountId || !currentNetwork?.networkId) {
        return;
      }

      fetch(`${indexerServiceUrl}/account/${accountId}/activity`)
        .then((response) => response.json())
        .then((data) => setAccountActivities(data))
        .catch((error) => {
          console.info(
            "[UseAccountLatestActivity] failed to fetch account activities",
            error
          );
          setAccountActivities([]);
        });
    };

    getAccountLatestActivities(accountId);
  }, [accountId, currentNetwork?.networkId, indexerServiceUrl]);

  return {
    activities: accountActivities,
    isLoading: accountActivities === undefined,
  };
};
