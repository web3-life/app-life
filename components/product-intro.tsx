import { CheckCircle2, Coins, Users, Brain, Zap, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function ProductIntro() {
  return (
    <section className="py-16 bg-black/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Unlimited Possibilities of Digital Avatars
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Life++ allows you to create, own, and trade unique AI agents, opening a new era of digital identity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl p-8 border border-purple-500/20">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Coins className="mr-3 h-6 w-6 text-purple-400" />
              <span>Economic Benefits</span>
            </h3>
            <ul className="space-y-4">
              {[
                "Trade your digital avatar as NFTs on Solana",
                "Increase the value of your digital avatar through customization and upgrades",
                "Earn passive income by participating in the Life++ ecosystem",
                "Create rare digital avatars for higher returns",
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-pink-900/20 to-black rounded-2xl p-8 border border-pink-500/20">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Users className="mr-3 h-6 w-6 text-pink-400" />
              <span>Social Value</span>
            </h3>
            <ul className="space-y-4">
              {[
                "Create a digital legacy that permanently preserves your personality and memories",
                "Share your unique digital avatar with users around the world",
                "Participate in building a decentralized digital identity ecosystem",
                "Explore cutting-edge applications of artificial intelligence and blockchain technology",
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Brain className="h-10 w-10 text-purple-400" />,
              title: "AI Powered",
              description:
                "Use advanced artificial intelligence technology to create intelligent digital avatars with your personality traits",
            },
            {
              icon: <Shield className="h-10 w-10 text-pink-400" />,
              title: "Blockchain Security",
              description:
                "Based on Solana blockchain technology, ensuring your digital assets are secure, transparent, and tamper-proof",
            },
            {
              icon: <Zap className="h-10 w-10 text-yellow-400" />,
              title: "Unlimited Creation",
              description: "Freely customize and upgrade your digital avatar to create a unique digital image",
            },
          ].map((feature, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
