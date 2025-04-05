import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Camera from './Camera'
import Dex from './Dex'
import Description from './Description'
import BottomImagePanel from './BottomImagePanel'

function App() {
  const [page, setPage] = useState("camera")
  const [currentPokemon, setPokemon] = useState({})


  return (
    <>
      {page == "description" ? <Description onBack={()=>{setPage("dex")}} name={currentPokemon.name} description={currentPokemon.description} timesCaught={currentPokemon.times_caught} image={"http://127.0.0.1:5050/" + currentPokemon.image_path}/> : null}
      {page == "dex" ? <Dex setPokemon={(pokemon)=>{setPokemon(pokemon)}} onBack={()=>{setPage("camera")}} setPage={(page)=>{setPage(page)}} /> : null}
      {page == "camera" ? 
      ( <>
        <Camera setPage={setPage}/> 
        </>
      )
        : null
      }
    </>
  )
}

export default App
