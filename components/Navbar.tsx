"use client"

import { useState } from "react"
import { Menu, ShoppingCart, Search, User } from "lucide-react"
import { categories } from "../data/mockData"
import Image from "next/image"

interface NavbarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export default function Navbar({ activeCategory, onCategoryChange }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/">
              <Image
                src="/logo-DSEV.png"
                alt="DV.ES logo"
                width={90}
                height={30}
                className="object-contain"
                priority
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => onCategoryChange(category.key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeCategory === category.key
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted hover:text-primary"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-foreground hover:bg-muted hover:text-accent-foreground transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => {
                    onCategoryChange(category.key)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    activeCategory === category.key
                      ? "bg-primary text-primary-foreground"
                      : "text-card-foreground hover:bg-muted hover:text-accent-foreground"
                  }`}
                >
                  {category.label}
                </button>
              ))}

              {/* Mobile icons */}
              <div className="flex items-center space-x-4 px-3 py-2 border-t border-border mt-4">
                <button className="p-2 rounded-md text-card-foreground hover:bg-muted hover:text-accent-foreground transition-colors">
                  <Search className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-md text-card-foreground hover:bg-muted hover:text-accent-foreground transition-colors">
                  <User className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-md text-card-foreground hover:bg-muted hover:text-accent-foreground transition-colors relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
