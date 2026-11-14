"use client";
import { useEffect } from "react";
import { getMeta, postStats } from "@/lib/api";

export default function Home() {
  useEffect(() => {
    getMeta().then(console.log);
    postStats({
      geometry: { type: "Polygon", coordinates: [] },
      start_date: "2003-01-01",
      end_date: "2025-12-31",
    }).then(console.log);
  }, []);
  return <main>test</main>;
}