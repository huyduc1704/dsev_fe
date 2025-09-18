"use client"

import { useState } from "react"
import Navbar from "../components/Navbar"
import Banner from "../components/Banner"
import ProductList from "../components/ProductList"
import Footer from "../components/Footer"
import BrandIntro from "../components/BrandIntro"

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("new")

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <Banner />
      <BrandIntro />
      <ProductList activeCategory={activeCategory} />
      <Footer />
    </div>
  )
}
