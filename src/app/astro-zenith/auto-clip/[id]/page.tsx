"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
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
import { Play, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/* ================= TYPES ================= */
type Clip = {
  id: string
  clips_url: string
  title: string
  reason: string
  hook_text: string
  viral_score: number
  duration: number
}

type VideoDetail = {
  id: string
  video_title: string
  thumbnail: string
  video_url: string
  clips: Clip[]
}

/* ================= PAGE ================= */
export default function AutoClipPage() {
  const { id } = useParams()
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogClip, setDialogClip] = useState<Clip | null>(null)

  const [selectMode, setSelectMode] = useState(false)
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set())

  const [bulkDownloading, setBulkDownloading] = useState(false)
  const [singleDownloading, setSingleDownloading] = useState<string | null>(null)

  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!id) return
    fetch(`/api/proxy/astro-zenith/auto-clip/${id}`)
      .then((r) => r.json())
      .then((j) => j?.status && setVideo(j.data))
      .finally(() => setLoading(false))
  }, [id])

  /* ================= PLAY ================= */
  const handlePlay = (clipId: string) => {
    videoRefs.current.forEach((v, id) => id !== clipId && v.pause())
  }

  /* ================= DOWNLOAD ================= */
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a")
    a.href = `/api/proxy/astro-zenith/download?url=${encodeURIComponent(
      url
    )}&filename=${encodeURIComponent(filename)}`
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  /* ===== SINGLE DOWNLOAD (UX FIX) ===== */
  const handleSingleDownload = (clip: Clip) => {
    if (singleDownloading) return
    setSingleDownloading(clip.id)

    triggerDownload(clip.clips_url, `${clip.title}.mp4`)

    // UX delay (anchor download is not awaitable)
    setTimeout(() => {
      setSingleDownloading(null)
    }, 1200)
  }

  /* ===== BULK DOWNLOAD ===== */
  const handleBulkDownload = async () => {
    if (!video || selectedClips.size === 0) return
    setBulkDownloading(true)

    const clips = video.clips.filter((c) => selectedClips.has(c.id))

    for (const clip of clips) {
      triggerDownload(clip.clips_url, `${clip.title}.mp4`)
      await new Promise((r) => setTimeout(r, 400)) // throttle browser
    }

    // tahan spinner biar UX ga “kedip”
    setTimeout(() => {
      setBulkDownloading(false)
    }, 1000)
  }

  const toggleSelectAll = () => {
    if (!video) return
    setSelectedClips(
      selectedClips.size === video.clips.length
        ? new Set()
        : new Set(video.clips.map((c) => c.id))
    )
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* HEADER */}
          <header className="flex h-16 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
  
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <Skeleton className="h-4 w-20" />
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <Skeleton className="h-4 w-32" />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
  
          <div className="p-6 space-y-6">
            {/* VIDEO HEADER */}
            <header className="flex items-center gap-4">
              <Skeleton className="h-24 w-40 rounded-md object-cover" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </header>
  
            {/* ACTION BAR */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
  
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-md" />
                ))}
              </div>
            </div>
  
            {/* GRID */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative border rounded-xl overflow-hidden p-3 space-y-2">
                  <Skeleton className="h-60 rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }
  
  if (!video) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER */}
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/astro-zenith/auto-clip">Auto Clips</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Generate Clips</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="p-6 space-y-6">
        <header className="flex items-center gap-4">
            <img
              src={video.thumbnail}
              alt={video.video_title}
              className="h-24 w-40 object-cover rounded-md"
            />
            <div>
              <h1 className="text-2xl font-bold">{video.video_title}</h1>
              <button
                onClick={() => window.open(video.video_url, "_blank")}
                className="cursor-pointer mt-4 flex items-center text-sm gap-2 px-4 py-2 bg-red-400 text-white rounded-full hover:bg-blue-500 transition"
              >
                <Play className="w-4 h-4" />
                Watch Full Video
              </button>
            </div>
          </header>
          {/* ACTION BAR */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Clips ({video.clips.length})
            </h2>

            <div className="flex gap-2">
              {selectMode && (
                <Button 
                className="cursor-pointer" size="sm" variant="outline" onClick={toggleSelectAll}>
                  {selectedClips.size === video.clips.length
                    ? "Unselect All"
                    : "Select All"}
                </Button>
              )}

              <Button
                size="sm"
                className="cursor-pointer"
                variant="secondary"
                onClick={() => {
                  setSelectMode((v) => !v)
                  setSelectedClips(new Set())
                }}
              >
                {selectMode ? "Cancel" : "Select"}
              </Button>

              <Button
                size="sm"
                className="cursor-pointer"
                disabled={selectedClips.size === 0 || bulkDownloading}
                onClick={handleBulkDownload}
              >
                {bulkDownloading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Download Selected
              </Button>
            </div>
          </div>

          {/* GRID */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {video.clips.map((clip) => {
              const isSelected = selectedClips.has(clip.id)
              const viralColor =
                  clip.viral_score >= 80
                    ? "text-green-600"
                    : clip.viral_score >= 70
                    ? "text-yellow-600"
                    : "text-red-600"
              return (
                <div
                  key={clip.id}
                  className={cn(
                    "relative border rounded-xl overflow-hidden",
                    isSelected && "ring-2 ring-primary"
                  )}
                >
                  {/* CHECKBOX */}
                  {selectMode && (
                    <div className="absolute top-2 right-2 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => {
                          const set = new Set(selectedClips)
                          isSelected
                            ? set.delete(clip.id)
                            : set.add(clip.id)
                          setSelectedClips(set)
                        }}
                      />
                    </div>
                  )}

                  {/* VIDEO */}
                  <div className="relative group">
                    <video
                        ref={(el) => {
                            if (el) {
                            videoRefs.current.set(clip.id, el)
                            }
                        }}
                        src={clip.clips_url}
                        className="w-full"
                        onPlay={() => handlePlay(clip.id)}
                      />
                    <div onClick={() => setDialogClip(clip)} className="cursor-pointer absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/40 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition">
                            <Play></Play>
                        </div>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                        {clip.duration}s
                    </span>
                   

                  </div>

                  {/* CONTENT */}
                  <div className="p-3 space-y-1">
                    <h3
                      className="font-semibold truncate cursor-pointer"
                      onClick={() => setDialogClip(clip)}
                    >
                      {clip.title}
                    </h3>

                    <p className={`text-sm ${viralColor}`}>
                        Viral Score: <span className="text-xl font-bold">{clip.viral_score}</span>
                      </p>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-2 cursor-pointer"
                      disabled={singleDownloading === clip.id}
                      onClick={() => handleSingleDownload(clip)}
                    >
                      {singleDownloading === clip.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* DIALOG */}
        <Dialog open={!!dialogClip} onOpenChange={() => setDialogClip(null)}>
          {dialogClip && (
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{dialogClip.title}</DialogTitle>
                <DialogDescription>
                  Hook : {dialogClip.hook_text}
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                <video
                  src={dialogClip.clips_url}
                  controls
                  autoPlay
                  className="w-full rounded-lg"
                />
                <div className="space-y-2">
                  <p><b>Reason:</b> {dialogClip.reason}</p>
                  <p><b>Duration:</b> {dialogClip.duration}s</p>
                  <p className="font-bold">
                    Viral Score: {dialogClip.viral_score}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button className="cursor-pointer" onClick={() => setDialogClip(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
