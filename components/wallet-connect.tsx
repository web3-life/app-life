"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export default function WalletConnect() {
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  // Simulate wallet connection functionality
  const connectWallet = async () => {
    try {
      // This should be the actual Solana wallet connection logic
      // Using @solana/wallet-adapter library

      // Simulate successful connection
      setConnected(true)
      setWalletAddress("8Kvj...F3qZ")
    } catch (error) {
      console.error("Failed to connect wallet", error)
    }
  }

  const disconnectWallet = () => {
    setConnected(false)
    setWalletAddress("")
  }

  return (
    <div>
      {!connected ? (
        <Button
          onClick={connectWallet}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={disconnectWallet}
          className="border-purple-500 text-purple-500 hover:bg-purple-950/20"
        >
          {walletAddress}
        </Button>
      )}
    </div>
  )
}
