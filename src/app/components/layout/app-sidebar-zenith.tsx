"use client"

import * as React from "react"
import {
  AudioWaveform,
  ClosedCaption,
  Crown,
  House,
  Sparkles,
} from "lucide-react"

import { NavMain } from "@/app/components/layout/nav-main"
import { NavUser } from "@/app/components/layout/nav-user-zenith"
import { AgentSwitcher } from "@/app/components/layout/agent-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/app/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  agents: [
    {
      name: "Astro Zenith.",
      logo: AudioWaveform,
      plan: "Agent AI (Youtuber & Content Creator)",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/astro-zenith",
      icon: House,
      
    },
    
    {
      title: "Auto Clip",
      url: "/astro-zenith/auto-clip",
      icon: Sparkles,
      
    },
    
    {
      title: "Auto Caption",
      url: "/astro-zenith/auto-caption",
      icon: ClosedCaption,
      
    },
    
    // {
    //   title: "Seamless Video",
    //   url: "/astro-zenith/seamless",
    //   icon: Infinity,
      
    // },
    
    // {
    //   title: "AI B-Roll",
    //   url: "/astro-zenith/roll",
    //   icon: Clapperboard,
      
    // },

    // {
    //   title: "Social Account",
    //   url: "/astro-zenith/social-account",
    //   icon: Link,
      
    // },
    
    {
      title: "Subscription",
      url: "/astro-zenith/subscription",
      icon: Crown,
      
    },    
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AgentSwitcher agents={data.agents} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
