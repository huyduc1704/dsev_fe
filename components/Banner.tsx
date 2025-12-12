"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Package } from "lucide-react"
import { bannerSlides } from "../data/mockData"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Category {
  id: string
  name: string
  description: string
  imageUrl?: string
}

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const res = await fetch("/api/admin/categories", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        })
        if (res.ok) {
          const data = await res.json()
          const categoriesData = data?.data || []
          // Lấy tất cả categories
          setCategories(categoriesData)
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
  }

  return (
    <div className="flex justify-center py-8 bg-background">
      <div className="w-4/5 relative h-72 md:h-[480px] overflow-visible rounded-2xl shadow-xl">
        {/*Slide container*/}
        <div className="relative w-full h-full overflow-hidden rounded-2x1">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 rounded-2xl ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
            >
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat rounded-2xl"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-2xl" />
                <div className="relative h-full flex items-center justify-center text-center text-white px-4">
                  <div className="max-w-4xl">
                    <h2 className="text-2xl md:text-4xl font-bold mb-3 text-balance">{slide.title}</h2>
                    <p className="text-sm md:text-lg mb-6 text-pretty max-w-2xl mx-auto">{slide.subtitle}</p>
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg text-md md:text-lg font-semibold transition-colors duration-200">
                      {slide.cta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-primary p-2 rounded-full transition-all duration-200 z-30"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-primary p-2 rounded-full transition-all duration-200 z-30"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Floating cards (centered, overlapping bottom) - Scrollable */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-48px] z-30 flex justify-center">
          {/* Scroll container */}
          <div
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth hide-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--border)) transparent',
            }}
          >
            {loadingCategories ? (
              // Loading state - hiển thị 3 placeholder cards
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-40 md:w-48 bg-card border border-border rounded-xl p-4 text-center shadow-lg animate-pulse"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-md bg-muted" />
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                </div>
              ))
            ) : categories.length > 0 ? (
              // Hiển thị categories từ API
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    // Navigate to products filtered by category
                    router.push(`/?category=${category.id}`)
                  }}
                  className="flex-shrink-0 w-40 md:w-48 bg-card border border-border rounded-xl p-4 text-center shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer snap-start"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-md bg-background flex items-center justify-center overflow-hidden border border-border relative">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-foreground line-clamp-2">{category.name}</div>
                </button>
              ))
            ) : (
              [
                { img: "/placeholder.svg", title: "Danh mục sản phẩm" },
                { img: "/placeholder.svg", title: "Sản phẩm mới" },
                { img: "/placeholder.svg", title: "Bộ sưu tập mới" },
              ].map((card, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-40 md:w-48 bg-card border border-border rounded-xl p-4 text-center shadow-lg hover:shadow-2xl transition-transform duration-200 transform hover:-translate-y-1 snap-start"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-md bg-background flex items-center justify-center overflow-hidden border border-border">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">{card.title}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
