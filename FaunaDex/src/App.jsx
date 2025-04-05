import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Camera from './Camera'
import Dex from './Dex'
import Description from './Description'

function App() {
  const [page, setPage] = useState("dex")
  const [currentPokemon, setPokemon] = useState({})


  return (
    <>
      {page == "description" ? <Description onBack={()=>{setPage("dex")}} name={currentPokemon.name} description={currentPokemon.description} timesCaught={currentPokemon.timesCaught} image={currentPokemon.image}/> : null}
      {page == "dex" ? <Dex setPokemon={(pokemon)=>{setPokemon(pokemon)}} onBack={()=>{setPage("camera")}} setPage={(page)=>{setPage(page)}} /> : null}
      {page == "camera" ? <Camera /> : null}
    </>
  )
}

export default App
