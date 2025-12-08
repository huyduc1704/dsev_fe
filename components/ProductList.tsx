"use client"

import { useState, useMemo, useEffect } from "react"
import { Grid, List, Filter } from "lucide-react"
import ProductCard from "./ProductCard"
import { message } from "antd"
import { useCart } from "./cart-context"
import { categories, type Product } from "../data/mockData"

interface ProductListProps {
  activeCategory: string
}

export default function ProductList({ activeCategory }: ProductListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name")
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { refreshCart } = useCart() as any

  useEffect(() => {
    let ignore = false

    const fetchProducts = async () => {
      if (ignore) return

      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/api/products/active", {
          headers: { Accept: "application/json" },
        })
        const body = await res.json().catch(() => ({}))
        const list = (body?.data ?? []) as any[]

        let mapped: Product[] = list.map((p) => {
          const variants = Array.isArray(p?.variants) ? p.variants : []
          const price = variants.length
            ? Math.min(
              ...variants.map((v: { price?: number }) => Number((v && v.price) ?? 0))
            )
            : 0

          const firstImage =
            p.image ||
            (Array.isArray(p.images) && p.images[0]) ||
            "/placeholder.svg"

          return {
            id: p?.id ?? "",
            name: p?.name ?? "",
            description: p?.description ?? "",
            images: [firstImage],
            price,
            category: activeCategory,
          } as Product
        })

        // Tìm những sản phẩm đang dùng placeholder
        const missing = mapped
          .map((prod, idx) => ({ prod, idx }))
          .filter(({ prod }) => prod.images[0] === "/placeholder.svg")

        if (missing.length > 0) {
          console.log("Enriching", missing.length, "products...")

          const details = await Promise.all(
            missing.map(async ({ prod }) => {
              try {
                const r = await fetch(`/api/products/${encodeURIComponent(prod.id)}`)
                const json = await r.json()
                const detail = json?.data ?? json
                return {
                  id: prod.id,
                  img: Array.isArray(detail?.images) && detail.images[0]
                    ? detail.images[0]
                    : "/placeholder.svg",
                }
              } catch {
                return { id: prod.id, img: "/placeholder.svg" }
              }
            })
          )

          // Tạo mảng mới với ảnh được cập nhật
          const enriched = mapped.map((product) => {
            const found = details.find((d) => d.id === product.id)
            if (found && found.img !== "/placeholder.svg") {
              return { ...product, images: [found.img] }
            }
            return product
          })

          if (!ignore) setFetchedProducts(enriched)
        } else {
          if (!ignore) setFetchedProducts(mapped)
        }
      } catch (e) {
        console.error(e)
        if (!ignore) setError("Không tải được sản phẩm")
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchProducts()

    return () => {
      ignore = true
    }
  }, [activeCategory])

  const filteredProducts = useMemo(() => {
    let products = [...fetchedProducts]
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
  }, [fetchedProducts, sortBy])

  const currentCategory = categories.find((cat) => cat.key === activeCategory)

  const handleAddToCart = async (product: Product) => {
    try {
      // Fetch product detail to get a variant id
      const detailRes = await fetch(`/api/products/${encodeURIComponent(product.id)}`, { headers: { Accept: "application/json" } })
      const detailBody = await detailRes.json().catch(() => ({}))
      const data = detailBody?.data ?? detailBody
      const variants: any[] = Array.isArray(data?.variants) ? data.variants : []
      const variant = variants[0]
      if (!variant?.id) {
        message.warning("Sản phẩm này chưa có biến thể để thêm vào giỏ hàng")
        return
      }
      const token = typeof window !== "undefined" ? (localStorage.getItem("auth-token") || localStorage.getItem("access_token") || localStorage.getItem("token")) : undefined
      const res = await fetch("/api/me/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ productVariantId: variant.id, quantity: 1 }),
      })
      if (res.ok) {
        const body = await res.json().catch(() => ({}))
        // Treat HTTP 200 as success even if body.success is false due to backend bug
        message.success(body?.message || `Đã thêm "${product.name}" vào giỏ hàng!`)
        // Refresh cart badge without opening drawer
        await refreshCart()
      } else if (res.status === 401 || res.status === 403) {
        message.error("Bạn phải đăng nhập để thêm sản phẩm vào giỏ hàng")
      } else {
        const body = await res.json().catch(() => ({}))
        message.error(body?.message || "Thêm vào giỏ hàng thất bại")
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi thêm vào giỏ hàng")
    }
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
            className={`p-2 rounded-md transition-colors ${viewMode === "grid"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${viewMode === "list"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Đang tải sản phẩm…</h3>
          <p className="text-muted-foreground">Vui lòng đợi trong giây lát.</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Lỗi khi tải sản phẩm</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
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
