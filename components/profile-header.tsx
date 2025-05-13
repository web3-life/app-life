"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfileHeader() {
  const { toast } = useToast()
  const [balance, setBalance] = useState(5000)
  const [walletAddress, setWalletAddress] = useState("8Kvj...F3qZ")

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    toast({
      title: "Copied to clipboard",
      description: "Wallet address has been copied to clipboard",
    })
  }

  return (
    <div className="bg-black/60 border-b border-gray-800 backdrop-blur-md py-8">
      <div className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <Image
              src="/placeholder.svg?height=100&width=100"
              alt="Profile Avatar"
              width={100}
              height={100}
              className="rounded-full border-2 border-purple-500"
            />
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-1">
              <div className="bg-black rounded-full p-1">
                <ExternalLink className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">User Profile</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
              <span>{walletAddress}</span>
              <button onClick={copyToClipboard} className="hover:text-white transition">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-300">Member since May 2025</p>
          </div>

          <Card className="bg-gray-900/50 border-gray-800 w-full md:w-auto">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <p className="text-gray-400 mb-1">Life++ Balance</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-3">
                  {balance.toLocaleString()}
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Add Tokens
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
