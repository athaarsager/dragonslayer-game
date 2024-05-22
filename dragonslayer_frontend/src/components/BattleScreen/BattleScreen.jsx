import { useState, useEffect } from "react";
import axios from "axios";
import "./BattleScreen.css";
import ActionMenu from "../ActionMenu/ActionMenu";
function BattleScreen() {

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
    
    // This variable did not update in time when it was a useState variable
    let chickenEaten = false;
    // This variable will be used to resolve the promise in playRound();
    let resolveKeyPress = null;

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
                    playRound(enemyName, classAttacksToDisplay[i]);
                    return;
                }
            }
        }

    }

    async function playRound(enemy, action) {
        // should include a conditional where if charge sword was already chosen last round
        // it is not allowed to be chosen again and there is some snarky battle text
        if (action.attack.name === "Charge Sword" && swordIsCharged) {
            return;
        }
        document.removeEventListener("keydown", executeAction);
        document.removeEventListener("keydown", displaySelector);
        document.removeEventListener("keydown", renderBattleText);
        console.log("These are the player's stats:", currentPlayerStats);
        console.log("These are the dragon's stats:", currentEnemyStats);
        // Adding this variable wasn't strictly necessary, but by the time I found the real bug I created this
        // to prevent, I had already fully integretated it into the function
        let playerRoundStats = { ...currentPlayerStats };
        if (attackOptionChosen) {
            // need to ensure action is the correct object in the character attacks array
            setBattleMenuOpen(false);
            setBattleText(action.attack.attackText);
            document.addEventListener("keydown", resolveUserInput);
            // Paused on player's attack text
            await progressRound();
            document.removeEventListener("keydown", resolveUserInput);
            let playerDamageDealt = 0;
            if (action.attack.name === "Charge Sword") {
                setSwordIsCharged(true);
            }
            if (action.attack.power !== 0) {
                console.log(
                    `This is the playerDamage calculation:
                    ${action.attack.power},
                    ${currentPlayerStats.attack},
                    ${currentEnemyStats.defense}
                `);
                // account for if player is trying to apply their charged sword buff to their pitchfork. Not allowed
                if (action.attack.name === "Throw Pitchfork" && swordIsCharged) {
                    playerDamageDealt = (action.attack.power) * (1 / currentEnemyStats.defense);
                } else {
                    playerDamageDealt = (action.attack.power * currentPlayerStats.attack) * (1 / currentEnemyStats.defense);
                }
                setBattleText(`The ${enemy} takes ${playerDamageDealt} damage!`);
                // change dragon hp here
                // The display will update based on a useEffect asynchronously
                setDragonHp(dragonHp - playerDamageDealt);
                document.addEventListener("keydown", resolveUserInput);
                // Paused on damage dealt by player
                await progressRound();
                document.removeEventListener("keydown", resolveUserInput);
            }
            // account for if attack inflicts a debuff
            if (action.extra_Effect && action.extra_Effect.effectMultiplier) {
                const statAffected = action.extra_Effect.targetStat;
                const targetCharacter = action.extra_Effect.targetCharacter;
                let originalStatValue;
                if (targetCharacter === "dragon") {
                    const currentEnemyStatsCopy = { ...currentEnemyStats };
                    Object.entries(currentEnemyStatsCopy).forEach(([key, value]) => {
                        if (key === statAffected) {
                            originalStatValue = currentEnemyStatsCopy[key];
                            currentEnemyStatsCopy[key] = action.extra_Effect.effectMultiplier;
                            console.log(`Dragon received a debuff. This is the stat affected and its current value: ${key}:
                        ${currentEnemyStatsCopy[key]}`);
                        }
                    });
                    console.log("This is the value of currentEnemyStats:", currentEnemyStats);
                    setCurrentEnemyStats(currentEnemyStatsCopy);
                    // set the counter for how long the status effect will last
                    if (statAffected === "defense") {
                        setEnemyDefenseRoundCounter(3);
                    } else if (statAffected === "attack") {
                        setEnemyAttackRoundCounter(3);
                    }
                    // add an if here to account for any special text associated with the attack?
                    // This if takes care of letting the player know that debuffs don't stack
                    if (originalStatValue < 1) {
                        setBattleText(`The ${enemy}'s ${statAffected} won't go any lower!`);
                    } else {
                        setBattleText(`The ${enemy}'s ${statAffected} has been lowered!`);
                    }
                } else if (targetCharacter === "player") {
                    Object.entries(playerRoundStats).forEach(([key, value]) => {
                        if (key === statAffected) {
                            originalStatValue = playerRoundStats[key];
                            playerRoundStats[key] = action.extra_Effect.effectMultiplier;
                            console.log(`Play received a buff. This is the stat affected and its current value: ${key}:
                            ${playerRoundStats[key]}`);
                        }
                    });
                    console.log("This is the value of playerRoundStats:", playerRoundStats);
                    setCurrentPlayerStats(playerRoundStats);
                    if (statAffected === "attack") {
                        setPlayerAttackRoundCounter(3);
                        // need to ensure below if does not apply if player is just drawing near to dragon for one turn
                    } else if (statAffected === "defense" && action.attack.name !== "Fetch Pitchfork" && action.attack.name !== "Fetch Chicken") {
                        setPlayerDefenseRoundCounter(3);
                    }
                    // lets player know that buffs don't stack
                    if (originalStatValue > 1) {
                        setBattleText(`Your ${statAffected} won't go any higher!`);
                    } else if (action.attack.name !== "Fetch Pitchfork") {
                        setBattleText(`Your ${statAffected} has increased!`);
                    }
                }
                if (action.attack.name !== "Fetch Pitchfork" && action.attack.name !== "Fetch Chicken") {
                    // Paused on status effect inflicted on player or dragon
                    document.addEventListener("keydown", resolveUserInput);
                    await progressRound();
                    document.removeEventListener("keydown", resolveUserInput);
                }
                // evaluate if the dragon should lose turns
                if (action.extra_Effect.turnsLost) {
                    setLostTurnCounter(action.extra_Effect.turnsLost);
                }
            }
            // evaluating the special effects of individual attacks below:
            // reset attack after swinging charged sword
            if (action.attack.name === "Sword Attack" && swordIsCharged) {
                setSwordIsCharged(false);
                Object.entries(playerRoundStats).forEach(([key, value]) => {
                    if (key === "attack") {
                        playerRoundStats[key] = 1;
                    }
                });
                setCurrentPlayerStats(playerRoundStats);
                setBattleText("You let go of your sword with one hand like the clumsy peasant you are, returning your attack to normal.");
                document.addEventListener("keydown", resolveUserInput);
                await progressRound();
                document.removeEventListener("keydown", resolveUserInput);
            }
            if (action.attack.name === "Throw Pitchfork") {
                const newClassAttacksToDisplay = [...classAttacksToDisplay];
                newClassAttacksToDisplay.splice(2, 1, classAttacks[4]);
                console.log("These are the new class attacks to display:", newClassAttacksToDisplay);
                setClassAttacksToDisplay(newClassAttacksToDisplay);
                setIsBlinded(true);
            }
            if (action.attack.name === "Fetch Pitchfork") {
                const newClassAttacksToDisplay = [...classAttacksToDisplay];
                newClassAttacksToDisplay.splice(2, 1, classAttacks[2]);
                setClassAttacksToDisplay(newClassAttacksToDisplay);
            }
            if (action.attack.name === "Throw Chicken") {
                const newClassAttacksToDisplay = [...classAttacksToDisplay];
                newClassAttacksToDisplay.splice(3, 1, classAttacks[5]);
                setClassAttacksToDisplay(newClassAttacksToDisplay);
            }
            if (action.attack.name === "Fetch Chicken") {
                const newClassAttacksToDisplay = [...classAttacksToDisplay];
                newClassAttacksToDisplay.splice(3, 1, classAttacks[3]);
                setClassAttacksToDisplay(newClassAttacksToDisplay);
            }
        }
        // dragon attacks
        // await ensures the program pauses on the async function
        await EnemyActs(enemy, playerRoundStats, action);
        // user needs to progress the text again
        // Paused on damage dealt to player
        document.addEventListener("keydown", resolveUserInput);
        await progressRound();
        document.removeEventListener("keydown", resolveUserInput);

        // account for any buffs/debuffs wearing off
        if (playerAttackRoundCounter > 1) {
            setPlayerAttackRoundCounter(playerAttackRoundCounter - 1);
        } else if (playerAttackRoundCounter === 1) {
            setPlayerAttackRoundCounter(0);
            setBattleText("Your attack returns to normal.");
            // adjust player attack here. Is there a way to access a key in a useState variable?
            setCurrentPlayerStats(prevState => ({
                ...prevState,
                attack: 1
            }));
            document.addEventListener("keydown", resolveUserInput);
            await progressRound();
            document.removeEventListener("keydown", resolveUserInput);
        }
        if (playerDefenseRoundCounter > 1) {
            setPlayerDefenseRoundCounter(playerDefenseRoundCounter - 1);
        } else if (playerDefenseRoundCounter === 1) {
            setPlayerDefenseRoundCounter(0);
            setBattleText("Your defense returns to normal.");
            setCurrentPlayerStats(prevState => ({
                ...prevState,
                defense: 1
            }));
            document.addEventListener("keydown", resolveUserInput);
            await progressRound();
            document.removeEventListener("keydown", resolveUserInput);
        }
        if (enemyAttackRoundCounter > 1) {
            setEnemyAttackRoundCounter(enemyAttackRoundCounter - 1);
        } else if (enemyAttackRoundCounter === 1) {
            setEnemyAttackRoundCounter(0);
            setBattleText(`The ${enemy}'s attack returns to normal.`);
            setCurrentEnemyStats(prevState => ({
                ...prevState,
                attack: 1
            }));
            document.addEventListener("keydown", resolveUserInput);
            await progressRound();
            document.removeEventListener("keydown", resolveUserInput);
        }
        if (enemyDefenseRoundCounter > 1) {
            setEnemyDefenseRoundCounter(enemyDefenseRoundCounter - 1);
        } else if (enemyDefenseRoundCounter === 1) {
            setEnemyDefenseRoundCounter(0);
            setBattleText(`The ${enemy}'s defense returns to normal.`);
            setCurrentEnemyStats(prevState => ({
                ...prevState,
                defense: 1
            }));
            document.addEventListener("keydown", resolveUserInput);
            await progressRound();
            document.removeEventListener("keydown", resolveUserInput);
        }
        if (lostTurnCounter > 0) {
            if (lostTurnCounter === 1 && isBlinded) {
                setLostTurnCounter(0);
                setBattleText(`The ${enemy}'s eye has recovered!`);
                document.addEventListener("keydown", resolveUserInput);
                await progressRound();
                document.removeEventListener("keydown", resolveUserInput);
            } else {
                setLostTurnCounter(lostTurnCounter - 1);
            }
        }
        // did the dragon eat the chicken on his turn?
        console.log("This is the value of chickenEaten:", chickenEaten);
        if (chickenEaten) {
            // appears to be one behind
            const newClassAttacksToDisplay = [...classAttacksToDisplay];
            newClassAttacksToDisplay.splice(3, 1, classAttacks[6]);
            setClassAttacksToDisplay(newClassAttacksToDisplay);
        }
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

    async function EnemyActs(enemy, playerRoundStats, action) {
        if (lostTurnCounter > 0) {
            if (isBlinded) {
                if (lostTurnCounter === 2) {
                    setBattleText(`The ${enemy} is distracted by its eye pain!`);
                } else if (lostTurnCounter === 1) {
                    setBattleText(`The ${enemy} is trying to blink its pain away!`);
                }
            }
            return;
        }
        if (action.attack.name === "Throw Pitchfork") {
            setBattleText(`The ${enemy} is blinded by the pitchfork in its eye!`);
            return;
        } else if (action.attack.name === "Throw Chicken") {
            setBattleText(`The ${enemy} swallows your chicken in one gulp!`);
            chickenEaten = true;
            return;
        }
        const randomNumber = Math.floor(Math.random() * 3);
        console.log("This is the random number the enemy has chosen:", randomNumber);
        for (let i = 0; i < 3; i++) {
            if (i === randomNumber) {
                const enemyAttack = enemyAttacks[i];
                setBattleText(enemyAttack.attack.attackText);
                document.addEventListener("keydown", resolveUserInput);
                // need user input to progress the textbox
                // Paused on dragon's attack text
                await progressRound();
                document.removeEventListener("keydown", resolveUserInput);
                const damageEnemyDealt = (enemyAttack.attack.power * currentEnemyStats.attack) * (1 / currentPlayerStats.defense);
                if (enemyAttack.extra_Effect) {
                    const statAffected = enemyAttack.extra_Effect.targetStat;
                    let originalStatValue;
                    console.log("dragon's attack has an extra effect. This is the stat affected:", statAffected);
                    if (Object.keys(playerRoundStats).length === 0) {
                        playerRoundStats = { ...currentPlayerStats };
                    }
                    Object.entries(playerRoundStats).forEach(([key, value]) => {
                        if (key === statAffected) {
                            console.log("In enemy's attack's debuff. This is the value of currentPlayerStats:", currentPlayerStats);
                            console.log("In same spot, this is the value of the playerRoundStats:", playerRoundStats);
                            originalStatValue = playerRoundStats[key];
                            playerRoundStats[key] = enemyAttack.extra_Effect.effectMultiplier;
                            console.log(`Player received a debuff. This is the stat that was affected
                             and its current value: ${playerRoundStats[key]}`);
                        }
                    });
                    // Adjust round counter for player buffs/debuffs
                    setCurrentPlayerStats(playerRoundStats);
                    if (statAffected === "attack") {
                        setPlayerAttackRoundCounter(3);
                    } else if (statAffected === "defense") {
                        setPlayerDefenseRoundCounter(3);
                    }
                    // add if here to account for any special text with the status effect?
                    if (originalStatValue < 1) {
                        setBattleText(`You take ${damageEnemyDealt} damage, but your ${statAffected} will not go any lower!`);
                    } else {
                        setBattleText(`You take ${damageEnemyDealt} damage and your ${statAffected} has been lowered!`);
                    }
                    setPlayerHp(playerHp - damageEnemyDealt);
                    console.log("This is the player's hp:", playerHp);
                    return;
                } else {
                    setBattleText(`You take ${damageEnemyDealt} damage!`);
                    setPlayerHp(playerHp - damageEnemyDealt);
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