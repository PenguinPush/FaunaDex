import {useState} from 'react'
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
            {page == "description" ? <Description onBack={() => {
                setPage("dex")
            }}
              name={currentPokemon.name}
              description={currentPokemon.description}
              timesCaught={currentPokemon.times_caught}
              image={"https://fauna-dex-3f13cfbb2cab.herokuapp.com/" + currentPokemon.image_path}
              type_1={currentPokemon.type_1}
              type_2={currentPokemon.type_2}
              first_caught_city={currentPokemon.first_caught_city}
              first_caught_time={currentPokemon.first_caught_time}/> : null}
            {page == "dex" ? <Dex setPokemon={(pokemon) => {
                setPokemon(pokemon)
            }} onBack={() => {
                setPage("camera")
            }} setPage={(page) => {
                setPage(page)
            }}/> : null}
            {page == "camera" ?
                (<>
                        <Camera setPage={setPage}/>
                    </>
                )
                : null
            }
        </>
    )
}

export default App
