import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Set BASE_PATH=/your-repo-name/ when deploying to GitHub Pages.
// For root deployments (Netlify, Vercel, your own domain) leave it unset.
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  plugins: [react()],
  base,
});
