import React, {useEffect, useState} from "react";
import iconsObj from "../../assets/icons";
import Header from "../header";
import Icon from "../icon";
import "./index.css";
import { LocalStorage } from "../../services/chrome/localStorage";

interface Props {
  amount: number;
  receiver: string;
  hash: string;
}

const TransactionPage = ({ amount, receiver, hash }: Props) => {
  const [localStorage] = useState<LocalStorage>(new LocalStorage());
  const [screen, setScreen] = useState(false)

  const getScreen = async () => {
    const screenWidth = await localStorage.getScreen();
    if(screenWidth) {
      setScreen(true)
    }
  }
  useEffect(() => {
    getScreen()
  }, [])

  return (
    <div className={`transactionPageContainer ${screen ? 'full': '' }`}>
      <Header />
      <div className="body">
        <Icon src={iconsObj.transactionIcon} className="icon" />
        <div className="title">Transaction Complete !</div>
        <div className="secondaryTitle">You sent</div>
        <div className="near">{amount} NEAR</div>
        <div className="recipient">
          <a
            target={"_blank"}
            href={`https://explorer.testnet.near.org/transactions/${hash}`}
            rel="noreferrer"
          >
            {receiver}
          </a>
        </div>
        <button className="btnContinue">Continue</button>
      </div>
    </div>
  );
};

export default TransactionPage;
