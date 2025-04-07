"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ConnectButton,
  AccountBalance,
  AccountBalanceInfo,
  useActiveAccount,
} from "thirdweb/react";
import { formatNumber } from "thirdweb/utils";
import { getBalance } from "thirdweb/extensions/erc20";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { ethereum } from "thirdweb/chains";
import { AccountProvider, AccountAddress } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";

const sepolia = {
  id: 11155111,
  name: "Ethereum Sepolia",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.org"],
    },
  },
};
export default function Home() {
  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />
      </div>
    </main>
  );
}

function Header() {
  const [message, setMessage] = useState("Loading...");
  const account = useActiveAccount();

  useEffect(() => {
    console.log("Fetching from Next.js API...");

    fetch("/api/getData") // Fetch from Next.js API
      .then((res) => res.json())
      .then((data) => {
        console.log("Received data:", data);
        setMessage(data.message);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage("Error fetching data");
      });
  }, []);
  const format = (props: AccountInfoBalance): string =>
    `${formatNumber(props.balance, 1)} ${props.symbol.toLowerCase()}`;

  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <div className="px-4 py-5 my-5 text-center">
        <Image
          className="d-block mx-auto mb-4"
          src="/icon.png"
          alt=""
          width="72"
          height="57"
        />
        <h1 className="text-slate-900 text-6xl tracking-tight font-extrabold sm:text-4xl md:text-6xl lg:text-8xl dark:text-white">
          Kudukka
        </h1>
        <div>
          {account?.address ? (
            <AccountProvider address={account.address} client={client}>
              <AccountBalance
                chain={sepolia}
                loadingComponent={<span>Loading...</span>}
              />
            </AccountProvider>
          ) : (
            <p className="text-gray-500">Connect your wallet to view balance</p>
          )}
        </div>
        <div className="col-lg-6 mx-auto">
          <p className="text-center p-7 md:text-center lead mb-4">
            Your ultimate destination for secure and intelligent cryptocurrency
            management. Our platform combines technology to safeguard your
            investments with advanced AI-powered analytics to guide your buying
            decisions. With our cutting-edge AI, you gain real-time insights and
            predictions on the best cryptocurrencies to buy, ensuring you stay
            ahead in the dynamic crypto market.
          </p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Example App",
                url: "https://example.com",
              }}
            />
            <br />
          </div>
          <br></br>
          <p className="button-50" role="button">
            {message} is going up !! 🔥🔥
          </p>
        </div>
      </div>
    </header>
  );
}
