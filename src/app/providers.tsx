"use client";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

export function Providers({ children }: { children: React.ReactNode }) {
  const wallets = [new PhantomWalletAdapter()];

  const API_KEY = "Qc1TW7xWun2ZxLMJtjCW1arMU9CyhQog5DxcyE5X";
  const endpoint = `https://mainnet.helius-rpc.com/?api-key=e9ab1e81-b3e9-41b2-8382-10b763e23600`;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
