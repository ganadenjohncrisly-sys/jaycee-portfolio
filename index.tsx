import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cursor, ScrollProgress } from "@/components/portfolio/fx";
import { About, Contact, Hero, Journey, Loader, Marquees, Nav, Tools, Work } from "@/components/portfolio/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jaycee — Design, Video & Photography Portfolio" },
      { name: "description", content: "Cinematic portfolio of Jaycee, a creative from the Philippines exploring design, video editing, photography and visual direction." },
      { property: "og:title", content: "Jaycee — Frame by frame" },
      { property: "og:description", content: "Design, video & photography — a cinematic creative portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [entered, setEntered] = useState(false);
  return (
    <div className="grain relative">
      {!entered && <Loader onEnter={() => setEntered(true)} />}
      <div className="vignette" />
      <Cursor />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Marquees />
        <About />
        <Tools />
        <Work />
        <Journey />
        <Contact />
      </main>
    </div>
  );
}
