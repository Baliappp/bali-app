import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Autorise l'import des images (jpg/png/webp) comme assets bundles au build.
  assetsInclude: ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.webp"],
});
