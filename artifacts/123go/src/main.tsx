import "./styles/fonts.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

createRoot(document.getElementById("root")!).render(<App />);

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Nova versão do 123GO! disponível. Atualizar agora?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("[123GO!] App pronto para uso offline!");
  },
  onRegistered(registration) {
    console.log("[123GO!] Service Worker registrado:", registration);
  },
  onRegisterError(error) {
    console.error("[123GO!] Erro ao registrar Service Worker:", error);
  },
});
