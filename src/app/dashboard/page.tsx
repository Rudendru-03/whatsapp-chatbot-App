import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Recent Activities</h2>
          <p>No recent activities</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
          <div className="flex space-x-2">
            <Link href="/products">
              <Button>Manage Products</Button>
            </Link>
            <Link href="/conference">
              <Button>Manage Conferences</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}