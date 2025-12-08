"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { bannerSlides } from "../data/mockData"

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
  }

  return (
    <div className="flex justify-center py-8 bg-background">
      <div className="w-4/5 relative h-72 md:h-[480px] overflow-visible rounded-2x1 shadow-x1">
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

        {/* Floating cards (centered, overlapping bottom) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[-48px] z-30 flex gap-6">
          {[
            { img: "/placeholder.svg", title: "Danh mục sản phẩm" },
            { img: "/placeholder.svg", title: "Sản phẩm mới" },
            { img: "/placeholder.svg", title: "Bộ sưu tập mới" },
          ].map((card, i) => (
            <div
              key={i}
              className="w-40 md:w-48 bg-card border border-border rounded-xl p-4 text-center shadow-lg hover:shadow-2xl transition-transform duration-200 transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-md bg-background flex items-center justify-center overflow-hidden">
                <img src={card.img} alt={card.title} className="w-full h-full object-contain" />
              </div>
              <div className="text-sm font-semibold text-foreground">{card.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
