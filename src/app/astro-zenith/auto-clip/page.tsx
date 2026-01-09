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

import {
  Smartphone,
  Square,
  RectangleHorizontal,
  Crop,
  AlignVerticalJustifyCenter,
} from "lucide-react"

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
import { Maximize, Sparkles } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Card } from "@/app/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog"
import { useRouter } from "next/navigation"
import { CaptionPreset,CAPTION_PRESETS } from "./preset"

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



type AspectRatio = "9:16" | "1:1" | "4:3"
type ResizeMode = "preserve" | "crop" | "tiktok_center" | "smooth_crop"
type CaptionPosition = "bottom" | "center" | "top"



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
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16")
  const [resizeMode, setResizeMode] = useState<ResizeMode>("crop")
  const [captionPosition, setCaptionPosition] =
  useState<CaptionPosition>("bottom")

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
      `ws://ws-zenith.astrovia.id/ws/progress?video_id=${videoId}`
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
  

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    setError(null)

    if (url && file) {
      setError("Pilih URL atau upload file, bukan keduanya.")
      return
    }

    try {
      setLoading(true)
      const payload = JSON.stringify({
        video_url: url,
        video_title: ytMeta?.title,
        thumbnail: ytMeta?.thumbnail,
        output_type : "auto-clip",
        aspect_ratio: aspectRatio,
        resize_mode:
          aspectRatio === "9:16"
            ? resizeMode              
            : null,
        caption_preset: selectedPreset.type === "none"
          ? {
              preset_name: "none",
              position: "none",
            }
          : selectedPreset.type === "standard"
          ? {
              preset_name: selectedPreset.name,
              position: captionPosition,
            }
          : {
              preset_name: "custom",
              position: captionPosition,
              preset_detail: {
                preset_parent: selectedPreset.presetParent,
                fontFamily: "fontname",
                fontSize: "20px",
              },
            },
      });
      // console.log(payload);
      const res = await fetch("/api/proxy/astro-zenith/auto-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload
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
  const [selectedPreset, setSelectedPreset] =
  useState<CaptionPreset>(CAPTION_PRESETS[0])
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
              <>

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
              <div className="mt-6 grid gap-4 lg:grid-cols-3 ">
                {/* ================= ASPECT RATIO ================= */}
                <div>
                  <p className="mb-2 text-sm font-semibold">
                    Aspect Ratio <span className="text-xs text-muted-foreground">(Clips Output)</span>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setAspectRatio("9:16")}
                      className={`cursor-pointer flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition
                        ${
                          aspectRatio === "9:16"
                            ? "border-blue-500 bg-blue-500/10 text-blue-600"
                            : "hover:bg-muted"
                        }`}
                    >
                      <Smartphone className="h-4 w-4" />
                      9:16
                    </button>

                    <button
                      onClick={() => setAspectRatio("1:1")}
                      className={`cursor-pointer flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition
                        ${
                          aspectRatio === "1:1"
                            ? "border-blue-500 bg-blue-500/10 text-blue-600"
                            : "hover:bg-muted"
                        }`}
                    >
                      <Square className="h-4 w-4" />
                      1:1
                    </button>

                    <button
                      onClick={() => setAspectRatio("4:3")}
                      className={`cursor-pointer flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition
                        ${
                          aspectRatio === "4:3"
                            ? "border-blue-500 bg-blue-500/10 text-blue-600"
                            : "hover:bg-muted"
                        }`}
                    >
                      <RectangleHorizontal className="h-4 w-4" />
                      4:3
                    </button>
                  </div>
                </div>

              {/* ================= RESIZE MODE (9:16 only) ================= */}
               
                 
                <div>
                <p className="mb-2 text-sm font-semibold flex items-center gap-2">
                    <Crop className="h-4 w-4 text-muted-foreground" />
                    Resize Mode
                  </p>

                  <Select
                    value={resizeMode}
                    onValueChange={(v) => setResizeMode(v as ResizeMode)}
                    disabled={aspectRatio !== "9:16"}
                  >
                    <SelectTrigger className="w-full cursor-pointer ">
                      <SelectValue placeholder="Select resize mode" />
                    </SelectTrigger>
                    

                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="crop">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Crop <span className="text-xs text-muted-foreground">Crop edges to fit frame (default)</span></p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="preserve">
                        <div className="flex items-center gap-2">
                          <Maximize className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Preserve <span className="text-xs text-muted-foreground"> Keep original framing</span></p>
                            
                          </div>
                        </div>
                      </SelectItem>

                      
                      <SelectItem className="cursor-pointer" value="tiktok_center">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">TikTok Center <span className="text-xs text-muted-foreground">Smart center focus</span></p>
                          </div>
                        </div>
                      </SelectItem>

                      <SelectItem className="cursor-pointer" value="smooth_crop">
                        <div className="flex items-center gap-2">
                          <Crop className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Smooth Crop <span className="text-xs text-muted-foreground"> Smooth dynamic cropping</span></p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {aspectRatio !== "9:16" && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Available only for <span className="font-medium">9:16</span> aspect ratio
                    </p>
                  )}
                </div>

                {/* ================= CAPTION POSITION ================= */}
                <div>
                  <p className="mb-2 text-sm font-semibold flex items-center gap-2">
                    <AlignVerticalJustifyCenter className="h-4 w-4 text-muted-foreground" />
                    Caption Position
                  </p>

                  <div className="flex gap-2">
                    {(["bottom", "center", "top"] as CaptionPosition[]).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setCaptionPosition(pos)}
                        className={`cursor-pointer rounded-md border px-3 py-2 text-xs font-medium capitalize transition
                          ${
                            captionPosition === pos
                              ? "border-blue-500 bg-blue-500/10 text-blue-600"
                              : "hover:bg-muted"
                          }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold">Caption Preset</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {CAPTION_PRESETS.map((preset) => (
                     <button
                     key={preset.name}
                     onClick={() => setSelectedPreset(preset)}
                     className={`group relative rounded-lg border p-2 text-left transition
                       ${
                         selectedPreset.name === preset.name
                           ? "border-blue-500 ring-2 ring-blue-500/40"
                           : "hover:border-muted-foreground/40"
                       }`}
                   >
                     <div className="relative h-28 w-full overflow-hidden rounded-md bg-muted">
                       {/* IMAGE */}
                       {preset.previewImage && (
                         <img
                           src={preset.previewImage}
                           alt={preset.label}
                           className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200
                             ${
                               selectedPreset.name === preset.name
                                 ? "opacity-0"
                                 : "opacity-100 group-hover:opacity-0"
                             }`}
                         />
                       )}
                   
                       {/* VIDEO */}
                       {preset.previewVideo && (
                         <video
                           src={preset.previewVideo}
                           muted
                           loop
                           playsInline
                           preload="none"
                           className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200
                             ${
                               selectedPreset.name === preset.name
                                 ? "opacity-100"
                                 : "opacity-0 group-hover:opacity-100"
                             }`}
                           ref={(el) => {
                             if (!el) return
                   
                             if (selectedPreset.name === preset.name) {
                               el.play().catch(() => {})
                             } else {
                               el.pause()
                               el.currentTime = 0
                             }
                           }}
                           onMouseEnter={(e) => {
                             if (selectedPreset.name !== preset.name) {
                               e.currentTarget.play().catch(() => {})
                             }
                           }}
                           onMouseLeave={(e) => {
                             if (selectedPreset.name !== preset.name) {
                               e.currentTarget.pause()
                               e.currentTarget.currentTime = 0
                             }
                           }}
                         />
                       )}
                   
                       {!preset.previewImage && !preset.previewVideo && (
                         <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                           No Subtitle
                         </div>
                       )}
                     </div>
                   
                     <p className="mt-2 text-xs font-medium">{preset.label}</p>
                   </button>
                   
                    ))}
                  </div>
                </div>

              
              </>
            
              
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
                        // src={project.thumbnail}
                        src={project.thumbnail || "/placeholder.png"}
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
