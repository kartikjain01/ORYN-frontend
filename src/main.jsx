import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom" // This is what's missing!
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Start of the Router Context */}
      <App />
    </BrowserRouter> {/* End of the Router Context */}
  </StrictMode>,
)