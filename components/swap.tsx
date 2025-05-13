"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
} from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React, { useState, useEffect } from "react";
import { createJupiterApiClient } from "@jup-ag/api";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, Wallet } from "lucide-react";

const JSBI = {
  BigInt: (value: number | string): any => BigInt(value),
};

const inputMint = new PublicKey("So11111111111111111111111111111111111111112"); // SOL 的 Mint 地址
const outputMint = new PublicKey(
  "7YdwpERJjzw7UVojxLpvu5ycKBRdYaxaKn4HvoHLpump"
); // Life++ 的 Mint 地址

const SolanaSwapComponent: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState<string>("1");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);

  useEffect(() => {
    if (!connection || !publicKey) return;

    const fetchBalances = async () => {
      try {
        // 获取SOL余额
        const solBalance = await connection.getBalance(publicKey);
        setBalance(solBalance / 1e9);
        const ata = await getAssociatedTokenAddress(outputMint, publicKey);
        try {
          const tokenAccount = await getAccount(connection, ata);
          setTokenBalance(Number(tokenAccount.amount) / 1e6);
        } catch (error) {
          // 如果 ATA 不存在，余额为 0
          if (
            error instanceof Error &&
            error.message.includes("Account does not exist")
          ) {
            setTokenBalance(0);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
  }, [publicKey, connection]);

  const handleSwap = async () => {
    if (!publicKey || !amount) {
      setMessage("Please connect wallet and enter an amount");
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      // 1. 初始化 Jupiter
      const jupiter = createJupiterApiClient();

      const quote = await jupiter.quoteGet({
        inputMint: "So11111111111111111111111111111111111111112", // SOL
        outputMint: "7YdwpERJjzw7UVojxLpvu5ycKBRdYaxaKn4HvoHLpump", // 目标代币
        amount: parseFloat(amount) * 1e9,
        slippageBps: 100,
      });

      const swapResult = await jupiter.swapPost({
        swapRequest: {
          quoteResponse: quote,
          userPublicKey: publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
        },
      });

      const { swapTransaction } = swapResult;

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(swapTransaction, "base64")
      );

      const signedTx = await window.solana.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());

      setMessage(`Swap successful! Transaction ID: ${txid}`);

      // 4. 刷新余额
      const solBalance = await connection.getBalance(publicKey);
      setBalance(solBalance / LAMPORTS_PER_SOL);
    } catch (error: any) {
      setMessage(`Swap failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-gray-900/50 border-gray-800 overflow-hidden text-white">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Swap SOL for Life++ Tokens
              </h2>

              {!publicKey ? (
                <div className="text-center py-4">
                  <WalletMultiButton className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg" />
                </div>
              ) : (
                <>
                  <div className="mb-6 text-white">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">My SOL Balance</span>
                      <span className="font-medium text-white">{balance.toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-300">My Life++ Balance</span>
                      <span className="font-medium text-white">{tokenBalance.toFixed(0)} Life++</span>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between mb-1">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                          From
                        </label>
                        <span className="text-sm text-gray-400">Available: {balance.toFixed(4)} SOL</span>
                      </div>
                      <div className="flex items-center">
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="bg-transparent border-none text-white focus-visible:ring-purple-500 focus-visible:ring-offset-0"
                          min="0.1"
                          step="0.1"
                          placeholder="Enter SOL amount"
                        />
                        <div className="flex items-center gap-2 ml-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">S</span>
                          </div>
                          <span className="font-medium text-white">SOL</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                      <div className="bg-gray-900 p-2 rounded-full border border-gray-700">
                        <ArrowDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 mt-2 mb-4">
                      <div className="flex justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-300">To (estimated)</label>
                      </div>
                      <div className="flex items-center">
                        <Input
                          readOnly
                          value={(Number.parseFloat(amount) || 0) * 1000}
                          className="bg-transparent border-none text-white focus-visible:ring-0"
                          placeholder="0"
                        />
                        <div className="flex items-center gap-2 ml-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">L++</span>
                          </div>
                          <span className="font-medium text-white">Life++</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>Exchange Rate</span>
                        <span>1 SOL = 1,000 Life++</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network Fee</span>
                        <span>~0.000005 SOL</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSwap}
                    disabled={isLoading}
                    className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Swap Now"
                    )}
                  </Button>

                  {message && (
                    <div
                      className={`mt-4 p-3 rounded-lg overflow-hidden ${
                        message.includes("failed")
                          ? "bg-red-900/20 text-red-400 border border-red-900/50"
                          : "bg-green-900/20 text-green-400 border border-green-900/50"
                      }`}
                    >
                      {message}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SolanaSwapComponent;
