import React, { useRef, useState } from "react";
import Header from "../header";
import iconsObj from "../../assets/icons";
import ConfirmationPage from "../confirmationPage";
import Icon from "../icon";
import "./index.css";
import { goTo, goBack } from "react-chrome-extension-router";
import { Formik, Form, Field, FormikProps, FieldProps } from "formik";
import { useAuth, useQuery } from "../../hooks";
import Select from "react-select";
import { useAccountTokens } from "../../hooks/useAccountTokens";
import {
  ACCOUNT_BALANCE_METHOD_NAME,
  useAccountNearBalance,
} from "../../hooks/useAccountNearBalance";
import { useNearToUsdRatio } from "../../hooks/useNearToUsdRatio";
import { TokenAmountData } from "../tokenList";
import { Loading } from "../animations/loading";
import { accountExists } from "../../utils/account";
import { AccountBalance } from "../balancePage";
import { ClipLoader } from "react-spinners";

interface SelectedTokenOption {
  label: React.ReactElement;
  value: TokenAmountData | undefined;
}

const selectInputStyles = {
  option: () => ({}),
  control: (provided: any, state: any) => {
    return {
      background: state.menuIsOpen
        ? "rgba(0, 0, 0, 0.2)"
        : "rgba(0, 0, 0, 0.08)",
      borderBottomLeftRadius: state.menuIsOpen ? 0 : "",
      borderBottomRightRadius: state.menuIsOpen ? 0 : "",
    };
  },
};

const formatTokenAmount = (amount: number | undefined) => {
  if (!amount) return 0;
  return amount >= 0.001 ? Number(amount.toFixed(4)) : amount;
};

const formatUsdAmount = (amount: number | undefined) => {
  if (!amount) return 0;
  if (amount < 0.0001) return "< 0.0001";
  if (amount >= 0.01) return Number(amount.toFixed(2));

  return Number(amount.toFixed(4));
};

// TODO: choose proper max amount for sending tokens
const MAX_INPUT_AMOUNT = 1000000;

interface SendProps {
  token: TokenAmountData | undefined;
  amount: number | "" | undefined;
  receiver: string | undefined;
}

type FormInstance = FormikProps<SendProps>;

