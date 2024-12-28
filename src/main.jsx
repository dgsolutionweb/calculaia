import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Registra o service worker para PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível. Atualizar agora?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App pronto para uso offline!')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
