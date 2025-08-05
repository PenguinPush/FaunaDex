import {useState} from 'react'
import './App.css'
import Camera from './Camera'
import Dex from './Dex'
import Description from './Description'

function App() {
    const [page, setPage] = useState("camera")
    const [currentPokemon, setPokemon] = useState({})


    return (<>
        <div className="flex justify-center overflow-hidden h-screen w-screen font-pixelify-sans">
            <div className="w-[500px]">
                {page === "description" ? <Description onBack={() => {
                        setPage("dex")
                    }}
                                                       name={currentPokemon.name}
                                                       description={currentPokemon.description}
                                                       timesCaught={currentPokemon.times_caught}
                                                       image={"http://localhost:5050/" + currentPokemon.image_path}
                                                       type_1={currentPokemon.type_1}
                                                       type_2={currentPokemon.type_2}
                                                       first_caught_city={currentPokemon.first_caught_city}
                                                       first_caught_time={currentPokemon.first_caught_time}/>
                    : null}

                {page === "dex" ? <Dex setPokemon={(pokemon) => {
                    setPokemon(pokemon)
                }} onBack={() => {
                    setPage("camera")
                }} setPage={(page) => {
                    setPage(page)
                }}/> : null}

                {page === "camera" ? (<Camera setPage={setPage}/>) : null}
            </div>
        </div>
    </>)
}

export default App
