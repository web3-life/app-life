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
      setMessage("请连接钱包并输入金额");
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

      setMessage(`兑换成功！交易ID: ${txid}`);

      // 4. 刷新余额
      const solBalance = await connection.getBalance(publicKey);
      setBalance(solBalance / LAMPORTS_PER_SOL);
    } catch (error: any) {
      setMessage(`兑换失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl text-white font-bold mb-4 dark:text-white">
        SOL 兑换代币
      </h2>

      {!publicKey ? (
        <div className="text-center py-4">
          <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg" />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-white dark:text-gray-300">我的SOL余额</span>
              <span className="font-medium">{balance.toFixed(4)} SOL</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-white dark:text-gray-300">
                我的代币余额
              </span>
              <span className="font-medium">
                {tokenBalance.toFixed(4)} Tokens
              </span>
            </div>

            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium mb-1"
              >
                兑换金额 (SOL)
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="0.1"
                step="0.1"
                placeholder="输入SOL数量"
              />
            </div>
          </div>

          <button
            onClick={handleSwap}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              isLoading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
            } transition-colors`}
          >
            {isLoading ? "处理中..." : "立即兑换"}
          </button>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg overflow-hidden ${
                message.includes("失败")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SolanaSwapComponent;
