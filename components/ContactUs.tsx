"use client"

import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export default function ContactUs() {
  const socials = [
    { icon: Facebook, href: "https://www.facebook.com/dvesport", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/dvesport", label: "Instagram" },
    { icon: Twitter, href: "https://www.twitter.com/dvesport", label: "Twitter" },
    { icon: Youtube, href: "https://www.youtube.com/dvesport", label: "Youtube" },
  ]

  return (
    // Section uses same container width as other sections (max-w-7xl)
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[50px] pb-6">
      <div className="w-full bg-background rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 relative z-20">
        <div className="flex-1 text-left">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">LUÔN LUÔN LẮNG NGHE</h3>
          <p className="text-xl font-semibold text-foreground mb-4">LIÊN HỆ</p>

          <p className="text-sm text-muted-foreground mb-4">
            GMAIL: <span className="font-semibold text-foreground">DV.ESPORT@GMAIL.COM</span>
          </p>

          <div className="flex items-center gap-3">
            {socials.map((s, i) => {
              const Icon = s.icon
              return (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="p-2 bg-background/10 hover:bg-primary rounded-lg transition-colors duration-200"
                >
                  <Icon className="h-5 w-5 text-foreground" />
                </a>
              )
            })}
          </div>
        </div>

        <div className="w-full md:w-1/3 flex-shrink-0">
          <img src="/contact-us.png" alt="Contact illustration" className="w-full h-auto object-contain" />
        </div>
      </div>
    </section>
  )
}