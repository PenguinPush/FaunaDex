import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'
import TestingPage from './TestingPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TestingPage />
  </StrictMode>,
)
