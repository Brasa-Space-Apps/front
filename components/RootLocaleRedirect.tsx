"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootLocaleRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("brasa-locale")) return;

    const preferred = navigator.languages[0]?.toLowerCase();

    if (preferred?.startsWith("pt")) {
      router.replace("/pt-br");
    } else if (preferred?.startsWith("es")) {
      router.replace("/es");
    }
  }, [router]);

  return null;
}
