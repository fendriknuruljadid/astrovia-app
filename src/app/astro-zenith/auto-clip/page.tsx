"use client"

import { useState } from "react"

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
  Clock,
  FileVideo,
  SquareScissorsIcon,
  Upload,
  Link as LinkIcon,
  Scissors,
} from "lucide-react"

type Project = {
  id: string
  title: string
  thumbnail: string
  type: string
  createdAt: string
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

/* =========================================================
   DUMMY DATA
========================================================= */
const stats = [
  { label: "Total Video", value: 12, icon: FileVideo },
  { label: "Menit Generate", value: 342, icon: Clock },
  { label: "Total Shorts", value: 87, icon: SquareScissorsIcon },
]

const projects: Project[] = []


/* =========================================================
   PAGE
========================================================= */
export default function Page() {
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const canSubmit = url.length > 0 || file !== null

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
                    Auto Clip
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Generate</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <div className="flex flex-1 flex-col gap-8 p-6">

          {/* ===== AUTO CLIP FORM ===== */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Scissors className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                Auto Clip
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              {/* URL */}
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Paste video URL (YouTube Only)"
                  className="pl-9"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              {/* OR */}
              <div className="text-center text-xs text-muted-foreground">
                OR
              </div>

              {/* FILE */}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted">
                <Upload className="h-4 w-4" />
                {file ? file.name : "Upload video file"}
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <Button disabled={!canSubmit}>
                Create Clip
              </Button>
            </div>
          </div>

          {/* ===== PROJECT LIST ===== */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Project Video
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group overflow-hidden rounded-xl border bg-card transition hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                      {project.type}
                    </span>
                  </div>

                  <div className="space-y-2 p-4">
                    <p className="line-clamp-2 font-semibold">
                      {project.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Generated {timeAgo(project.createdAt)}
                    </p>
                  </div>
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
