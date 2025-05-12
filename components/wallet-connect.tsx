"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaWalletConnectProps {
  style?: React.CSSProperties;
  className?: string;
}

const SolanaWalletConnect: React.FC<SolanaWalletConnectProps> = ({
  style,
  className,
}) => {
  const { publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAddress = (address: PublicKey | null): string => {
    if (!address) return "";
    const addr = address.toBase58();
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (!mounted) {
    return (
      <div
        className={`wallet-connect-wrapper ${className || ""}`}
        style={style}
      ></div>
    );
  }

  return (
    <div className={`wallet-connect-wrapper ${className || ""}`} style={style}>
      {publicKey ? (
        <div className="connected-wallet flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {formatAddress(publicKey)}
          </span>
          <WalletMultiButton className="wallet-multi-btn" />
        </div>
      ) : (
        <WalletMultiButton className="wallet-multi-btn" />
      )}
    </div>
  );
};

export default SolanaWalletConnect;
