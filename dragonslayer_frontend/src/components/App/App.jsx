import TitleScreen from '../TitleScreen/TitleScreen.jsx';
import BattleScreen from '../BattleScreen/BattleScreen.jsx';
import ProloguePage from '../ProloguePage/ProloguePage.jsx';
import ActionMenu from '../ActionMenu/ActionMenu.jsx';
import { useState, useEffect } from 'react';
import axios from "axios";

export default function App() {

    // variables controlling when to display components
    const [onTitleScreen, setOnTitleScreen] = useState(true);
    const [onBattleScreen, setOnBattleScreen] = useState(false);
    const [onProloguePage, setOnProloguePage] = useState(false);
    const [battleMenuOpen, setBattleMenuOpen] = useState(true);

    const [openingText, setOpeningText] = useState([]);
    const [prologueText, setPrologueText] = useState([]);
    const [displayClassesMenu, setDisplayClassesMenu] = useState(false);

    const [playerName, setPlayerName] = useState("");
    const [enemyName, setEnemyName] = useState("");

    const [playerClasses, setPlayerClasses] =  useState([]);


    async function fetchOpeningText() {
        const response = await axios.get("/api/game_text/opening_text");
        setOpeningText(response.data);
    }

    async function fetchPrologueText() {
        const response = await axios.get("/api/game_text/prologue_text");
        setPrologueText(response.data);
    }

    async function fetchClasses() {
        const response = await axios.get("/api/character_classes");
        console.log("These are the character classes:", response.data);
        // set the enemy's name to "dragon" right off the bat
        setEnemyName(response.data[4].name);
        setPlayerClasses(response.data.slice(0, 4));
        console.log("These will be the playerClasses:", response.data.slice(0, 4));
    }

    useEffect(() => {
        fetchOpeningText();
        fetchPrologueText();
        fetchClasses();
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
                    setOnProloguePage={setOnProloguePage} />
            }
            {onProloguePage &&
                <ProloguePage
                    openingText={openingText}
                    prologueText={prologueText}
                    playerName={playerName}
                    setPlayerName={setPlayerName}
                    playerClasses={playerClasses}
                    displayClassesMenu={displayClassesMenu}
                    setDisplayClassesMenu={setDisplayClassesMenu}
                    />
            }
            {onBattleScreen &&
                <BattleScreen 
                enemyName={enemyName}
                battleMenuOpen={battleMenuOpen}
                setBattleMenuOpen={setBattleMenuOpen}
                />
            }
            {/* The conditional rendering logic is already inside this component */}
            <ActionMenu />
        </>
    )
}