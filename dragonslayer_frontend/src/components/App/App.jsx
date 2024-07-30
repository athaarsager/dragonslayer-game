import TitleScreen from '../TitleScreen/TitleScreen.jsx';
import BattleScreen from '../BattleScreen/BattleScreen.jsx';
import ProloguePage from '../ProloguePage/ProloguePage.jsx';
import { useState, useEffect } from 'react';
import axios from "axios";

export default function App() {

    // variables controlling when to display components
    const [onTitleScreen, setOnTitleScreen] = useState(true);
    const [onBattleScreen, setOnBattleScreen] = useState(false);
    const [onProloguePage, setOnProloguePage] = useState(false);

    const [openingText, setOpeningText] = useState([]);

    const [playerName, setPlayerName] = useState("");
    

    async function fetchOpeningText() {
        const response = await axios.get("/api/game_text/opening_text");
        setOpeningText(response.data);
    }

    useEffect(() => {
        fetchOpeningText();
    }, []);

    useEffect(() => {
        console.log("This is the opening text:", openingText);
    }, [openingText]);

    return (
        <>
            {onTitleScreen &&
                <TitleScreen
                     setOnTitleScreen={setOnTitleScreen} 
                     setOnProloguePage={setOnProloguePage}/>
            }
            {onBattleScreen &&
                <BattleScreen />
            }
            {onProloguePage &&
                <ProloguePage />
            }
        </>
    )
}