"use client"

import { motion } from "framer-motion"
import { RocketIcon, SparklesIcon, StarIcon, CheckCircle2Icon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="pb-[80px] flex w-full max-w-full flex-col gap-6">
      {/* Ucapan Selamat Datang */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">👋 Selamat Datang di Astro Center</h1>
        <p className="text-base opacity-90">
          Pilih agen AI favoritmu dan mulai petualangan cerdas bersama Astro Agent!
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agent" className="w-full">
        <TabsList>
          <TabsTrigger value="agent">Astro Agent</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Pembayaran</TabsTrigger>
        </TabsList>

        {/* Tab Agent */}
        <TabsContent value="agent">
          <Card>
            <CardHeader>
              <CardTitle>Pilih Agen AI</CardTitle>
              <CardDescription>
                Temui para agen cerdas Astro yang siap membantu kamu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Astro Nova */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Card className="relative cursor-pointer hover:shadow-xl transition">
                    {/* Label Favorit */}
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white rounded-full p-1 shadow-md">
                      <StarIcon className="w-4 h-4" />
                    </div>

                    <CardHeader className="items-center text-center">
                      <Image
                        src="/astro.png"
                        alt="Astro Nova"
                        width={80}
                        height={80}
                        className="mx-auto mb-2"
                      />
                      <div className="flex justify-center items-center gap-2">
                        <CardTitle>Astro Nova</CardTitle>
                        <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                      </div>
                      <CardDescription>
                        Agen AI penuh semangat dengan kemampuan eksplorasi tinggi 🚀
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full mt-2">Pilih Agen</Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Astro Zenith */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Card className="relative cursor-pointer hover:shadow-xl transition">
                    {/* Label Favorit */}
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white rounded-full p-1 shadow-md">
                      <StarIcon className="w-4 h-4" />
                    </div>

                    <CardHeader className="items-center text-center">
                      <Image
                        src="/astro.png"
                        alt="Astro Zenith"
                        width={80}
                        height={80}
                        className="mx-auto mb-2"
                      />
                      <div className="flex justify-center items-center gap-2">
                        <CardTitle>Astro Zenith</CardTitle>
                        <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                      </div>
                      <CardDescription>
                        Agen AI bijak dan tenang, cocok untuk solusi mendalam ✨
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full mt-2" variant="secondary">
                        Pilih Agen
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
               
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Riwayat */}
        <TabsContent value="riwayat">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pembayaran</CardTitle>
              <CardDescription>
                Lihat semua transaksi dan langganan kamu di sini.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <p className="text-muted-foreground text-sm">
                Belum ada riwayat pembayaran.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
