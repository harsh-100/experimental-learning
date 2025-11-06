import './index.css'

import App from './App'
import { HelmetProvider } from 'react-helmet-async'
import React from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
)
