import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Camera from './Camera'
import Dex from './Dex'
import Description from './Description'

function App() {
  const [page, setPage] = useState("description")

  return (
    <>
      {page == "description" ? <Description onBack={()=>{setPage("dex")}} name="Squirtle" description="Hello world!" timesCaught={1} image="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"/> : null}
      {page == "dex" ? <Dex onBack={()=>{setPage("camera")}} setPage={(page)=>{setPage(page)}} /> : null}
      {page == "camera" ? <Camera /> : null}
    </>
  )
}

export default App
