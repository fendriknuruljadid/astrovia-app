"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import {
  FieldGroup,
} from "@/app/components/ui/field";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Instagram, MessageCircle, Facebook, Send, Music } from "lucide-react";
import { motion } from "framer-motion";

export function Platform({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID!;
  const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!;

  const scopes = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement",
    "business_management",
  ].join(",");

  const loginUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scopes}&state=ig_auth&default_business_login_option=IG`;

  const platforms = [
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5 text-pink-500" />,
      description: "Kelola konten dan insight Instagram Anda.",
      action: () => {
        // Buka popup dengan ukuran standar OAuth
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
  
        const popup = window.open(
          loginUrl,
          "Instagram Login",
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
        );
  
        if (popup) popup.focus();
      },
    },
    {
      name: "Threads",
      icon: <Send className="w-5 h-5 text-black" />,
      description: "Hubungkan akun Threads Anda.",
      action: () => alert("Integrasi Threads"),
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5 text-blue-600" />,
      description: "Sambungkan ke halaman Facebook Anda.",
      action: () => alert("Integrasi Facebook"),
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5 text-green-500" />,
      description: "Kelola pesan dan broadcast dengan mudah.",
      action: () => alert("Integrasi WhatsApp"),
    },
    {
      name: "TikTok",
      icon: <Music className="w-5 h-5 text-black" />,
      description: "Hubungkan akun TikTok untuk analitik dan posting.",
      action: () => alert("Integrasi TikTok"),
    },
  ];

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Pilih Platform Sosial Media</h1>
        <p className="text-muted-foreground text-sm text-balance max-w-sm">
          Hubungkan akun sosial media Anda untuk mengelola konten dan insight secara terpusat.
        </p>
      </div>

      <FieldGroup>
        <div className="w-full grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="hover:shadow-lg transition rounded-2xl cursor-pointer"
                onClick={platform.action}
              >
                <CardHeader className="flex flex-row items-center gap-2">
                  {platform.icon}
                  <CardTitle className="text-base">{platform.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{platform.description}</CardDescription>
                 
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </FieldGroup>
    </form>
  );
}
