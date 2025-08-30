import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ContextProvider } from './context/index.jsx'

createRoot(document.getElementById('root')).render(
  //<StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>
  //</StrictMode>,
)


// "Chess set" (https://skfb.ly/ooxAN) by Brendan Wood is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).