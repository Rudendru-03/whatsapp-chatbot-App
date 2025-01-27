'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ConferenceForm() {
  const [conference, setConference] = useState({ name: '', date: '', location: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Conference details:', conference)
    // Here you would typically send this data to your backend
    setConference({ name: '', date: '', location: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Conference Name</Label>
        <Input
          id="name"
          value={conference.name}
          onChange={(e) => setConference({ ...conference, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={conference.date}
          onChange={(e) => setConference({ ...conference, date: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={conference.location}
          onChange={(e) => setConference({ ...conference, location: e.target.value })}
          required
        />
      </div>
      <Button type="submit">Create Conference</Button>
    </form>
  )
}