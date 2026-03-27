"use client"
import React, { useState } from "react";

// Placeholder data structure for saved products
type Product = {
  id: string;
  name: string;
  platform: "Amazon" | "AliExpress";
  price: string;
  category: string;
};

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Earbuds",
    platform: "Amazon",
    price: "$29.99",
    category: "Electronics",
  },
  {
    id: "2",
    name: "LED Makeup Mirror",
    platform: "AliExpress",
    price: "$15.50",
    category: "Beauty & Grooming",
  },
];

export default function SavedPage() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <main className="p-6 animate-fade-in-up">
      <h1 className="text-2xl font-bold mb-4">Saved Products</h1>
      <div className="mb-4 flex gap-2 items-center">
        <label htmlFor="filter" className="font-medium">Contains:</label>
        <input
          id="filter"
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
          placeholder="Enter keyword..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-muted-foreground">No products found.</div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 bg-background/80 cursor-pointer hover:shadow-md"
              onClick={() => setSelected(product)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{product.name}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                  {product.platform}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-1">{product.category}</div>
              <div className="text-sm font-medium">{product.price}</div>
            </div>
          ))
        )}
      </div>
      {/* Product Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] relative animate-fade-in-up">
            <button
              className="absolute top-2 right-2 text-lg font-bold text-muted-foreground hover:text-foreground"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">{selected.name}</h2>
            <div className="mb-2">
              <span className="font-medium">Platform:</span> {selected.platform}
            </div>
            <div className="mb-2">
              <span className="font-medium">Category:</span> {selected.category}
            </div>
            <div className="mb-2">
              <span className="font-medium">Price:</span> {selected.price}
            </div>
            {/* Add more details here as needed */}
          </div>
        </div>
      )}
    </main>
  );
}
