"use client"
import { Award, Truck, Shield, Headphones } from "lucide-react"

export default function BrandIntro() {
  const features = [
    {
      icon: Award,
      title: "Chất lượng cao cấp",
      description: "Sản phẩm chính hãng từ các thương hiệu hàng đầu thế giới",
    },
    {
      icon: Truck,
      title: "Giao hàng nhanh",
      description: "Miễn phí giao hàng cho đơn hàng trên 1.000.000đ",
    },
    {
      icon: Shield,
      title: "Bảo hành uy tín",
      description: "Chế độ bảo hành và đổi trả linh hoạt trong 30 ngày",
    },
    {
      icon: Headphones,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ tư vấn chuyên nghiệp luôn sẵn sàng hỗ trợ",
    },
  ]

  return (
    <section className="bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            DSEV - Đồng hành cùng đam mê thể thao
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Chúng tôi mang đến những sản phẩm thời trang thể thao chất lượng cao, giúp bạn thể hiện phong cách và đạt
            được hiệu suất tốt nhất trong mọi hoạt động.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="bg-background rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
