import PropTypes from "prop-types";
import { useState } from "react";

function BattleLogic(props) {

    const {
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
        playerHp,
        setPlayerHp,
        enemyAttacks,
        playerMana,
        setBattleMenuOpen,
        attackOptionChosen,
        setAttackOptionChosen,
        setDefendOptionChosen,
        setPrayOptionChosen,
        dragonIsAwaitingPlayerResponse,
        setDragonIsAwaitingPlayerResponse,
        setOnActionMenu,
        playRoundRef,
    } = props;

    // These variables will track when status effects wear off
    // Tracking each stat individually in case multiple buffs/debuffs inflicted at once
    // don't know if that's actually possible with the attacks I designed, but good for theoretical scaling
    const [playerAttackRoundCounter, setPlayerAttackRoundCounter] = useState(0);
    const [playerDefenseRoundCounter, setPlayerDefenseRoundCounter] = useState(0);
    const [enemyAttackRoundCounter, setEnemyAttackRoundCounter] = useState(0);
    const [enemyDefenseRoundCounter, setEnemyDefenseRoundCounter] = useState(0);

    const [lostTurnCounter, setLostTurnCounter] = useState(0);
    const [isBlinded, setIsBlinded] = useState(false);

    const [logicAndReasonUsed, setLogicAndReasonUsed] = useState(false);
    const [dragonIsChargedUp, setDragonIsChargedUp] = useState(false);

    //This variable will be used to resolve the promise in playRound();
    let resolveKeyPress = null;

    let chickenEaten = false;
    // Need a useState variable to go along with this. Otherwise, will just be reset to false
    // each time this component mounts
    // Use normal variables only for things that can be reset each time
    let logicAndReasonUsedThisTurn = false;

    // create the playRound function as a ref so it can be passed to and called from the parent component
    playRoundRef.current = async (enemy, action) => {
        // Adding this variable wasn't strictly necessary, but by the time I found the real bug I created this
        // to prevent, I had already fully integretated it into the function
        let playerRoundStats = { ...currentPlayerStats };
        let enemyRoundStats = { ...currentEnemyStats };
        await playerActs(enemy, action, playerRoundStats, enemyRoundStats);
        // enemy attacks
        // await ensures the program pauses on the async function
        await enemyActs(enemy, action, playerRoundStats, enemyRoundStats);
        // user needs to progress the text again
        // Paused on damage dealt to player
        // The below if surrounding the pause prevents an extra input from being needed
        // by the user after the dragon uses logic and reason
        // Not entirely sure why it works, but it does
        if (!logicAndReasonUsedThisTurn && !dragonIsAwaitingPlayerResponse) {
            await pauseOnText();
        }
        // account for any buffs/debuffs wearing off
        await adjustBuffAndDebuffCounters(enemy);
        // did the dragon eat the chicken on his turn?
        // if so, replace "throw chicken" with "do nothing"
        // Does not update correctly if stored directly in enemyActs function
        if (chickenEaten) {
            const newClassAttacksToDisplay = [...classAttacksToDisplay];
            newClassAttacksToDisplay.splice(3, 1, classAttacks[6]);
            setClassAttacksToDisplay(newClassAttacksToDisplay);
        }
        // return to main action menu
        setBattleMenuOpen(true);
        setBattleText("Default");
        setAttackOptionChosen(false);
        setDefendOptionChosen(false);
        setPrayOptionChosen(false);
        setOnActionMenu(true);
        // need to account for mana usage at some point
        return;
    }

    async function playerActs(enemy, action, playerRoundStats, enemyRoundStats) {
        console.log("These are the playerRoundStats:", playerRoundStats);
        if (attackOptionChosen) {
            await playerAttacks(enemy, action, playerRoundStats, enemyRoundStats);
        } else if (action === "defend") {
            await playerDefends();
        } else if (action === "pray") {
            await playerPrays(playerRoundStats);
        }
        console.log("These are the playerRoundStats at the end of the player's turn:", playerRoundStats);
    }

    async function playerDefends() {
        setBattleMenuOpen(false);
        setBattleText("You hold your weak arms up in self-defense!");
        await pauseOnText();
    }

    async function playerPrays(playerRoundStats) {
        setBattleMenuOpen(false);
        setBattleText("You offer a prayer of desperation to the heavens!");
        await pauseOnText();
        setBattleText("You heal 40 HP!");
        if (playerRoundStats.hp <= 60) {
            // This if statement seems to be the culprit...
            playerRoundStats.hp += 40;
            setPlayerHp(playerRoundStats.hp);
        } else {
            playerRoundStats.hp = 100;
            setPlayerHp(100);
        }
        await pauseOnText();
    }

    async function playerAttacks(enemy, action, playerRoundStats, enemyRoundStats) {
        // need to ensure action is the correct object in the character attacks array
        setBattleMenuOpen(false);
        setBattleText(action.attack.attackText);
        // Paused on player's attack text
        await pauseOnText();
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

            enemyRoundStats.hp -= playerDamageDealt;
            // The display will update based on a useEffect asynchronously
            setDragonHp(enemyRoundStats.hp);
            setCurrentEnemyStats(enemyRoundStats);
            // Paused on damage dealt by player
            await pauseOnText();
        }
        // account for if attack inflicts a debuff
        if (action.extra_Effect && action.extra_Effect.effectMultiplier) {
            const statAffected = action.extra_Effect.targetStat;
            const targetCharacter = action.extra_Effect.targetCharacter;
            let originalStatValue;
            if (targetCharacter === "dragon") {
                const currentEnemyStatsCopy = { ...enemyRoundStats };
                Object.entries(currentEnemyStatsCopy).forEach(([key, value]) => {
                    if (key === statAffected) {
                        originalStatValue = currentEnemyStatsCopy[key];
                        currentEnemyStatsCopy[key] = action.extra_Effect.effectMultiplier;
                        console.log(`Dragon received a debuff. This is the stat affected and its current value: ${key}:
                    ${currentEnemyStatsCopy[key]}`);
                    }
                });
                console.log("Checking for player's attack extra effect. This is the value of currentEnemyStats:", currentEnemyStats);
                setCurrentEnemyStats(currentEnemyStatsCopy);
                // make sure enemyRoundStats stays updated with the status effects inflicted
                enemyRoundStats = { ...currentEnemyStatsCopy };
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
                if (statAffected === "attack" && action.attack.name !== "Charge Sword") {
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
                await pauseOnText();
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
            await pauseOnText();
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

    async function enemyActs(enemy, action, playerRoundStats, enemyRoundStats) {
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
        // account for attacks that have very specific responses from the dragon
        // First, see if dragon used logic and reason last turn and is awaiting response from player
        if (attackOptionChosen && dragonIsAwaitingPlayerResponse) {
            setBattleText(`...I see you won't listen to reason. Typical human.
             Your kind never was wont to do so.`);
            await pauseOnText();
            setBattleText("Very well. Know then that you have chosen this fate for yourself.");
            setDragonIsAwaitingPlayerResponse(false);
            // Alternatively have the charge up text here, but want to give player a full turn to prepare
            await pauseOnText();
            return;
            // Other attacks with specific responses from the dragon
        } else if (attackOptionChosen) {
            if (action.attack.name === "Throw Pitchfork") {
                setBattleText(`The ${enemy} is blinded by the pitchfork in its eye!`);
                return;
            } else if (action.attack.name === "Throw Chicken") {
                setBattleText(`The ${enemy} swallows your chicken in one gulp!`);
                chickenEaten = true;
                return;
            }
        }
        // account for if we are in the second half of the dragon fight
        if (enemyRoundStats.hp <= 500 && enemy === "Dragon" && !logicAndReasonUsed) {
            // Dragon needs to use logic and reason
            const enemyAttack = enemyAttacks[6];
            setBattleText(enemyAttack.attack.attackText);
            // Text box says "The Dragon attempts to persuade you with logic and reason!"
            await pauseOnText();
            setBattleText(`Son of man...what do you stand to gain from my demise?
            Continue on this path, and only Death awaits.`);
            await pauseOnText();

            logicAndReasonUsedThisTurn = true;
            setLogicAndReasonUsed(true);
            setDragonIsAwaitingPlayerResponse(true);
            return;
        } else if (enemyRoundStats.hp <= 500 && enemy === "Dragon" && logicAndReasonUsed && !dragonIsChargedUp) {
            // Dragon needs to charge breath attack
            const enemyAttack = enemyAttacks[3];
            setBattleText(enemyAttack.attack.attackText);
            // Indicate that the dragon is charged up and should use fire breath next turn
            setDragonIsChargedUp(true);
            return;
        } else if (enemyRoundStats.hp <= 500 && enemy === "Dragon" && dragonIsChargedUp) {
            // Dragon needs to use breath attack
            await enemyUsesAttack(enemyAttacks[4], action, playerRoundStats);
            // reset charge
            setDragonIsChargedUp(false);
            return;
        }
        // calculate which attack the enemy uses
        // number of attacks changes based on enemy name
        let randomNumber;
        if (enemy === "Dragon") {
            randomNumber = Math.floor(Math.random() * 3);
        } else {
            randomNumber = Math.floor(Math.random() * 4);
        }
        // Do all the calculations and progress the fight based on what attack the enemy used
        for (let i = 0; i < 3; i++) {
            if (i === randomNumber) {
                await enemyUsesAttack(enemyAttacks[i], action, playerRoundStats);
            }
        }
    }

    async function enemyUsesAttack(enemyAttack, action, playerRoundStats) {
        setBattleText(enemyAttack.attack.attackText);
        // need user input to progress the textbox
        // Paused on dragon's attack text
        document.addEventListener("keydown", resolveUserInput);
        await progressRound();
        console.log(`This is the enemy damage calculation: ${enemyAttack.attack.power} * ${currentEnemyStats.attack} * playerdefense: ${1 / playerRoundStats.defense}`);
        let damageEnemyDealt = (enemyAttack.attack.power * currentEnemyStats.attack) * (1 / playerRoundStats.defense);
        // use the actual action name here because the state update is behind and I don't want to deal with that
        if (action === "defend") {
            damageEnemyDealt *= 0.5;
            console.log("Enemy damage decreased by half:", damageEnemyDealt);
        }
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
            console.log("About to set currentPlayerStats. These are the playerRoundStats:", playerRoundStats);
            playerRoundStats.hp -= damageEnemyDealt;
            if (playerRoundStats.hp < 0) {
                playerRoundStats.hp = 0;
            }
            setPlayerHp(playerRoundStats.hp);
            setCurrentPlayerStats(playerRoundStats);
            return;
        } else {
            setBattleText(`You take ${damageEnemyDealt} damage!`);
            playerRoundStats.hp -= damageEnemyDealt;
            if (playerRoundStats.hp < 0) {
                playerRoundStats.hp = 0;
            }
            setPlayerHp(playerRoundStats.hp);
            setCurrentPlayerStats(playerRoundStats);
            return;
        }
    }

    async function adjustBuffAndDebuffCounters(enemy) {
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
            await pauseOnText();
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
            await pauseOnText();
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
            await pauseOnText();
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
            await pauseOnText();
        }
        if (lostTurnCounter > 0) {
            if (lostTurnCounter === 1 && isBlinded) {
                setLostTurnCounter(0);
                setBattleText(`The ${enemy}'s eye has recovered!`);
                await pauseOnText();
            } else {
                setLostTurnCounter(lostTurnCounter - 1);
            }
        }
    }

    // adds event listeners for progressing text box and progresses the round 
    async function pauseOnText() {
        document.addEventListener("keydown", resolveUserInput);
        await progressRound();
        document.removeEventListener("keydown", resolveUserInput);
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
    return null;
}

// This is apparently deprecated. Do this differently in the future
BattleLogic.propTypes = {
    currentPlayerStats: PropTypes.object.isRequired,
    setCurrentPlayerStats: PropTypes.func.isRequired,
    currentEnemyStats: PropTypes.object.isRequired,
    setCurrentEnemyStats: PropTypes.func.isRequired,
    dragonHp: PropTypes.number.isRequired,
    setDragonHp: PropTypes.func.isRequired,
    classAttacks: PropTypes.array.isRequired,
    classAttacksToDisplay: PropTypes.array.isRequired,
    setClassAttacksToDisplay: PropTypes.func.isRequired,
    swordIsCharged: PropTypes.bool.isRequired,
    setSwordIsCharged: PropTypes.func.isRequired,
    setBattleText: PropTypes.func.isRequired,
    playerHp: PropTypes.number.isRequired,
    setPlayerHp: PropTypes.func.isRequired,
    enemyAttacks: PropTypes.array.isRequired,
    playerMana: PropTypes.number.isRequired,
    setBattleMenuOpen: PropTypes.func.isRequired,
    attackOptionChosen: PropTypes.bool.isRequired,
    setAttackOptionChosen: PropTypes.func.isRequired,
    setDefendOptionChosen: PropTypes.func.isRequired,
    setPrayOptionChosen: PropTypes.func.isRequired,
    dragonIsAwaitingPlayerResponse: PropTypes.bool.isRequired,
    setDragonIsAwaitingPlayerResponse: PropTypes.func.isRequired,
    setOnActionMenu: PropTypes.func.isRequired,
    playRoundRef: PropTypes.object.isRequired
};

export default BattleLogic;