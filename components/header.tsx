"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import WalletConnect from "./wallet-connect";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WalletConnectButton = () => {
  return (
    <WalletMultiButton className="wallet-button">
      Connect Wallet
    </WalletMultiButton>
  );
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/placeholder.svg?height=40&width=40"
            alt="Life++ Logo"
            width={40}
            height={40}
            className="rounded-full bg-purple-600"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Life++
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-gray-300 hover:text-white transition"
          >
            Features
          </Link>
          <Link
            href="#about"
            className="text-gray-300 hover:text-white transition"
          >
            About
          </Link>
          <Link
            href="#faq"
            className="text-gray-300 hover:text-white transition"
          >
            FAQ
          </Link>
        </nav>

        <WalletConnectButton />
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-gray-800">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="#features"
              className="text-gray-300 hover:text-white py-2 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-gray-300 hover:text-white py-2 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="#faq"
              className="text-gray-300 hover:text-white py-2 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="pt-2">
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
