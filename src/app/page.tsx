import Link from 'next/link'
import { Button } from "@/components/ui/button"
import WhatsAppInterface from "../components/WhatsAppInterface"
import { DashboardLayout } from "../components/DashboardLayout"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">WhatsApp Chatbot Dashboard</h1>
      <div className="flex space-x-4">
        <WhatsAppInterface />
        {/* <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
        <Link href="/products">
          <Button>Products</Button>
        </Link>
        <Link href="/conference">
          <Button>Conference</Button>
        </Link> */}
      </div>
      {/* <DashboardLayout /> */}
    </main>
  )
}