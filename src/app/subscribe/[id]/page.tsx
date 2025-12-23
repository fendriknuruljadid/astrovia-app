"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { CheckIcon, ArrowLeftIcon } from "lucide-react"

export default function SubscribePage() {
  // nanti bisa fetch detail agent by slug
  const agent = {
    name: "Astro Zenith",
    description:
      "Agen AI ini akan membantumu meningkatkan produktivitas, mempercepat workflow, dan menghasilkan output lebih optimal.",
    price: "Rp 99.000 / bulan",
    logo: "/agent-placeholder.png", // optional
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center gap-4">
          <Image
            src={agent.logo}
            alt={agent.name}
            width={80}
            height={80}
            className="mx-auto"
          />

          <CardTitle className="text-2xl">
            Berlangganan {agent.name}
          </CardTitle>

          <CardDescription>
            {agent.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefit */}
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              Akses penuh fitur AI
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              Unlimited request
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              Prioritas performa & stabil
            </li>
          </ul>

          {/* Harga */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Harga</p>
            <p className="text-2xl font-bold">{agent.price}</p>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-3">
            <Button className="w-full">
              Lanjutkan Pembayaran
            </Button>

            <Button variant="outline" asChild>
              <Link href="/dashboard" className="flex items-center gap-2 justify-center">
                <ArrowLeftIcon className="w-4 h-4" />
                Kembali ke Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
