import AgentUploadForm from "@/components/agent-upload-form"
import Header from "@/components/header"

export default function CreateAgentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white pt-20 pb-16">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Create Your Digital Avatar
          </h1>
          <p className="text-gray-400 mb-8">
            Design your AI agent by providing the details below. Your digital avatar will inherit these characteristics.
          </p>

          <AgentUploadForm />
        </div>
      </div>
    </main>
  )
}