const SendPage = () => {
  const { currentAccount } = useAuth();
  const [usdValue, setUsdValue] = useState<number>();
  const [getAccount] = useQuery("getAccountBalance");

  const validateAccount = async (accountId: string) => {
    const { data: accountExists } = await getAccount({ accountId });
    if (accountExists) {
      return true;
    }
    return false;
  };

  const { accountNearBalance, isLoadingAccountBalance } = useAccountNearBalance(
    currentAccount?.accountId
  );
  const nearToUsdRatio = useNearToUsdRatio();
  const fungibleTokensList = useAccountTokens(
    currentAccount?.accountId,
    accountNearBalance?.available,
    nearToUsdRatio
  );

  const [isValidatingReceiver, setIsValidatingReceiver] =
    useState<boolean>(false);
  const [receiverValidated, setReceiverValidated] = useState<boolean>();
  const [receiverAccountIdError, setReceiverAccountIdError] = useState<
    string | null | undefined
  >(undefined);

  const [isValidatingAmount, setIsValidatingAmount] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<string | null | undefined>(
    undefined
  );

  const [executeAccountBalanceQuery] = useQuery<AccountBalance>(
    ACCOUNT_BALANCE_METHOD_NAME
  );

  const onSubmit = (values: SendProps) => {
    const { receiver, amount, token: tokenAmountData } = values;
    if (receiver && amount && receiverValidated && tokenAmountData) {
      goTo(ConfirmationPage, {
        receiver,
        amount,
        token: tokenAmountData.token,
        usdRatio: tokenAmountData.usdRatio,
      });
    }
  };

  const getSelectOptions = (
    assets: TokenAmountData[]
  ): SelectedTokenOption[] => {
    if (!fungibleTokensList?.length) return [];

    return [
      ...assets.map((tokenAmountData) => ({
        value: tokenAmountData,
        label: (
          <div className="container">
            <div className="token">
              <img
                src={tokenAmountData?.token?.icon}
                alt={tokenAmountData?.token?.name}
              />
              <span className="tokenName">{tokenAmountData?.token?.name}</span>
            </div>
            <div className="amount">
              {formatTokenAmount(tokenAmountData?.amount)}{" "}
              {tokenAmountData?.token?.symbol}
            </div>
          </div>
        ),
      })),
    ];
  };

  const handleSelectToken = (formik: FormInstance, value: TokenAmountData) => {
    formik.setFieldValue("token", value);
    const amount = formik.getFieldProps("amount").value;
    handleAmountChange(value, amount);
  };

  const handleAmountChange = (tokenData: TokenAmountData, value: number) => {
    setUsdValue(
      value && tokenData?.usdRatio ? value * tokenData?.usdRatio : undefined
    );

    setAmountError(undefined);
    setIsValidatingAmount(true);

    try {
      if (value > tokenData?.amount!) {
        setAmountError("Amount is bigger than your balance");
        return;
      }

      setAmountError(null);
    } catch (error) {
      console.error("[HandleAmountChange]:", error);
      setAmountError("Failed to validate amount");
    } finally {
      setIsValidatingAmount(false);
    }
  };

  const handleSetMaxAmount = (formik: FormInstance) => {
    const selectedToken: TokenAmountData = formik.getFieldProps("token").value;
    const maxAmount = Math.min(MAX_INPUT_AMOUNT, selectedToken?.amount!);
    formik.setFieldValue("amount", maxAmount);
    handleAmountChange(formik.getFieldProps("token").value, maxAmount);
  };

  const timeout = useRef<NodeJS.Timeout | null>(null);

  const validateReceiver = async (accountId: string | null | undefined) => {
    setReceiverValidated(false);
    if (!accountId) {
      setReceiverAccountIdError(undefined);
      return;
    }

    setIsValidatingReceiver(true);

    try {
      if (accountId === currentAccount?.accountId) {
        setReceiverAccountIdError("You can't send token to yourself");
        return;
      }

      const exists = await accountExists(accountId, executeAccountBalanceQuery);
      if (!exists) {
        setReceiverAccountIdError("Account doesn't exist");
        return;
      }

      setReceiverAccountIdError(null);
      setReceiverValidated(true);
    } catch (error) {
      console.error("[ValidateReceiver]:", error);
      setReceiverAccountIdError("Account ID validation failed");
    } finally {
      setIsValidatingReceiver(false);
    }
  };

  return (
    <div className="sendPageContainer">
      <Header />

      <div className="body">
        {isLoadingAccountBalance || !fungibleTokensList ? (
          <div className="loadingContainer">
            <Loading />
          </div>
        ) : (
          <>
            <div className="title">Send</div>
            <Formik<SendProps>
              initialValues={{
                token: undefined,
                amount: "",
                receiver: "",
              }}
              onSubmit={onSubmit}
            >
              {(props: FormikProps<SendProps>) => (
                <Form>
                  <div className="dropDownContainer">
                    <Select
                      autoFocus={true}
                      placeholder="Select asset"
                      className="react-select-container"
                      classNamePrefix={"react-select"}
                      options={getSelectOptions(fungibleTokensList)}
                      onChange={(selectValue) =>
                        handleSelectToken(props, selectValue?.value!)
                      }
                      styles={selectInputStyles}
                    />
                    <div className="balanceBox">
                      <div className="title">Balance</div>
                      <div className="value">
                        {props?.getFieldProps("token")?.value?.amount
                          ? formatTokenAmount(
                              props.getFieldProps("token").value.amount
                            )
                          : 0}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`amountContainer ${
                      !!props.getFieldProps("amount").value && amountError
                        ? "fieldError"
                        : ""
                    }`}
                  >
                    <Field name="amount" type="number">
                      {({ field }: FieldProps) => (
                        <>
                          {(field.value === 0 || field.value) && (
                            <div className="visibleAmount">Amount</div>
                          )}
                          <input
                            {...field}
                            disabled={!props.getFieldProps("token").value}
                            onChange={(event) => {
                              field.onChange(event);
                              handleAmountChange(
                                props.getFieldProps("token").value,
                                Number(event.target.value)
                              );
                            }}
                            placeholder="Amount"
                            className="amount"
                            type="number"
                          />
                        </>
                      )}
                    </Field>
                    {usdValue && (
                      <span className="usdValue">
                        ≈ ${formatUsdAmount(usdValue)} USD
                      </span>
                    )}
                    <button
                      className="btnMax"
                      type="button"
                      onClick={() => handleSetMaxAmount(props)}
                      disabled={!props.getFieldProps("token").value}
                    >
                      Max
                    </button>
                  </div>
                  <div
                    className={`toContainer ${
                      !!props.getFieldProps("receiver").value &&
                      receiverAccountIdError
                        ? "fieldError"
                        : ""
                    }`}
                  >
                    <Field name="receiver">
                      {({ field }: FieldProps) => {
                        return (
                          <>
                            {field.value && (
                              <div className="visibleAmount">To</div>
                            )}
                            <input
                              {...field}
                              className="to toInput"
                              placeholder="To"
                              onChange={(event) => {
                                if (timeout.current)
                                  clearTimeout(timeout.current);
                                field.onChange(event);
                                setIsValidatingReceiver(true);
                                timeout.current = setTimeout(
                                  () => validateReceiver(event.target.value),
                                  1000
                                );
                              }}
                            />
                            {!isValidatingReceiver &&
                              !!field.value &&
                              receiverAccountIdError !== undefined &&
                              !receiverAccountIdError && (
                                <Icon
                                  src={iconsObj.success}
                                  className="successIcon"
                                />
                              )}
                          </>
                        );
                      }}
                    </Field>
                  </div>
                  <button
                    type="submit"
                    className="btnSubmit"
                    disabled={
                      !receiverValidated ||
                      !props.getFieldProps("receiver").value ||
                      !props.getFieldProps("amount").value ||
                      isValidatingReceiver ||
                      receiverAccountIdError === undefined ||
                      !!receiverAccountIdError ||
                      isValidatingAmount ||
                      amountError === undefined ||
                      !!amountError
                    }
                  >
                    {isValidatingReceiver || isValidatingAmount ? (
                      <ClipLoader color="#fff" size={14} />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </Form>
              )}
            </Formik>
            <button
              onClick={() => goBack()}
              type="button"
              className="btnCancel"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SendPage;
