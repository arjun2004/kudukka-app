"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ConnectButton,
  AccountBalance,
  useActiveAccount,
} from "thirdweb/react";
import { formatNumber } from "thirdweb/utils";
import { client } from "./client";
import { AccountProvider } from "thirdweb/react";

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
  const [balance, setBalance] = useState("");
  const [hasBalance, setHasBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const account = useActiveAccount();
  const balanceRef = useRef(null);
  const [balanceCheckAttempts, setBalanceCheckAttempts] = useState(0);

  useEffect(() => {
    fetch("/api/getData")
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

  // Reset states when account changes
  useEffect(() => {
    if (!account?.address) {
      setBalance("");
      setHasBalance(false);
      setIsLoading(false);
      setBalanceCheckAttempts(0);
    } else {
      setIsLoading(true);
      setBalanceCheckAttempts(0);
    }
  }, [account?.address]);

  // Function to check balance from the rendered text
  const checkBalance = () => {
    if (!balanceRef.current || !account?.address) return false;

    const balanceText = balanceRef.current.textContent || "";
    console.log(
      `Balance check attempt ${balanceCheckAttempts + 1}:`,
      balanceText
    );

    // Only proceed if the text contains "ETH" (meaning it's loaded)
    if (balanceText.includes("ETH") || balanceText.includes("eth")) {
      // Use regex to extract the number part
      const match = balanceText.match(/(\d+\.?\d*)\s*(?:ETH|eth)/i);

      if (match && match[1]) {
        const numericPart = match[1];
        console.log("Successfully extracted balance:", numericPart);

        // Parse the number
        const numericValue = parseFloat(numericPart);

        // Update state
        setBalance(numericPart);
        setHasBalance(!isNaN(numericValue) && numericValue > 0);
        setIsLoading(false);

        return true; // Successfully extracted
      }
    }

    return false; // Not successful
  };

  // Keep trying to extract the balance until successful or max attempts reached
  useEffect(() => {
    if (!account?.address) return;

    const MAX_ATTEMPTS = 10;

    // If we've already checked too many times, stop trying
    if (balanceCheckAttempts >= MAX_ATTEMPTS) {
      console.log("Max balance check attempts reached, giving up");
      setIsLoading(false);
      return;
    }

    const intervalId = setInterval(() => {
      const success = checkBalance();

      if (success) {
        // If successful, clear the interval
        clearInterval(intervalId);
      } else {
        // If not successful, increment attempts
        setBalanceCheckAttempts((prev) => prev + 1);

        // If we've hit max attempts, stop loading
        if (balanceCheckAttempts >= MAX_ATTEMPTS - 1) {
          clearInterval(intervalId);
          setIsLoading(false);
        }
      }
    }, 500); // Check every 500ms

    return () => clearInterval(intervalId);
  }, [account?.address, balanceCheckAttempts]);

  // Simple formatter for display
  const formatBalance = (props: any): string => {
    return `${formatNumber(props.balance, 4)} ${props.symbol.toLowerCase()}`;
  };

  // Get the appropriate button message
  const getButtonMessage = () => {
    if (!account?.address) {
      return `${message[0].replace('$', '')} is the recommended coin 🔥🔥`;
    }

    if (isLoading) {
      return "Checking your balance...";
    }

    if (hasBalance) {
      return `Hold Ethereum Sepolia`;
    } else {
      return `${message} is the recommended coin 🔥🔥`;
    }
  };

  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <div className="px-4 py-5 my-5 text-center">
        <Image
          className="d-block mx-auto mb-4"
          src="/icon.png"
          alt=""
          width={72}
          height={57}
        />
        <h1 className="text-slate-900 text-6xl tracking-tight font-extrabold sm:text-4xl md:text-6xl lg:text-8xl dark:text-white">
          Kudukka
        </h1>

        {/* Hidden div that contains the balance element for extraction purposes */}
        <div className="hidden">
          {account?.address && (
            <div ref={balanceRef}>
              <AccountProvider address={account.address} client={client}>
                <AccountBalance
                  chain={sepolia}
                  loadingComponent={<span>Loading your balance...</span>}
                  formatValue={formatBalance}
                />
              </AccountProvider>
            </div>
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
            {getButtonMessage()}{" "}
            {account?.address && hasBalance ? `(${balance} ETH) 🔥🔥` : ""}
          </p>
        </div>
      </div>
    </header>
  );
}
