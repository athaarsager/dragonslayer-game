import { useState, useEffect } from "react";
import axios from "axios";
import "./BattleScreen.css";
import ActionMenu from "../ActionMenu/ActionMenu";
function BattleScreen() {

    const [onActionMenu, setOnActionMenu] = useState(true);
    const [classAttacks, setClassAttacks] = useState([]);
    const [classAttacksToDisplay, setClassAttacksToDisplay] = useState([]);
    const [playerStats, setPlayerStats] = useState({});
    const [attackOptionChosen, setAttackOptionChosen] = useState(false);
    const [battleText, setBattleText] = useState("Default");
    const [battleMenuOpen, setBattleMenuOpen] = useState(true);
    const [playerManaDisplay, setPlayerManaDisplay] = useState("");

    const [dragonAttacks, setDragonAttacks] = useState([]);
    const [dragonStats, setDragonStats] = useState({});
    const [dragonHp, setDragonHp] = useState(NaN);
    const [dragonMaxHp, setDragonMaxHp] = useState(NaN);
    const [dragonMana, setDragonMana] = useState(NaN);
    const [playerHp, setPlayerHp] = useState(NaN);
    const [playerMana, setPlayerMana] = useState(NaN);

    // This variable will be used to resolve the promise in playRound();
    let resolveKeyPress = null;

    // putting axios calls here for now. Will very likely need to move them to a different component later
    async function fetchClassAttacks() {
        const response = await axios.get("/api/attacks/4");
        console.log(response.data);
        setClassAttacks(response.data);
        const temporaryClassAttacksArray = [];
        for (let i=0; i < 4; i++) {
            temporaryClassAttacksArray.push(response.data[i]);
        }
        setClassAttacksToDisplay(temporaryClassAttacksArray);
    }

    async function fetchCharacterStats() {
        const response = await axios.get(`/api/stats/4`);
        console.log("These are the character's stats:", response.data[0]);
        setPlayerStats(response.data[0]);
        setPlayerHp(response.data[0].hp);
        setPlayerMana(response.data[0].mana);
        setPlayerManaDisplay(playerMana);
    }

    async function fetchDragonAttacks() {
        const response = await axios.get("/api/attacks/5");
        console.log("These are the dragon's attacks:", response.data);
        setDragonAttacks(response.data);
    }

    async function fetchDragonStats() {
        const response = await axios.get("/api/stats/5");
        console.log("These are the dragon's stats:", response.data[0]);
        setDragonStats(response.data[0]);
        // This might be problematic if page refreshed or component remounts several times
        // don't want to reset hp values accidentally
        setDragonHp(response.data[0].hp);
        setDragonMaxHp(response.data[0].hp);
        setDragonMana(response.data[0].mana);
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
                    playRound(classAttacksToDisplay[i]);
                    return;
                }
            }
        }

    }

    async function playRound(action) {
        document.removeEventListener("keydown", executeAction);
        document.removeEventListener("keydown", displaySelector);
        document.removeEventListener("keydown", renderBattleText);
        console.log("These are the player's stats:", playerStats);
        console.log("These are the dragon's stats:", dragonStats);
        if (attackOptionChosen) {
            // need to ensure action is the correct object in the character attacks array
            setBattleMenuOpen(false);
            setBattleText(action.attack.attackText);
            document.addEventListener("keydown", resolveUserInput);
            // Paused on player's attack text
            await progressRound();
            document.removeEventListener("keydown", resolveUserInput);
            let playerDamageDealt = 0;
            if (action.attack.power !== 0) {
                playerDamageDealt = action.attack.power - dragonStats.defense;
                setBattleText(`The dragon takes ${playerDamageDealt} damage!`);
                // change dragon hp here
                // The display will update based on a useEffect asynchronously
                setDragonHp(dragonHp - playerDamageDealt);
                document.addEventListener("keydown", resolveUserInput);
                // Paused on damage dealt by player
                await progressRound();
                document.removeEventListener("keydown", resolveUserInput);
            }
            // account for if attack inflicts a debuff
            if (action.extra_Effect) {
                const statAffected = action.extra_Effect.targetStat;
                console.log("Attack has extra_Effect. This is the stat affected:", statAffected);
                const currentDragonStats = { ...dragonStats };
                Object.entries(currentDragonStats).forEach(([key, value]) => {
                    if (key === statAffected) {
                        currentDragonStats[key] *= action.extra_Effect.effectMultiplier;
                        console.log(`Dragon received a debuff. This is the stat affected and its current value: 
                        ${currentDragonStats[key]}`);
                    }
                console.log("This is the value of currentDragonStats:", currentDragonStats);
                setDragonStats(currentDragonStats);
                // should include a conditional where if charge sword was already chosen last round
                // it is not allowed to be chosen again and there is some snarky battle text
                if (action.attack.name === "Throw Pitchfork") {
                    const newClassAttacksToDisplay = [...classAttacksToDisplay];
                    newClassAttacksToDisplay.splice(2, 1, classAttacks[4]);
                    console.log("These are the new class attacks to display:", newClassAttacksToDisplay);
                    setClassAttacksToDisplay(newClassAttacksToDisplay);
                }
                });
                // add an if here to account for any special text associated with the attack?
                setBattleText(`The dragon's ${statAffected} has been lowered!`);
                document.addEventListener("keydown", resolveUserInput);
                // Paused on status effect inflicted on dragon
                await progressRound();
                document.removeEventListener("keydown", resolveUserInput);
            }
        }
        // dragon attacks
        // await ensures the program pauses on the async function
        await dragonActs();
        // user needs to progress the text again
        // Paused on damage dealt to player
        document.addEventListener("keydown", resolveUserInput);
        await progressRound();
        document.removeEventListener("keydown", resolveUserInput);
        // return to main action menu
        setBattleMenuOpen(true);
        setBattleText("Default");
        setAttackOptionChosen(false);
        setOnActionMenu(true);
        document.addEventListener("keydown", executeAction);
        document.addEventListener("keydown", displaySelector);
        document.addEventListener("keydown", renderBattleText);
        // need to account for mana usage at some point
        return;
    }

    async function dragonActs() {
        const randomNumber = Math.floor(Math.random() * 3);
        console.log("In dragonActs");
        console.log("This is the random number the dragon has chosen:", randomNumber);
        for (let i = 0; i < 3; i++) {
            if (i === randomNumber) {
                const dragonAttack = dragonAttacks[i];
                setBattleText(dragonAttack.attack.attackText);
                document.addEventListener("keydown", resolveUserInput);
                // need user input to progress the textbox
                // Paused on dragon's attack text
                await progressRound();
                document.removeEventListener("keydown", resolveUserInput);
                const damageDragonDealt = dragonAttack.attack.power - playerStats.defense;
                if (dragonAttack.extra_Effect) {
                    const statAffected = dragonAttack.extra_Effect.targetStat;
                    console.log("dragon's attack has an extra effect. This is the stat affected:", statAffected);
                    const currentPlayerStats = { ...playerStats };
                    Object.entries(currentPlayerStats).forEach(([key, value]) => {
                        if (key === statAffected) {
                            console.log("In loop checking object key values for dragon. This is the key affected:", key);
                            currentPlayerStats[key] *= dragonAttack.extra_Effect.effectMultiplier;
                            console.log(`Player received a debuff. This is the stat that was affected
                             and its current value: ${currentPlayerStats[key]}`);
                        }
                    setPlayerStats(currentPlayerStats);
                    });
                    // add if here to account for any special text with the status effect?
                    setBattleText(`You take ${damageDragonDealt} damage and your ${statAffected} has been lowered!`);
                    setPlayerHp(playerHp - damageDragonDealt);
                    console.log("This is the player's hp:", playerHp);
                    return;
                } else {
                    setBattleText(`You take ${damageDragonDealt} damage!`);
                    setPlayerHp(playerHp - damageDragonDealt);
                    console.log("This is the player's hp:", playerHp);
                    return;
                }
            }
        }
    }

    // function's sole purpose is to wait for user input and prevent playRound from continuing
    // until that user input is received
    function progressRound() {
        return new Promise((resolve) => {
            // This is what changes resolveKeyPress from null to truthy
            // when it is resolved in the below function, it resolves it here as well
            resolveKeyPress = resolve;
        });
    }

    // This function uses
    function resolveUserInput(e) {
        if (resolveKeyPress && (e.key === " " || e.key === "Enter")) {
            resolveKeyPress(); // Resolve the Promise when the desired key is pressed
            resolveKeyPress = null; // Reset the resolveKeyPress variable
        }
    }

    useEffect(() => {
        fetchClassAttacks();
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