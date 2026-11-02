import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Vérifier que React est correctement chargé
if (!React || !React.useState) {
  console.error('React is not properly loaded');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Erreur: React n\'est pas correctement chargé. Veuillez recharger la page.</div>';
  throw new Error('React is not properly loaded');
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering app:', error);
  const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
  document.body.innerHTML = `<div style="padding: 20px; color: red;">Erreur de rendu: ${errorMessage}</div>`;
}
