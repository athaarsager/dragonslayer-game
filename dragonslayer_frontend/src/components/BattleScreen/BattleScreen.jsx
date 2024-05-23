import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./BattleScreen.css";
import BattleLogic from "../BattleLogic/BattleLogic";
import ActionMenu from "../ActionMenu/ActionMenu";
function BattleScreen() {
    const playRoundRef = useRef();

    const [onActionMenu, setOnActionMenu] = useState(true);
    const [classAttacks, setClassAttacks] = useState([]);
    const [classAttacksToDisplay, setClassAttacksToDisplay] = useState([]);
    const [maxPlayerStats, setMaxPlayerStats] = useState({});
    const [currentPlayerStats, setCurrentPlayerStats] = useState({});
    const [attackOptionChosen, setAttackOptionChosen] = useState(false);
    const [battleText, setBattleText] = useState("Default");
    const [battleMenuOpen, setBattleMenuOpen] = useState(true);
    const [playerManaDisplay, setPlayerManaDisplay] = useState("");

    const [dragonHp, setDragonHp] = useState(NaN);
    const [dragonMaxHp, setDragonMaxHp] = useState(NaN);
    const [dragonMana, setDragonMana] = useState(NaN);

    const [enemyName, setEnemyName] = useState("");
    const [enemyAttacks, setEnemyAttacks] = useState([]);
    const [currentEnemyStats, setCurrentEnemyStats] = useState({});

    const [playerHp, setPlayerHp] = useState(NaN);
    const [playerMana, setPlayerMana] = useState(NaN);
    const [swordIsCharged, setSwordIsCharged] = useState(false);

    // These variables will track when status effects wear off
    // Tracking each stat individually in case multiple buffs/debuffs inflicted at once
    // don't know if that's actually possible with the attacks I designed, but good for theoretical scaling
    const [playerAttackRoundCounter, setPlayerAttackRoundCounter] = useState(0);
    const [playerDefenseRoundCounter, setPlayerDefenseRoundCounter] = useState(0);
    const [enemyAttackRoundCounter, setEnemyAttackRoundCounter] = useState(0);
    const [enemyDefenseRoundCounter, setEnemyDefenseRoundCounter] = useState(0);

    const [lostTurnCounter, setLostTurnCounter] = useState(0);
    const [isBlinded, setIsBlinded] = useState(false);

    // state variable for evaluating where the selector arrow is
    const [selectedOption, setSelectedOption] = useState(0);

    // need to use ref to ensure an old value is not captured when an event listener is added
    const selectedOptionRef = useRef(selectedOption);

    // putting axios calls here for now. Will very likely need to move them to a different component later
    async function fetchClassAttacks() {
        const response = await axios.get("/api/attacks/4");
        console.log(response.data);
        setClassAttacks(response.data);
    }

    async function fetchClassAttacksToDisplay() {
        const response = await axios.get("/api/attacks/4/display");
        console.log("These are the attacks to display:", response.data);
        setClassAttacksToDisplay(response.data);
    }

    async function fetchCharacterStats() {
        const response = await axios.get(`/api/stats/4`);
        console.log("These are the character's stats:", response.data[0]);
        setMaxPlayerStats(response.data[0]);
        setCurrentPlayerStats(response.data[0]);
        setPlayerHp(response.data[0].hp);
        setPlayerMana(response.data[0].mana);
        setPlayerManaDisplay(playerMana);
    }

    async function fetchDragonAttacks() {
        const response = await axios.get("/api/attacks/5");
        console.log("These are the dragon's attacks:", response.data);
        setEnemyAttacks(response.data);
    }

    async function fetchDragonStats() {
        const response = await axios.get("/api/stats/5");
        console.log("These are the dragon's stats:", response.data[0]);
        setCurrentEnemyStats(response.data[0]);
        // This might be problematic if page refreshed or component remounts several times
        // don't want to reset hp values accidentally
        setDragonHp(response.data[0].hp);
        setDragonMaxHp(response.data[0].hp);
        setDragonMana(response.data[0].mana);
    }

    // This function may need to be moved to the class display screen. Leaving it here for now
    async function fetchClasses() {
        const response = await axios.get("/api/character_classes");
        console.log("These are the character classes:", response.data);
        // set the enemy's name to "dragon" right off the bat
        setEnemyName(response.data[4].name);
    }

    // function manually determines which item should be selected in the battle action menu
    // based on what key was pressed
    const displaySelector = (e) => {
        // left options are represented by 0 and 2
        // right options are represented by 1 and 3
        // using 0 indexing to fit with array locations
        if (e.key === "ArrowLeft") {
            setSelectedOption((prev) => (prev % 2 === 1 ? prev - 1 : prev));
        } else if (e.key === "ArrowRight") {
            setSelectedOption((prev) => (prev % 2 === 0 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setSelectedOption((prev) => (prev > 1 ? prev - 2 : prev));
        } else if (e.key === "ArrowDown") {
            setSelectedOption((prev) => (prev < 2 ? prev + 2 : prev));
        }
    }

    const renderBattleText = () => {

        if (!attackOptionChosen) {
            setBattleText("Default");
            return;
        } else {
            const attackDescriptions = classAttacksToDisplay.map((attack) => attack.attack.description);
            if (selectedOption === 2 && swordIsCharged) {
                setBattleText("You're already gripping the sword with both hands. Grip it any tighter and you might faint.");
            } else {
                setBattleText(attackDescriptions[selectedOption]);
            }
        }
    }

    // function that will use conditionals to determine which of the above functions to execute on "enter"
    // will need to edit this to make it more universal...

    const executeAction = (e) => {

        if ((e.key === " " || e.key === "Enter")) {
            if (classAttacksToDisplay.length === 0) return;

            // use the ref so that we're always using the most recent value
            // since this function runs as part of an event listener,
            // the normal selectedOption variable will be out of date
            // since its value was only captured when the event listener was initially added
            const currentSelectedOption = selectedOptionRef.current;
            // if selectedOption is 0, then "attack" was selected. Open attack menu and set the battle text
            if (onActionMenu) {
                if (currentSelectedOption === 0) {
                    setAttackOptionChosen(true);
                    setBattleText(classAttacksToDisplay[0].attack.description);
                    setOnActionMenu(false);
                    return;
                }
            } else if (attackOptionChosen) {
                removeMenuEventListeners();
                // calls the playRound function as a ref coming from the BattleLogic component
                console.log("Attack option chosen");
                playRoundRef.current(enemyName, classAttacksToDisplay[selectedOption]);
                addMenuEventListeners();
                return;
            }
        }
    }

    function removeMenuEventListeners() {
        document.removeEventListener("keydown", executeAction);
        document.removeEventListener("keydown", displaySelector);
        document.removeEventListener("keydown", renderBattleText);
    }

    function addMenuEventListeners() {
        document.addEventListener("keydown", executeAction);
        document.addEventListener("keydown", displaySelector);
        document.addEventListener("keydown", renderBattleText);
    }

    const battleLogicProps = {
        currentPlayerStats,
        setCurrentPlayerStats,
        currentEnemyStats,
        setCurrentEnemyStats,
        dragonHp,
        setDragonHp,
        classAttacks,
        classAttacksToDisplay,
        setClassAttacksToDisplay,
        swordIsCharged,
        setSwordIsCharged,
        setBattleText,
        playerAttackRoundCounter,
        setPlayerAttackRoundCounter,
        playerDefenseRoundCounter,
        setPlayerDefenseRoundCounter,
        enemyAttackRoundCounter,
        setEnemyAttackRoundCounter,
        enemyDefenseRoundCounter,
        setEnemyDefenseRoundCounter,
        lostTurnCounter,
        setLostTurnCounter,
        isBlinded,
        setIsBlinded,
        playerHp,
        setPlayerHp,
        enemyAttacks,
        playerMana,
        setBattleMenuOpen,
        attackOptionChosen,
        setAttackOptionChosen,
        setOnActionMenu,
        playRoundRef
    };

    useEffect(() => {
        fetchClasses();
        fetchClassAttacks();
        fetchClassAttacksToDisplay();
        fetchCharacterStats();
        fetchDragonAttacks();
        fetchDragonStats();
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", displaySelector);
        document.addEventListener("keydown", renderBattleText);
        document.addEventListener("keydown", executeAction);
        renderBattleText();
        console.log("This is the value of attackOptionChosen:", attackOptionChosen);
        return () => {
            document.removeEventListener("keydown", displaySelector);
            document.removeEventListener("keydown", renderBattleText);
            document.removeEventListener("keydown", executeAction);
        }
    }, [attackOptionChosen, classAttacks]); // may need to add onActionMenu here later?

    // this asynchronously updates the display for the dragon's hp whenever the value of dragonHp changes
    // do this instead of doing it directly in the playRound function
    useEffect(() => {
        // Access the updated dragonHp value here
        console.log("Updated dragon's HP:", dragonHp);
        // Perform actions that depend on the updated HP
        const dragonHpDisplay = document.getElementById("dragon-hp");
        // need to use this DOM element to ensure that the current width of the hp bar
        // is always compared to its maximum length
        const dragonHpDisplayContainer = document.getElementById("dragon-hp-container");
        if (dragonHpDisplay) {
            const dragonHpWidth = dragonHpDisplayContainer.offsetWidth;
            if (dragonHp <= 0) {
                dragonHpDisplay.style.width = "0px";
            } else {
                const newWidth = dragonHpWidth * (dragonHp / dragonMaxHp);
                dragonHpDisplay.style.width = `${newWidth}px`;
            }
            console.log("This is the width after subrating the dragon's hp:", dragonHpDisplay.style.width);
        }
    }, [dragonHp, dragonMaxHp]); // Run this effect whenever dragonHp changes

    useEffect(() => {
        if (playerHp <= 0) {
            setPlayerHp(0);
            //alert("Game Over!");
        }
    }, [playerHp]);

    useEffect(() => {
        console.log("This is the dragon's hp:", dragonHp);
        if (dragonHp <= 0) {
            setDragonHp(0);
        }
    }, [dragonHp]);

    // This updates the selectedOptionRef whenever the selectedOption is updated
    useEffect(() => {
        selectedOptionRef.current = selectedOption;
    }, [selectedOption]);

    useEffect(() => {
        console.log("This is the selected option:", selectedOption);
    }, [selectedOption]);

    useEffect(() => {
        console.log("This is the value of onActionMenu:", onActionMenu);
    }, [onActionMenu]);

    return (
        <>
            <BattleLogic {...battleLogicProps} />
            <div id="dragon-hp-container-container">
                <div id="dragon-hp-container">
                    <div id="dragon-hp"></div>
                </div>
            </div>
            {/* Credit for dragon image: Image by Artie Blur from Pixabay 
                Granted, it is AI generated, so do I need to credit him? Probablys still should...*/}
            <div id="dragon-display">
                <img src="/public/images/dragon.jpg"
                    alt="A dark blue dragon whose tail and wings exude flames as it sets a forest on fire in the night" />
            </div>
            <div id="character-stat-display">
                <p>Hp: {playerHp}</p>
                <p>Mana: {playerMana}</p>
            </div>
            <div id="battle-text" className="text-box">
                <p>{battleText}</p>
            </div>
            <div id="battle-menu" className="text-box">
                <ActionMenu
                    classAttacksToDisplay={classAttacksToDisplay}
                    selectedOption={selectedOption}
                    attackOptionChosen={attackOptionChosen}
                    setAttackOptionChosen={setAttackOptionChosen}
                    setOnActionMenu={setOnActionMenu}
                    battleMenuOpen={battleMenuOpen} />
            </div>
        </>
    )
}

export default BattleScreen;