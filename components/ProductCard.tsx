"use client"
import { ShoppingCart, Heart } from "lucide-react"
import Link from "next/link"
import type { Product } from "../data/mockData"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Debug: log image src used
  if (typeof window !== 'undefined') {
    console.log('ProductCard image src:', product.images?.[0] || "/placeholder.svg")
  }
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <Link href={`/products/${product.id}`} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group block">
      <div className="relative overflow-hidden bg-muted aspect-square">
        {/* Placeholder khi chưa có ảnh thật */}
        {product.images[0] === "/placeholder.svg" ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl text-muted-foreground/30">Photo</span>
          </div>
        ) : (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-contain bg-white p-4 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}

        <button className="absolute top-3 right-3 rounded-full bg-white/80 p-2 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
          <Heart className="h-5 w-5 text-muted-foreground hover:text-red-500 transition-colors" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 font-small"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
