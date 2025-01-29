"use client";

import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
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
          </div>
        </div>
      </div>
    </header>
  );
}
