"use client"

import { useState, useMemo } from "react"
import { Grid, List, Filter } from "lucide-react"
import ProductCard from "./ProductCard"
import { mockProducts, categories, type Product } from "../data/mockData"

interface ProductListProps {
  activeCategory: string
}

export default function ProductList({ activeCategory }: ProductListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name")

  const filteredProducts = useMemo(() => {
    let products = mockProducts.filter((product) => product.category === activeCategory)

    // Sort products
    switch (sortBy) {
      case "price-low":
        products = products.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        products = products.sort((a, b) => b.price - a.price)
        break
      case "name":
      default:
        products = products.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return products
  }, [activeCategory, sortBy])

  const currentCategory = categories.find((cat) => cat.key === activeCategory)

  const handleAddToCart = (product: Product) => {
    // TODO: Implement cart functionality
    console.log("Added to cart:", product)
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{currentCategory?.icon}</span>
          <h2 className="text-3xl font-bold text-foreground">{currentCategory?.label}</h2>
        </div>
        <p className="text-muted-foreground">
          Khám phá bộ sưu tập {currentCategory?.label.toLowerCase()} với {filteredProducts.length} sản phẩm
        </p>
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="price-low">Giá thấp đến cao</option>
              <option value="price-high">Giá cao đến thấp</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div
          className={`grid gap-6 ${
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          }`}
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-muted-foreground">Hiện tại chưa có sản phẩm nào trong danh mục này.</p>
        </div>
      )}
    </div>
  )
}
