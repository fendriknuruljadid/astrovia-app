"use client"

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
import { Clock, FileVideo, SquareScissorsIcon } from "lucide-react"

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
   DUMMY DATA (GANTI DARI API NANTI)
========================================================= */

const projects = [
  {
    id: "1",
    title: "Podcast Bisnis Ep 12",
    thumbnail: "/thumb-1.jpg",
    type: "Auto Clips",
    createdAt: "2025-01-13",
  },
  {
    id: "2",
    title: "Interview Founder Startup",
    thumbnail: "/thumb-2.jpg",
    type: "Auto Caption",
    createdAt: "2025-01-11",
  },
  {
    id: "3",
    title: "Motivational Talk 2025",
    thumbnail: "/thumb-3.jpg",
    type: "Auto Clips",
    createdAt: "2025-01-09",
  },
  {
    id: "3",
    title: "Motivational Talk 2025",
    thumbnail: "/thumb-3.jpg",
    type: "Auto Clips",
    createdAt: "2025-01-09",
  },
  {
    id: "3",
    title: "Motivational Talk 2025",
    thumbnail: "/thumb-3.jpg",
    type: "Auto Clips",
    createdAt: "2025-01-09",
  },
  {
    id: "3",
    title: "Motivational Talk 2025",
    thumbnail: "/thumb-3.jpg",
    type: "Auto Clips",
    createdAt: "2025-01-09",
  },
  {
    id: "3",
    title: "Motivational Talk 2025",
    thumbnail: "/thumb-3.jpg",
    type: "Auto Clips",
    createdAt: "2025-01-09",
  },
]

const stats = [
  {
    label: "Total Video",
    value: 12,
    icon: FileVideo,
  },
  {
    label: "Menit Generate",
    value: 342,
    icon: Clock,
  },
  {
    label: "Total Shorts",
    value: 87,
    icon: SquareScissorsIcon,
  },
]

/* =========================================================
   PAGE
========================================================= */
export default function Page() {
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

        {/* ================= CONTENT ================= */}
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


          {/* ===== PROJECT LIST ===== */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Project Video
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
                >
                  {/* PREVIEW */}
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* TYPE BADGE */}
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur">
                      {project.type}
                    </span>
                  </div>

                  {/* CONTENT */}
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
