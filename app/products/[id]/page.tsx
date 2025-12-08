"use client"

import ProductDetail from "@/components/ProductDetail"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { useState } from "react"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const id = params?.id
    const [activeCategory, setActiveCategory] = useState("new")
    return (
        <div>
            <Navbar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            <ProductDetail productId={id} />
            <Footer />
        </div>
    )

}
