import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import './index.css'
import App from './App'
import { QueryProvider } from './lib/query'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <Toaster richColors position="top-center" />
      <App />
    </QueryProvider>
  </StrictMode>
)
