"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/app/components/ui/skeleton"
import { AppSidebar } from "@/app/components/layout/app-sidebar-zenith"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb"

import { Separator } from "@/app/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/components/ui/sidebar"
import { Button } from "@/app/components/ui/button"
import { Clock, FileVideo, SquareScissorsIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog"
import { useRouter } from "next/navigation"
/* =========================================================
   TYPES
========================================================= */
type Project = {
  id: string
  video_url: string
  video_title: string
  thumbnail: string
  done: boolean
  created_at: string
  
  video_progress?: ProgressEvent
}

type ProgressEvent = {
  video_id: string
  stage: string
  percent: number
  message: string
}



function ProgressOverlay({ progress }: { progress?: ProgressEvent }) {
  if (!progress) return null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/5">
      <div className="w-4/5 rounded-xl border border-blue-400/50 bg-black/70 p-4 shadow-lg animate-pulse-border">
        <p className="mb-2 text-center text-xs font-medium text-white capitalize">
          {progress.stage.replace("_", " ")}
        </p>

        {/* Progress bar */}
        <div className="relative h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <p className="mt-2 text-center text-xs text-white/80">
          {progress.percent}%
        </p>
      </div>
    </div>
  )
}


function FailedOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm overlay-failed">
      <div className="text-center px-4">
        <div className="mb-2 text-2xl">❌</div>
        <p className="text-sm font-medium text-white">
          Gagal memproses video
        </p>
        {message && (
          <p className="mt-1 text-xs text-white/70 line-clamp-2">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   HELPERS
========================================================= */
function timeAgo(date: string) {
  const diff = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  )

  const days = Math.floor(diff / 86400)
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`

  const hours = Math.floor(diff / 3600)
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`

  const minutes = Math.floor(diff / 60)
  return `${minutes} min ago`
}

function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border p-4 space-y-2">
      {/* thumbnail */}
      <Skeleton className="h-40 md:h-30 lg:h-30  w-full rounded-md" />

      {/* title */}
      <Skeleton className="h-3 w-full" />

      {/* time */}
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

const isYoutubeUrl = (url: string) =>
  /youtube\.com|youtu\.be/.test(url)

/* =========================================================
   PAGE
========================================================= */
export default function Page() {
 
  const router = useRouter()
  const [openProcessingDialog, setOpenProcessingDialog] = useState(false)

  const [projectsLoading, setProjectsLoading] = useState(true)
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [progressMap, setProgressMap] = useState<
    Record<string, ProgressEvent>
  >({})

  const [ytMeta, setYtMeta] = useState<{
    title: string
    thumbnail: string
  } | null>(null)

  const [metaLoading, setMetaLoading] = useState(false)

  const canSubmit =
    (!file && url.length > 0 && isYoutubeUrl(url)) ||
    (!!file && url.length === 0)

  /* ================= FETCH PROJECT ================= */
  const fetchProjects = async () => {
    try {
      setProjectsLoading(true)

      const res = await fetch("/api/proxy/astro-zenith/auto-clip")
      const json = await res.json()

      if (json?.status) {
        const data: Project[] = json.data
        setProjects(json.data)
        const initialProgress: Record<string, ProgressEvent> = {}

        data.forEach((p) => {
          if (!p.done && p.video_progress) {
            initialProgress[p.id] = {
              video_id: p.id,
              stage: p.video_progress.stage,
              percent: p.video_progress.percent,
              message: p.video_progress.message,
            }
          }
        })

        setProgressMap(initialProgress)
      }
    } catch {
      // silent
    } finally {
      setProjectsLoading(false)
    }
  }
  const handleProjectClick = (project: Project) => {
    if (project.done) {
      router.push(`/astro-zenith/auto-clip/${project.id}`)
    } else {
      setOpenProcessingDialog(true)
    }
  }
    
  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    projects.forEach((p) => {
      if (!p.done && !progressMap[p.id]) {
        subscribeProgress(p.id)
      }
    })
  }, [projects])

  const subscribeProgress = (videoId: string) => {
    const ws = new WebSocket(
      `wss://ws-zenith.astrovia.id/ws/progress?video_id=${videoId}`
      // `ws://astrovia_astro-zenith:2003/ws/progress?video_id=${videoId}`
        // `ws://localhost:2003/ws/progress?video_id=${videoId}`
    )
  
    ws.onmessage = async (e) => {
      const data: ProgressEvent = JSON.parse(e.data)
  
      setProgressMap((prev) => ({
        ...prev,
        [data.video_id]: data,
      }))
  
      // DONE / 100%
      if (data.percent >= 100 || data.stage === "done") {
        ws.close()
  
        // refresh project list → project.done jadi true
        await fetchProjects()
  
        // optional: hapus progress dari map
        setProgressMap((prev) => {
          const copy = { ...prev }
          delete copy[data.video_id]
          return copy
        })
      }
    }
  
    ws.onclose = () => {
      console.log("WS closed", videoId)
    }
  
    ws.onerror = () => {
      console.log("WS error", videoId)
      ws.close()
    }
  }
  const stats = [
    {
      label: "Total Video",
      value: 0,
      icon: FileVideo,
    },
    {
      label: "Menit Generate",
      value: 0,
      icon: Clock,
    },
    {
      label: "Total Shorts",
      value: 0,
      icon: SquareScissorsIcon,
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* ================= HEADER ================= */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-8 p-6">
          {/* ===== STATS ===== */}
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <div
                  key={stat.label}
                  className="
                    rounded-xl border bg-card p-5
                    transition
                    hover:-translate-y-0.5 hover:shadow-sm
                  "
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>

                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <p className="mt-2 text-3xl font-semibold">
                    {stat.value}
                  </p>
                </div>
              )
            })}
          </div>

          {/* ================= PROJECT LIST ================= */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Project Video</h2>

            <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
            {projectsLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
             {!projectsLoading && projects.map((project) => {
                const progress = progressMap[project.id]
                const isFailed = progress?.stage === "failed"

                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="cursor-pointer rounded-xl border p-4"
                  >
                    {/* THUMBNAIL WRAPPER */}
                    <div className="relative overflow-hidden rounded-md">
                      <img
                        // src={project.thumbnail}
                        src={project.thumbnail || "/placeholder.png"}
                        alt={project.video_title}
                        className="h-50 md:h-40 lg:h-30 w-full object-cover rounded-md"
                      />
                      {/* PROGRESS OVERLAY (HANYA GAMBAR) */}
                      {!project.done &&
                        progress &&
                        progress.percent < 100 &&
                        progress.stage !== "done" &&
                        progress.stage !== "failed" && (
                          <ProgressOverlay progress={progress} />
                        )}

                      {/* FAILED OVERLAY (HANYA GAMBAR) */}
                      {!project.done && isFailed && (
                        <FailedOverlay message={progress?.message} />
                      )}
                    </div>

                    {/* INFO (TIDAK KETUTUP) */}
                    <p className="mt-2 text-xs text-muted-foreground truncate">
                      {project.video_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {timeAgo(project.created_at)}
                    </p>
                  </div>
                )
              })}



              {!projectsLoading && projects.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Belum ada project video.
                </p>
              )}
            </div>
          </div>
        </div>
        <Dialog open={openProcessingDialog} onOpenChange={setOpenProcessingDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Video masih diproses</DialogTitle>
              <DialogDescription>
                Video ini belum selesai diproses.  
                Silakan tunggu hingga status selesai sebelum dibuka.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button className="cursor-pointer" onClick={() => setOpenProcessingDialog(false)}>
                Mengerti
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </SidebarInset>
    </SidebarProvider>
  )
}
