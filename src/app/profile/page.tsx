import ProfileHeader from "@/components/profile-header"
import TransactionHistory from "@/components/transaction-history"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white pt-20">
      <ProfileHeader />
      <div className="container mx-auto px-4 py-8">
        <TransactionHistory />
      </div>
    </main>
  )
}
