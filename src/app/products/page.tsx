'use client';

import { useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Product {
  id: string;
  title: string;
  description: string;
  websiteLink: string;
  price: number;
  category: string;
  condition: string;
  availability: boolean;
  image: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    title: '',
    description: '',
    websiteLink: '',
    price: 0,
    category: '',
    condition: 'new',
    availability: true,
    image: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newProduct.title) newErrors.title = 'Title is required';
    if (!newProduct.category) newErrors.category = 'Category is required';
    if (newProduct.price <= 0) newErrors.price = 'Price must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/products', {
        ...newProduct,
        price: newProduct.price,
      });

      setProducts([...products, response.data]);

      setNewProduct({
        title: '',
        description: '',
        websiteLink: '',
        price: 0,
        category: '',
        condition: 'new',
        availability: true,
        image: '',
      });
      setIsDialogOpen(false);
    } catch (err) {
      setError('Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Enter product title"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="home">Home & Kitchen</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={newProduct.condition}
                    onValueChange={(value) => setNewProduct(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="refurbished">Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Website Link</Label>
                  <Input
                    placeholder="Enter product URL"
                    value={newProduct.websiteLink}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, websiteLink: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newProduct.availability}
                      onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, availability: checked }))}
                    />
                    <span>{newProduct.availability ? 'Available' : 'Out of Stock'}</span>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter product description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Product Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setNewProduct(prev => ({ ...prev, image: event.target?.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              <Button onClick={handleAddProduct} className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search products by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{product.title}</span>
                    <span className="text-sm text-gray-500">{product.websiteLink}</span>
                  </div>
                </TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.condition}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${product.availability
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {product.availability ? 'Available' : 'Out of Stock'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setProducts(products.filter(p => p.id !== product.id))}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}