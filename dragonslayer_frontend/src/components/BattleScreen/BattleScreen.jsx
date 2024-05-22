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
        const optionOne = document.querySelector(".option-one").children[0];
        const optionTwo = document.querySelector(".option-two").children[0];
        const optionThree = document.querySelector(".option-three").children[0];
        const optionFour = document.querySelector(".option-four").children[0];
        // check for "legal" moves first
        if (e.key === "ArrowLeft" && (!optionOne.classList.contains("unselected") || !optionThree.classList.contains("unselected"))) {
            return;
        } else if (e.key === "ArrowRight" && (!optionTwo.classList.contains("unselected") || !optionFour.classList.contains("unselected"))) {
            return;
        } else if (e.key === "ArrowUp" && (!optionOne.classList.contains("unselected") || !optionTwo.classList.contains("unselected"))) {
            return;
        } else if (e.key === "ArrowDown" && (!optionThree.classList.contains("unselected") || !optionFour.classList.contains("unselected"))) {
            return;
            // now actually determine behavior, one scenario at a time
        } else if (e.key === "ArrowRight" && !optionOne.classList.contains("unselected")) {
            optionOne.classList.add("unselected");
            optionTwo.classList.remove("unselected");
            return;
        } else if (e.key === "ArrowDown" && !optionOne.classList.contains("unselected")) {
            optionOne.classList.add("unselected");
            optionThree.classList.remove("unselected");
            return;
        } else if (e.key === "ArrowDown" && !optionTwo.classList.contains("unselected")) {
            optionTwo.classList.add("unselected");
            optionFour.classList.remove("unselected");
            return;
        } else if (e.key === "ArrowLeft" && !optionTwo.classList.contains("unselected")) {
            optionTwo.classList.add("unselected");
            optionOne.classList.remove("unselected");
            return;
        } else if (e.key === "ArrowUp" && !optionThree.classList.contains("unselected")) {
            optionThree.classList.add("unselected");
            optionOne.classList.remove("unselected");
            return;
        } else if (e.key === "ArrowRight" && !optionThree.classList.contains("unselected")) {
            optionThree.classList.add("unselected");
            optionFour.classList.remove("unselected");
            return;
        } else if (e.key === "ArrowLeft" && !optionFour.classList.contains("unselected")) {
            optionFour.classList.add("unselected");
            optionThree.classList.remove("unselected");
            return;
        } else if (e.key === "ArrowUp" && !optionFour.classList.contains("unselected")) {
            optionFour.classList.add("unselected");
            optionTwo.classList.remove("unselected");
            return;
        }
    }

    const renderBattleText = () => {
        const optionOne = document.querySelector(".option-one").children[0];
        const optionTwo = document.querySelector(".option-two").children[0];
        const optionThree = document.querySelector(".option-three").children[0];
        const optionFour = document.querySelector(".option-four").children[0];

        if (!attackOptionChosen) {
            setBattleText("Default");
            return;
        } else if (attackOptionChosen) {
            if (!optionOne.classList.contains("unselected")) {
                setBattleText(classAttacksToDisplay[0].attack.description);
            } else if (!optionTwo.classList.contains("unselected") && swordIsCharged) {
                setBattleText("You're already gripping the sword with both hands. Grip it any tighter and you might faint.");
            } else if (!optionTwo.classList.contains("unselected")) {
                setBattleText(classAttacksToDisplay[1].attack.description);
            } else if (!optionThree.classList.contains("unselected")) {
                setBattleText(classAttacksToDisplay[2].attack.description);
            } else if (!optionFour.classList.contains("unselected")) {
                setBattleText(classAttacksToDisplay[3].attack.description);
            }
        }
    }

    // function that will use conditionals to determine which of the above functions to execute on "enter"
    // will need to edit this to make it more universal...

    const executeAction = (e) => {
        const optionOne = document.querySelector(".option-one").children[0];
        const optionTwo = document.querySelector(".option-two").children[0];
        const optionThree = document.querySelector(".option-three").children[0];
        const optionFour = document.querySelector(".option-four").children[0];
        const options = [optionOne, optionTwo, optionThree, optionFour];
        for (let i = 0; i < options.length; i++) {
            if ((e.key === " " || e.key === "Enter") && !options[i].classList.contains("unselected")) {
                // option one = "attack". Open attack menu and set the battle text to option one
                if (classAttacksToDisplay.length === 0) {
                    return;
                }
                if (onActionMenu) {
                    if (i === 0) {
                        setAttackOptionChosen(true);
                        setBattleText(classAttacksToDisplay[i].attack.description);
                        console.log("This is the value of classAttacksToDisplay[i]:", classAttacksToDisplay[i]);
                        setOnActionMenu(false);
                        return;
                    }
                } else if (attackOptionChosen) {
                    removeMenuEventListeners();
                    // calls the playRound function as a ref coming from the BattleLogic component
                    console.log("Attack option chosen");
                    playRoundRef.current(enemyName, classAttacksToDisplay[i]);
                    addMenuEventListeners();
                    return;
                }
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
                    attackOptionChosen={attackOptionChosen}
                    setAttackOptionChosen={setAttackOptionChosen}
                    setOnActionMenu={setOnActionMenu}
                    battleMenuOpen={battleMenuOpen} />
            </div>
        </>
    )
}

export default BattleScreen;