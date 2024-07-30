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
    const [prologueText, setPrologueText] = useState([]);

    const [playerName, setPlayerName] = useState("");
    

    async function fetchOpeningText() {
        const response = await axios.get("/api/game_text/opening_text");
        setOpeningText(response.data);
    }

    async function fetchPrologueText() {
        const response = await axios.get("/api/game_text/prologue_text");
        setPrologueText(response.data);
    }

    useEffect(() => {
        fetchOpeningText();
        fetchPrologueText();
    }, []);

    useEffect(() => {
        console.log("This is the opening text:", openingText);
    }, [openingText]);

    useEffect(() => {
        console.log("This is the prologue text:", prologueText);
    }, [prologueText]);

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