export interface Product {
  id: number
  name: string
  price: number
  images: string[]
  category: string
  description?: string
}

export const mockProducts: Product[] = [
  // Hàng mới
  {
    id: 1,
    name: "Giày Nike Air Max 2024",
    price: 2500000,
    images: ["/nike-air-max-running-shoes-white-and-purple.jpg"],
    category: "new",
    description: "Giày chạy bộ mới nhất với công nghệ Air Max",
  },
  {
    id: 2,
    name: "Áo thun Adidas Performance",
    price: 850000,
    images: ["/adidas-performance-t-shirt-black-athletic-wear.jpg"],
    category: "new",
    description: "Áo thun thể thao cao cấp",
  },
  {
    id: 3,
    name: "Quần short Nike Dri-FIT",
    price: 750000,
    images: ["/nike-dri-fit-shorts-gray-athletic-wear.jpg"],
    category: "new",
    description: "Quần short thể thao thoáng mát",
  },

  // Nam
  {
    id: 4,
    name: "Áo khoác Nike Windrunner",
    price: 1800000,
    images: ["/nike-windrunner-jacket-men-black-and-white.jpg"],
    category: "men",
    description: "Áo khoác gió nam phong cách",
  },
  {
    id: 5,
    name: "Quần jogger Adidas",
    price: 1200000,
    images: ["/adidas-jogger-pants-men-navy-blue-athletic.jpg"],
    category: "men",
    description: "Quần jogger thể thao nam",
  },
  {
    id: 6,
    name: "Giày Puma RS-X",
    price: 2200000,
    images: ["/puma-rs-x-sneakers-men-white-and-blue.jpg"],
    category: "men",
    description: "Giày sneaker nam thời trang",
  },

  // Nữ
  {
    id: 7,
    name: "Áo bra thể thao Nike",
    price: 950000,
    images: ["/nike-sports-bra-women-purple-athletic-wear.jpg"],
    category: "women",
    description: "Áo bra thể thao nữ hỗ trợ tốt",
  },
  {
    id: 8,
    name: "Legging Adidas Alphaskin",
    price: 1100000,
    images: ["/adidas-alphaskin-leggings-women-black-athletic.jpg"],
    category: "women",
    description: "Quần legging thể thao nữ co giãn",
  },
  {
    id: 9,
    name: "Giày Nike Air Zoom Pegasus",
    price: 2800000,
    images: ["/nike-air-zoom-pegasus-women-pink-running-shoes.jpg"],
    category: "women",
    description: "Giày chạy bộ nữ chuyên nghiệp",
  },

  // Trẻ em
  {
    id: 10,
    name: "Giày Nike Revolution Kids",
    price: 1500000,
    images: ["/nike-revolution-kids-shoes-colorful-children-athle.jpg"],
    category: "kids",
    description: "Giày thể thao trẻ em đa màu",
  },
  {
    id: 11,
    name: "Áo thun Adidas Kids",
    price: 650000,
    images: ["/adidas-kids-t-shirt-blue-children-sportswear.jpg"],
    category: "kids",
    description: "Áo thun thể thao trẻ em",
  },
  {
    id: 12,
    name: "Quần short Puma Kids",
    price: 550000,
    images: ["/puma-kids-shorts-red-children-athletic-wear.jpg"],
    category: "kids",
    description: "Quần short thể thao trẻ em",
  },

  // Phụ kiện
  {
    id: 13,
    name: "Balo Nike Brasilia",
    price: 1200000,
    images: ["/nike-brasilia-backpack-black-sports-bag.jpg"],
    category: "accessories",
    description: "Balo thể thao đa năng",
  },
  {
    id: 14,
    name: "Mũ lưỡi trai Adidas",
    price: 450000,
    images: ["/adidas-baseball-cap-white-sports-hat.jpg"],
    category: "accessories",
    description: "Mũ lưỡi trai thể thao",
  },
  {
    id: 15,
    name: "Găng tay tập gym",
    price: 350000,
    images: ["/gym-gloves-black-fitness-training-equipment.jpg"],
    category: "accessories",
    description: "Găng tay tập gym chuyên nghiệp",
  },

  // Thể thao
  {
    id: 16,
    name: "Bóng đá Nike Premier",
    price: 800000,
    images: ["/nike-soccer-ball-white-black.jpg"],
    category: "sports",
    description: "Bóng đá chính thức Nike",
  },
  {
    id: 17,
    name: "Vợt cầu lông Yonex",
    price: 2500000,
    images: ["/yonex-badminton-racket-professional.jpg"],
    category: "sports",
    description: "Vợt cầu lông chuyên nghiệp",
  },
  {
    id: 18,
    name: "Bóng rổ Spalding",
    price: 1200000,
    images: ["/spalding-basketball-orange-official.jpg"],
    category: "sports",
    description: "Bóng rổ chính thức Spalding",
  },
]

export const categories = [
  { key: "new", label: "Hàng mới", icon: "🆕" },
  { key: "men", label: "Nam", icon: "👨" },
  { key: "women", label: "Nữ", icon: "👩" },
  { key: "kids", label: "Trẻ em", icon: "👶" },
  { key: "accessories", label: "Phụ kiện", icon: "🎒" },
  { key: "sports", label: "Thể Thao", icon: "⚽" },
]

export const bannerSlides = [
  {
    id: 1,
    title: "Bộ sưu tập mùa hè 2024",
    subtitle: "Khám phá những xu hướng thời trang thể thao mới nhất",
    image: "/placeholder.svg?height=500&width=1200",
    cta: "Mua ngay",
  },
  {
    id: 2,
    title: "Giảm giá lên đến 50%",
    subtitle: "Cơ hội sở hữu những sản phẩm yêu thích với giá tốt nhất",
    image: "/placeholder.svg?height=500&width=1200",
    cta: "Xem ưu đãi",
  },
  {
    id: 3,
    title: "Thể thao chuyên nghiệp",
    subtitle: "Trang thiết bị thể thao cao cấp cho mọi môn thể thao",
    image: "/placeholder.svg?height=500&width=1200",
    cta: "Khám phá",
  },
]
