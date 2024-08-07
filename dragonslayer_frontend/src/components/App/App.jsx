import TitleScreen from '../TitleScreen/TitleScreen.jsx';
import BattleScreen from '../BattleScreen/BattleScreen.jsx';
import ProloguePage from '../ProloguePage/ProloguePage.jsx';
import ActionMenu from '../ActionMenu/ActionMenu.jsx';
import "./App.css";
import { useState, useEffect } from 'react';
import axios from "axios";

export default function App() {

    // variables controlling when to display components
    const [onTitleScreen, setOnTitleScreen] = useState(true);
    const [onBattleScreen, setOnBattleScreen] = useState(false);
    const [onProloguePage, setOnProloguePage] = useState(false);
    const [battleMenuOpen, setBattleMenuOpen] = useState(false);

    const [openingText, setOpeningText] = useState([]);
    const [prologueText, setPrologueText] = useState([]);
    const [displayClassesMenu, setDisplayClassesMenu] = useState(false);

    const [playerName, setPlayerName] = useState("");
    const [enemyName, setEnemyName] = useState("");

    const [playerClasses, setPlayerClasses] = useState([]);

    // prop variables
    const [attackOptionChosen, setAttackOptionChosen] = useState(false);
    const [classAttacks, setClassAttacks] = useState([]);
    const [onActionMenu, setOnActionMenu] = useState(true);
    const [classAttacksToDisplay, setClassAttacksToDisplay] = useState([]);
    // state variable for evaluating where the selector arrow is
    const [selectedOption, setSelectedOption] = useState(0);
    const [dragonIsAwaitingPlayerResponse, setDragonIsAwaitingPlayerResponse] = useState(false);
    const [onFinalText, setOnFinalText] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const battleScreenProps = {
        enemyName,
        setEnemyName,
        playerClasses,
        displaySelector,
        battleMenuOpen,
        setBattleMenuOpen,
        displayClassesMenu,
        classAttacks,
        setClassAttacks,
        classAttacksToDisplay,
        setClassAttacksToDisplay,
        selectedOption,
        setSelectedOption,
        attackOptionChosen,
        setAttackOptionChosen,
        dragonIsAwaitingPlayerResponse,
        setDragonIsAwaitingPlayerResponse,
        onActionMenu,
        setOnActionMenu,
        onFinalText,
        setOnFinalText,
        gameOver,
        setGameOver,
        setOnBattleScreen,
        setOnTitleScreen,
        playerName,
        setPlayerName,
    }

    const actionMenuProps = {
        playerClasses,
        classAttacks,
        classAttacksToDisplay,
        selectedOption,
        attackOptionChosen,
        setAttackOptionChosen,
        dragonIsAwaitingPlayerResponse,
        setOnActionMenu,
        battleMenuOpen,
        displayClassesMenu,
        onFinalText,
        gameOver
    }

    const prologuePageProps = {
        openingText,
        prologueText,
        playerName, 
        setPlayerName, 
        playerClasses, 
        displayClassesMenu, 
        setDisplayClassesMenu, 
        displaySelector, 
        selectedOption, 
        setSelectedOption,
        setOnBattleScreen,
        setOnProloguePage,
        setBattleMenuOpen,
    }


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

    // function manually determines which item should be selected in the battle action menu
    // based on what key was pressed
    function displaySelector(e) {
        // left options are represented by 0 and 2
        // right options are represented by 1 and 3
        // using 0 indexing to fit with array locations
        if (e.key === "ArrowLeft") {
            if (gameOver) {
                setSelectedOption(0);
            } else {
                setSelectedOption((prev) => (prev % 2 === 1 ? prev - 1 : prev));
            }
        } else if (e.key === "ArrowRight") {
            if (gameOver) {
                setSelectedOption(1);
            } else {
                setSelectedOption((prev) => (prev % 2 === 0 ? prev + 1 : prev));
            }
        } else if (e.key === "ArrowUp") {
            if (gameOver) {
                return;
            } else {
                setSelectedOption((prev) => (prev > 1 ? prev - 2 : prev));
            }
        } else if (e.key === "ArrowDown") {
            if (gameOver) {
                return;
            } else {
                setSelectedOption((prev) => (prev < 2 ? prev + 2 : prev));
            }
        }
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
                <ProloguePage {...prologuePageProps}/>
            }
            {onBattleScreen &&
                <BattleScreen {...battleScreenProps} />
            }
            {/* The conditional rendering logic is already inside this component */}
            <ActionMenu {...actionMenuProps} />
        </>
    )
}