'use client';

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface AutoLogoutProps {
  children: ReactNode;
}

export default function AutoLogout({ children }: AutoLogoutProps) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "LOGOUT") {
      signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  return <>{children}</>;
}
