import ProductList from '@/components/ProductList'

export default function Products() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <ProductList />
    </div>
  )
}