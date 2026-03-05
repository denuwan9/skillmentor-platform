import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster position="top-center" richColors />
    </section>
  );
}
