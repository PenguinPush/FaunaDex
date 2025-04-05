import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Camera from './Camera'
import Dex from './Dex'

function App() {
  const [page, setPage] = useState(0)

  return (
    <>
      <Dex />
    </>
  )
}

export default App
