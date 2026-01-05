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
import { Input } from "@/app/components/ui/input"
import {
  Upload,
  Link as LinkIcon,
  Scissors,
} from "lucide-react"
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
        setProjects(json.data)
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

  /* ================= YOUTUBE OEMBED ================= */
  useEffect(() => {
    if (!url || !isYoutubeUrl(url)) {
      setYtMeta(null)
      return
    }

    const controller = new AbortController()

    const timeout = setTimeout(async () => {
      try {
        setMetaLoading(true)

        const oembedUrl =
          "https://www.youtube.com/oembed?format=json&url=" +
          encodeURIComponent(url)

        const res = await fetch(oembedUrl, {
          signal: controller.signal,
        })

        if (!res.ok) throw new Error("Invalid URL")

        const data = await res.json()

        setYtMeta({
          title: data.title,
          thumbnail: data.thumbnail_url,
        })
      } catch {
        setYtMeta(null)
      } finally {
        setMetaLoading(false)
      }
    }, 600)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [url])

  const subscribeProgress = (videoId: string) => {
    const ws = new WebSocket(
      `ws://localhost:2003/ws/progress?video_id=${videoId}`
    )
  
    // ws.onmessage = (e) => {
    //   const data: ProgressEvent = JSON.parse(e.data)
  
    //   setProgressMap((prev) => ({
    //     ...prev,
    //     [data.video_id]: data,
    //   }))
    // }
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
  

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    setError(null)

    if (url && file) {
      setError("Pilih URL atau upload file, bukan keduanya.")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/proxy/astro-zenith/auto-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: url,
          video_title: ytMeta?.title,
          thumbnail: ytMeta?.thumbnail,
        }),
      })

      const result = await res.json()

      if (result?.success === false) {
        setError(result?.message || "Server error.")
        return
      }
      const videoId = result?.data?.id
      if (videoId) {
        subscribeProgress(videoId)
      }

      // refresh project list
      await fetchProjects()

      // reset form
      setUrl("")
      setFile(null)
      setYtMeta(null)
    } catch {
      setError("Terjadi kesalahan, silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  /* ================= RENDER ================= */
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* ================= HEADER ================= */}
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Auto Clip</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Generate</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* ================= CONTENT ================= */}
        <div className="flex flex-1 flex-col gap-8 p-6">
          {/* ================= FORM ================= */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Scissors className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Auto Clip</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
              {/* URL */}
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Paste YouTube URL"
                  className="pl-9"
                  value={url}
                  disabled={!!file}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              {/* <div className="text-center text-xs text-muted-foreground">
                OR
              </div> */}

              {/* FILE */}
              {/* <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
                <Upload className="h-4 w-4" />
                {file ? file.name : "Upload video file"}
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  disabled={url.length > 0}
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                />
              </label> */}
            </div>

            {/* META */}
            {metaLoading && (
              <p className="mt-3 text-sm text-muted-foreground">
                Mengambil info video...
              </p>
            )}

            {ytMeta && (
              <div className="mt-4 flex gap-4 rounded-lg border bg-muted/40 p-3">
                <img
                  src={ytMeta.thumbnail}
                  alt={ytMeta.title}
                  className="h-20 w-36 rounded-md object-cover"
                />
                <div>
                  <p className="line-clamp-2 text-sm font-semibold">
                    {ytMeta.title}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    YouTube Preview
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-4 flex justify-end ">
              <Button className="cursor-pointer" disabled={!canSubmit || loading} onClick={handleSubmit}>
                {loading ? "Processing..." : "Create Clip"}
              </Button>
            </div>
          </div>

          {/* ================= PROJECT LIST ================= */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Project Video</h2>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
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
                        src={project.thumbnail}
                        alt={project.video_title}
                        className="h-50 md:h-40 lg:h-30 w-full object-cover"
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
