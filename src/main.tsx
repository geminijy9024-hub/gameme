import { StrictMode } from "react"; import { createRoot } from "react-dom/client"; import { registerSW } from "virtual:pwa-register";
import { App } from "@/app/App"; import { audioManager } from "@/services/audio/audio-manager"; import "@/styles/global.css";
registerSW({ immediate: true }); document.addEventListener("pointerdown", () => audioManager.unlock(), { once: true });
createRoot(document.getElementById("root")!).render(<StrictMode><App/></StrictMode>);
