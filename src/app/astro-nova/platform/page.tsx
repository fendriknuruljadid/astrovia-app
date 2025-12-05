"use client"

import { GalleryVerticalEnd } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Platform } from "./platform"
import Image from "next/image"
import { motion } from "framer-motion"

export default function PlatformPage() {
   return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-screen">
      {/* Bagian Atas (Mobile) / Kiri (Desktop) */}
      <div className="bg-blue-50 relative w-full flex flex-col items-center justify-center p-6 lg:p-0">
        {/* Konten Gambar dan Tulisan */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <Image
            src="/login.svg"
            alt="Hero Image"
            width={300}
            height={200}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Selamat Datang di <span className="text-blue-600">Astrovia AI</span>
          </h1>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Platform cerdas untuk mengelola sosial media kamu secara efisien 🚀
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Mulai Sekarang
          </Button>
        </motion.div>
      </div>

      {/* Bagian Bawah (Mobile) / Kanan (Desktop) */}
      <div className="flex flex-col h-auto lg:h-screen overflow-y-auto p-6 md:p-10">
        {/* Logo / Header */}
        <div className="flex justify-center gap-2 md:justify-center mb-6">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Astrovia AI.
          </a>
        </div>

        {/* Konten Scrollable */}
        <div className="flex flex-1 items-start justify-center">
          <div className="w-full max-w-lg">
            <Platform />
          </div>
        </div>
      </div>
    </div>
  )
}
