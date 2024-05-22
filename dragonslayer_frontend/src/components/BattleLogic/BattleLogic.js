import PropTypes from "prop-types";

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
    } = props;

    //This variable will be used to resolve the promise in playRound();
    let resolveKeyPress = null;
    let chickenEaten = false;

    // create the playRound function as a ref so it can be passed to and called from the parent component
    playRoundRef.current = async (enemy, action) => {
        // should include a conditional where if charge sword was already chosen last round
        // it is not allowed to be chosen again and there is some snarky battle text
        console.log("in playRoundRef");
        if (action.attack.name === "Charge Sword" && swordIsCharged) {
            return;
        }
        console.log("These are the player's stats:", currentPlayerStats);
        console.log("These are the dragon's stats:", currentEnemyStats);
        let playerRoundStats = { ...currentPlayerStats };
        await playerActs(enemy, action, playerRoundStats);
        // enemy attacks
        // await ensures the program pauses on the async function
        await EnemyActs(enemy, action, playerRoundStats);
        // user needs to progress the text again
        // Paused on damage dealt to player
        await pauseOnText();
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
        // need to account for mana usage at some point
        return;
    }

    async function playerActs(enemy, action, playerRoundStats) {
        // Adding this variable wasn't strictly necessary, but by the time I found the real bug I created this
        // to prevent, I had already fully integretated it into the function
        if (attackOptionChosen) {
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
                // The display will update based on a useEffect asynchronously
                setDragonHp(dragonHp - playerDamageDealt);

                // Paused on damage dealt by player
                await pauseOnText();
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
    }

    async function EnemyActs(enemy, action, playerRoundStats) {
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
    playerAttackRoundCounter: PropTypes.number.isRequired,
    setPlayerAttackRoundCounter: PropTypes.func.isRequired,
    playerDefenseRoundCounter: PropTypes.number.isRequired,
    setPlayerDefenseRoundCounter: PropTypes.func.isRequired,
    enemyAttackRoundCounter: PropTypes.number.isRequired,
    setEnemyAttackRoundCounter: PropTypes.func.isRequired,
    enemyDefenseRoundCounter: PropTypes.number.isRequired,
    setEnemyDefenseRoundCounter: PropTypes.func.isRequired,
    lostTurnCounter: PropTypes.number.isRequired,
    setLostTurnCounter: PropTypes.func.isRequired,
    isBlinded: PropTypes.bool.isRequired,
    setIsBlinded: PropTypes.func.isRequired,
    playerHp: PropTypes.number.isRequired,
    setPlayerHp: PropTypes.func.isRequired,
    enemyAttacks: PropTypes.array.isRequired,
    playerMana: PropTypes.number.isRequired,
    setBattleMenuOpen: PropTypes.func.isRequired,
    attackOptionChosen: PropTypes.bool.isRequired,
    setAttackOptionChosen: PropTypes.func.isRequired,
    setOnActionMenu: PropTypes.func.isRequired,
    playRoundRef: PropTypes.object.isRequired,
};

export default BattleLogic;