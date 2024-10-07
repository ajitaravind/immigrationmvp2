"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";

const publicRoutes = ["/", "/signin", "/signup", "/product"];

function AuthCheck({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!token && !publicRoutes.includes(pathname)) {
      console.log("AuthCheck - Redirecting to /signin");
      router.push("/signin");
    } else {
      console.log("AuthCheck - No redirect needed");
    }
  }, [token, pathname, router]);

  return <>{children}</>;
}

export default function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("ClientAuthProvider - Rendering");
  return <AuthCheck>{children}</AuthCheck>;
}
