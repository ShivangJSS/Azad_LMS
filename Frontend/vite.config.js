import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },

    server: {
        host: "0.0.0.0",
        port: 8066,
        strictPort: true,
        hmr: true,
    },

    build: {
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (id.includes("recharts")) {
                            return "vendor-recharts";
                        }
                        if (id.includes("pptx-preview") || id.includes("jszip")) {
                            return "vendor-pptx";
                        }
                        if (id.includes("react-simple-maps") || id.includes("d3")) {
                            return "vendor-maps";
                        }
                        if (id.includes("lucide-react") || id.includes("react-icons")) {
                            return "vendor-icons";
                        }
                        if (id.includes("react-bootstrap") || id.includes("bootstrap")) {
                            return "vendor-bootstrap";
                        }
                    }
                },
            },
        },
    },
});