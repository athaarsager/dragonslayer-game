import { useState, useEffect } from "react";
import axios from "axios";
import "./BattleScreen.css";
import ActionMenu from "../ActionMenu/ActionMenu";
function BattleScreen() {

    const [onActionMenu, setOnActionMenu] = useState(true);
    const [classAttacks, setClassAttacks] = useState([]);
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
    // variable for controlling progressing textboxes:
    let progress = false;
    // This variable will be used to resolve the promise in playRound();
    let resolveKeyPress = null;

    // putting axios calls here for now. Will very likely need to move them to a different component later
    async function fetchClassAttacks() {
        const response = await axios.get("/api/attacks/4");
        console.log(response.data);
        setClassAttacks(response.data);
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
                setBattleText(classAttacks[0].attack.description);
            } else if (!optionTwo.classList.contains("unselected")) {
                setBattleText(classAttacks[1].attack.description);
            } else if (!optionThree.classList.contains("unselected")) {
                setBattleText(classAttacks[2].attack.description);
            } else if (!optionFour.classList.contains("unselected")) {
                setBattleText(classAttacks[3].attack.description);
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
        if ((e.key === " " || e.key === "Enter") && !optionOne.classList.contains("unselected")) {
            // option one = "attack". Open attack menu and set the battle text to option one
            if (classAttacks.length === 0) {
                return;
            }
            if (onActionMenu) {
                setAttackOptionChosen(true);
                setBattleText(classAttacks[0].attack.description);
                console.log("This is the value of classAttacks[0]:", classAttacks[0]);
                setOnActionMenu(false);
                return;
            } else if (attackOptionChosen) { // This is for when you are selecting the first attack on the attack menu
                playRound(classAttacks[0]);
                return;
            }
        }
    }

    async function playRound(action) {
        document.removeEventListener("keydown", executeAction);
        document.removeEventListener("keydown", displaySelector);
        document.removeEventListener("keydown", renderBattleText);
        if (attackOptionChosen) {
            // need to ensure action is the correct object in the character attacks array
            setBattleMenuOpen(false);
            setBattleText(action.attack.attackText);
            document.addEventListener("keydown", resolveUserInput);
            // Paused on player's attack text
            while (!progress) {
                await progressRound();
            }
            document.removeEventListener("keydown", resolveUserInput);
            // need to reset this variable right away for the next loop
            progress = false;
            const playerDamageDealt = action.attack.power - dragonStats.defense;
            setBattleText(`The dragon takes ${playerDamageDealt} damage!`);
            // change dragon hp here
            // The display will update based on a useEffect asynchronously
            setDragonHp(dragonHp - playerDamageDealt);
            document.addEventListener("keydown", resolveUserInput);
            // Paused on damage dealt by player
            while (!progress) {
                await progressRound();
            }
            document.removeEventListener("keydown", resolveUserInput);
            progress = false;
            // account for if attack inflicts a debuff
            if (action.extra_effect) {
                const statAffected = action.extra_effect.targetStat;
                Object.entries(dragonStats).forEach(([key, value]) => {
                    if (key === statAffected) {
                        value *= action.extra_effect.effectMultiplier;
                        console.log(`Dragon received a debuff. This is the stat affected and its current value: 
                        ${key}: ${value}`);
                    }
                });
                setBattleText(`The dragon's ${statAffected} has been lowered!`);
                document.addEventListener("keydown", resolveUserInput);
                // Paused on status effect inflicted on dragon
                while (!progress) {
                    await progressRound();
                }
                document.removeEventListener("keydown", resolveUserInput);
                progress = false;
            }
        }
        // dragon attacks
        await dragonActs();
        // user needs to progress the text again
        // Paused on damage dealt to player
        document.addEventListener("keydown", resolveUserInput);
        while (!progress) {
            await progressRound();
        }
        document.removeEventListener("keydown", resolveUserInput);
        progress = false;
        // return to main action menu
        setBattleMenuOpen(true);
        setBattleText("Default");
        setAttackOptionChosen(false);
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
                while (!progress) {
                    await progressRound();
                }
                document.removeEventListener("keydown", resolveUserInput);
                progress = false;
                const damageDragonDealt = dragonAttack.attack.power - playerStats.defense;
                if (dragonAttack.extra_effect) {
                    const statAffected = dragonAttack.extra_effect.targetStat;
                    Object.entries(playerStats).forEach(([key, value]) => {
                        if (key === statAffected) {
                            value *= dragonAttack.extra_effect.effectMultiplier;
                            console.log(`Player received a debuff. This is the stat that was affected
                             and its current value: ${key}: ${value}`);
                        }
                    });
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

    // function's sole purpose is to wait for user input and set the appropriate variable
    // to progress the textbox. 
    // Only when this is resolved will the while loop it is called inside be exited
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
            progress = true;
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
        console.log("This is the dragon's max hp:", dragonMaxHp);
        // Perform actions that depend on the updated HP
        const dragonHpDisplay = document.getElementById("dragon-hp");
        if (dragonHpDisplay && dragonHp) {
            const dragonHpWidth = dragonHpDisplay.offsetWidth;
            const newWidth = dragonHpWidth * (dragonHp / dragonMaxHp);
            dragonHpDisplay.style.width = `${newWidth}px`;
            console.log("This is the width after subrating the dragon's hp:", dragonHpDisplay.style.width);
        }
    }, [dragonHp, dragonMaxHp]); // Run this effect whenever dragonHp changes

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
                    classAttacks={classAttacks}
                    attackOptionChosen={attackOptionChosen}
                    setAttackOptionChosen={setAttackOptionChosen}
                    setOnActionMenu={setOnActionMenu}
                    battleMenuOpen={battleMenuOpen} />
            </div>
        </>
    )
}

export default BattleScreen;