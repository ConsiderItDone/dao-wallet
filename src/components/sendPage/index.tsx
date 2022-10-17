import React, { useState } from "react";
import Header from "../header";
import iconsObj from "../../assets/icons";
import ConfirmationPage from "../confirmationPage";
import Icon from "../icon";
import "./index.css";
import { goTo, goBack } from "react-chrome-extension-router";
import { Formik, Form, Field, FormikProps, FieldProps } from "formik";
import { useAuth } from "../../hooks";
import { Token } from "../../services/chrome/localStorage";
import Select from "react-select";

interface SendProps {
  token: string | undefined;
  amount: number | undefined;
  receiver: string | undefined;
}
type FormInstance = FormikProps<SendProps>;
const Info = () => {
  const { currentAccount } = useAuth();
  const [receiverValidated, setReceiverValidated] = useState<boolean>();
  const [usdValue, setUsdValue] = useState<number>();

  const onSubmit = (values: SendProps) => {
    console.log("SUMBIT", values);
    const { receiver, amount, token } = values;
    if (receiverValidated) {
      goTo(ConfirmationPage, { receiver, amount, token: token });
    }
    if (!receiverValidated) {
      setReceiverValidated(true);
    }
  };

  const getSelectOptions = (
    assets: Token[]
  ): { label: React.ReactElement; value: string }[] => {
    const nearToken = {
      value: "near",
      label: (
        <div className="container">
          <div className="token">
            <img src={iconsObj.nearMenu} alt="nearToken" />
            <span>Near</span>
          </div>
          <div className="amount">000</div>
        </div>
      ),
    };
    return [
      nearToken,
      ...assets.map((a) => ({
        value: a.address,
        label: (
          <div className="container">
            <div className="token">
              <img src={a.icon} alt={a.name} />
              <span>{a.name}</span>
            </div>
            <div className="amount">100 {a.symbol}</div>
          </div>
        ),
      })),
    ];
  };

  const handleSelectToken = (formik: FormInstance, value: string) => {
    formik.setFieldValue("token", value);
  };

  //TODO token usdt ratio
  const handleAmountChange = (token: string, value: number) => {
    console.log("token", token);
    setUsdValue(value * 6.9208 || undefined);
  };

  const handleSetMaxAmount = (formik: FormInstance) => {
    //TODO set max value here
    formik.setFieldValue("amount", 999);
  };

  const customStyles = {
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

  return (
    <div className="sendPageContainer">
      <Header />

      <div className="body">
        <div className="title">Send</div>
        <Formik<SendProps>
          initialValues={{ token: "", amount: undefined, receiver: "" }}
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
                  options={getSelectOptions(currentAccount?.tokens!)}
                  onChange={(selectValue) =>
                    handleSelectToken(props, selectValue?.value!)
                  }
                  styles={customStyles}
                />
                <div className="balanceBox">
                  <div className="title">Balance</div>
                  <div className="value">0</div>
                </div>
              </div>
              <div className="amountContainer">
                <Field name="amount" type="number">
                  {({ field }: FieldProps) => (
                    <>
                      {field.value && (
                        <div className="visibleAmount">Amount</div>
                      )}
                      <input
                        {...field}
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
                {usdValue && <span className="value">≈ ${usdValue} USD</span>}
                <button
                  onClick={() => handleSetMaxAmount(props)}
                  type="button"
                  className="btnMax"
                >
                  Max
                </button>
              </div>
              <div className="toContainer">
                <Field name="receiver">
                  {({ field }: FieldProps) => {
                    return (
                      <>
                        {field.value && <div className="visibleAmount">To</div>}
                        <input {...field} className="to" placeholder="To" />
                        {receiverValidated && (
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
              <button type="submit" className="btnSubmit">
                Submit
              </button>
            </Form>
          )}
        </Formik>
        <button onClick={() => goBack()} type="button" className="btnCancel">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Info;
