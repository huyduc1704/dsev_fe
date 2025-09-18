"use client"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "Youtube" },
  ]

  const footerSections = [
    {
      title: "Sản phẩm",
      links: [
        { name: "Hàng mới", href: "#" },
        { name: "Nam", href: "#" },
        { name: "Nữ", href: "#" },
        { name: "Trẻ em", href: "#" },
        { name: "Phụ kiện", href: "#" },
        { name: "Thể thao", href: "#" },
      ],
    },
    {
      title: "Hỗ trợ",
      links: [
        { name: "Liên hệ", href: "#" },
        { name: "Hướng dẫn mua hàng", href: "#" },
        { name: "Chính sách đổi trả", href: "#" },
        { name: "Bảo hành", href: "#" },
        { name: "FAQ", href: "#" },
      ],
    },
    {
      title: "Công ty",
      links: [
        { name: "Về chúng tôi", href: "#" },
        { name: "Tuyển dụng", href: "#" },
        { name: "Tin tức", href: "#" },
        { name: "Đối tác", href: "#" },
        { name: "Chính sách bảo mật", href: "#" },
      ],
    },
  ]

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-4">SportStyle</h3>
            <p className="text-background/80 mb-6 text-pretty">
              Điểm đến tin cậy cho những người yêu thích thời trang thể thao. Chúng tôi cam kết mang đến sản phẩm chất
              lượng cao với giá cả hợp lý.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-background/80">123 Đường Nguyễn Văn Cừ, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-background/80">0123 456 789</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-background/80">info@sportstyle.vn</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-background/80 hover:text-primary transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links & Newsletter */}
        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-background/80">Theo dõi chúng tôi:</span>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="p-2 bg-background/10 hover:bg-primary rounded-lg transition-colors duration-200"
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-background/80">Đăng ký nhận tin:</span>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="px-3 py-2 bg-background/10 border border-background/20 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-r-lg text-sm font-medium transition-colors duration-200">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-background/20 mt-8 pt-6 text-center">
          <p className="text-sm text-background/60">© 2024 SportStyle. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
