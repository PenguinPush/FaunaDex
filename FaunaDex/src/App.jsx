import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Camera from './Camera'
import Dex from './Dex'
import Description from './Description'

function App() {
  const [page, setPage] = useState(0)

  return (
    <>
      {/* <Dex /> */}
      <Description name="Squirtle" description="Hello world!" timesCaught={1} image="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"/>
    </>
  )
}

export default App
