"use client"

import { useEffect, useState } from "react"

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

const isYoutubeUrl = (url: string) =>
  /youtube\.com|youtu\.be/.test(url)

/* =========================================================
   PAGE
========================================================= */
export default function Page() {
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const res = await fetch("/api/proxy/astro-zenith/auto-clip")
      const json = await res.json()
      if (json?.status) {
        setProjects(json.data)
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

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

            <div className="mt-4 flex justify-end">
              <Button disabled={!canSubmit || loading} onClick={handleSubmit}>
                {loading ? "Processing..." : "Create Clip"}
              </Button>
            </div>
          </div>

          {/* ================= PROJECT LIST ================= */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Project Video</h2>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              {projects.map((project) => (
                <div key={project.id} className="rounded-xl border p-4">
                  
                  <img
                    src={project.thumbnail}
                    alt={project.video_title}
                    className="h-50 md:h-40 lg:h-30 w-full rounded-md object-cover"
                  />
                  <p className="mt-2 text-xs text-muted-foreground truncate">
                    {project.video_title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created {timeAgo(project.created_at)}
                  </p>

                  {!project.done && (
                    <span className="text-xs text-yellow-600">
                      Processing...
                    </span>
                  )}
                </div>
              ))}

              {projects.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Belum ada project video.
                </p>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
