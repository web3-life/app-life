"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Banner() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    // This should be the actual login status check logic
    const checkLoginStatus = () => {
      // Simulate checking login status
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
  }, []);

  const handleStartClick = () => {
    if (isLoggedIn) {
      // If logged in, redirect to chat page
      router.push("/chat");
    } else {
      // If not logged in, redirect to login page
      router.push("/login");
      // Or open login modal
    }
  };

  return (
    <section className="pt-24 bg-black pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="w-full md:w-1/2 space-y-6">
            <div className="inline-block px-4 py-1.5 bg-purple-900/30 rounded-full text-purple-400 text-sm font-medium mb-2">
              <span className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Trade Your Digital Avatars on Solana
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent">
                Build Your Digital Avatar
              </span>
              <br />
              and Trade on Blockchain
            </h1>

            <p className="text-lg text-gray-300 md:pr-12">
              Turn your personality, memories, and image into AI agents, and
              own, customize, and trade them as NFTs on Solana.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleStartClick}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-purple-500 text-purple-400 hover:bg-purple-950/20 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md aspect-square">
              {/* AI Agent Image */}
              <div className="absolute w-full h-full flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="AI Agent Avatar"
                  width={500}
                  height={500}
                  className="rounded-2xl object-cover border-2 border-purple-500/30 shadow-lg shadow-purple-500/20"
                />
              </div>

              {/* Floating AI elements */}
              <div className="absolute top-10 -left-10 bg-purple-600/20 backdrop-blur-sm p-3 rounded-full border border-purple-500/30 animate-pulse">
                <Image
                  src="/placeholder.svg?height=60&width=60"
                  alt="AI Element"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              </div>

              <div className="absolute top-1/4 -right-8 bg-pink-600/20 backdrop-blur-sm p-2 rounded-full border border-pink-500/30 animate-bounce">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  alt="AI Element"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>

              <div className="absolute -bottom-6 -right-6 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-purple-500/30">
                <p className="text-sm font-medium text-purple-400">
                  Popular Avatars
                </p>
                <p className="text-lg font-bold">1,234 Sold</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
