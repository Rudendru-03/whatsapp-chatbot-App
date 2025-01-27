import ConferenceForm from '@/components/ConferenceForm'

export default function Conference() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Conference Management</h1>
      <ConferenceForm />
    </div>
  )
}