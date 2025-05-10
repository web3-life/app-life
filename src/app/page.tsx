"use client";
import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

const WalletConnectButton = () => {
  return (
    <WalletMultiButton className="wallet-button">
      Connect Wallet
    </WalletMultiButton>
  );
};

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <WalletConnectButton />
      </main>
    </div>
  );
}
