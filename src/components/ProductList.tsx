'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProductList() {
  const [products, setProducts] = useState([
    { id: 1, name: 'iPhone 12', price: 699 },
    { id: 2, name: 'iPhone 11', price: 599 },
    { id: 3, name: 'iPhone XR', price: 499 },
  ])

  const [newProduct, setNewProduct] = useState({ name: '', price: '' })

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (newProduct.name && newProduct.price) {
      setProducts([...products, { id: Date.now(), name: newProduct.name, price: Number(newProduct.price) }])
      setNewProduct({ name: '', price: '' })
    }
  }

  return (
    <div>
      <ul className="space-y-2 mb-4">
        {products.map((product) => (
          <li key={product.id} className="bg-white p-2 rounded shadow">
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
      <form onSubmit={addProduct} className="space-y-2">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
          />
        </div>
        <Button type="submit">Add Product</Button>
      </form>
    </div>
  )
}