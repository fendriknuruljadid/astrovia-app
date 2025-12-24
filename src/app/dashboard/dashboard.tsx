"use client"

import { motion } from "framer-motion"
import { RocketIcon, SparklesIcon, StarIcon, CheckCircle2Icon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/app/components/ui/button"
import { ApiResponse } from "@/types/api";
import { useEffect, useState } from "react"
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
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"


interface Agent {
  id: string
  name: string
  description: string
  logo: string
  url: string
  has_access: boolean
  expired: boolean
  expired_at: string | null
}



const AgentSkeleton = () => (
  <Card className="dark:bg-gray-800 animate-pulse">
    <CardHeader className="items-center text-center gap-3">
      <div className="h-20 w-20 rounded-full bg-gray-300 dark:bg-gray-700" />
      <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
    </CardHeader>
    <CardContent>
      <div className="h-9 w-full bg-gray-300 dark:bg-gray-700 rounded" />
    </CardContent>
  </Card>
)


export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/proxy/agents")
      console.log(res);
      const json: ApiResponse<Agent[]> = await res.json()
      console.log(json);
      
      if (!json.status) throw new Error(json.message)
    
      setAgents(json.data ?? [])
           
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && agents.length > 0) {
      const accessMap = agents.reduce((acc, agent) => {
        acc[agent.url] = {
          has_access: agent.has_access,
          expired: agent.expired,
        }
        return acc
      }, {} as Record<string, { has_access: boolean; expired: boolean }>)
  
      const prev = document.cookie
        .split("; ")
        .find(c => c.startsWith("agent_access="))

      if (!prev || decodeURIComponent(prev.split("=")[1]) !== JSON.stringify(accessMap)) {
        document.cookie = `agent_access=${encodeURIComponent(
          JSON.stringify(accessMap)
        )}; path=/; max-age=300`
      }
    }
  }, [loading, agents])
  
  useEffect(() => {
    fetchAgents()
  }, [])
  

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
          <TabsTrigger value="agent" className="cursor-pointer">Astro Agent</TabsTrigger>
          <TabsTrigger value="riwayat" className="cursor-pointer">Riwayat Pembayaran</TabsTrigger>
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
              {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {Array.from({ length: 4 }).map((_, i) => (
                   <AgentSkeleton key={i} />
                 ))}
               </div>
              ) : agents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada agen tersedia</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {agents.map((agent) => (
                    <motion.div
                      key={agent.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="dark:bg-gray-800 relative hover:shadow-xl transition">
                        {/* Badge akses */}
                        {agent.has_access && !agent.expired && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-md">
                            <CheckCircle2Icon className="w-4 h-4" />
                          </div>
                        )}

                        <CardHeader className="items-center text-center">
                          <Image
                            src={agent.logo}
                            alt={agent.name}
                            width={80}
                            height={80}
                            className="mx-auto mb-2"
                          />

                          <CardTitle>{agent.name}</CardTitle>

                          <CardDescription className="text-sm line-clamp-3">
                            {agent.description}
                          </CardDescription>
                          {/* Badge Status */}
                          {agent.has_access && !agent.expired && (
                            <span className="absolute top-2 left-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                              Active
                            </span>
                          )}

                          {agent.has_access && agent.expired && (
                            <span className="absolute top-2 left-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                              Expired
                            </span>
                          )}

                          {!agent.has_access && (
                            <span className="absolute top-2 left-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                              Activate Now
                            </span>
                          )}

                        </CardHeader>

                        <CardContent className="flex flex-col gap-2">
                          {/* Tombol utama */}
                          {agent.has_access ? (
                            <Button asChild className="w-full bg-green-800">
                              <Link href={`/${agent.url}`}>
                                Buka Agen
                              </Link>
                            </Button>
                          ) : (
                            <Button asChild className="w-full">
                              <Link href={`/subscribe/${agent.id}`}>
                                Berlangganan
                              </Link>
                            </Button>
                          )}

                          {/* Tombol Detail */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full cursor-pointer">
                                Detail
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                  <Image
                                    src={agent.logo}
                                    alt={agent.name}
                                    width={40}
                                    height={40}
                                  />
                                  {agent.name}
                                </DialogTitle>

                                <DialogDescription className="mt-4 whitespace-pre-line text-sm">
                                  {agent.description}
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </CardContent>


                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
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
