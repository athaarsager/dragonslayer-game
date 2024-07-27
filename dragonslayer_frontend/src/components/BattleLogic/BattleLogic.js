import PropTypes from "prop-types";
import { useState } from "react";

function BattleLogic(props) {

    const {
        currentPlayerStats,
        setCurrentPlayerStats,
        currentEnemyStats,
        setCurrentEnemyStats,
        setDragonHp,
        classAttacks,
        classAttacksToDisplay,
        setClassAttacksToDisplay,
        swordIsCharged,
        setSwordIsCharged,
        setBattleText,
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
        setGameOver,
        selectRandomBattleText,
        battleMenuTextRef,
        badEndingText,
        setTimeForDragonToFade,
        setBadEndingReached,
        playRoundRef,
        resetBattleStatsRef
    } = props;

    // These variables will track when status effects wear off
    // Tracking each stat individually in case multiple buffs/debuffs inflicted at once
    // don't know if that's actually possible with the attacks I designed, but good for theoretical scaling
    const [playerAttackRoundCounter, setPlayerAttackRoundCounter] = useState(0);
    const [playerDefenseRoundCounter, setPlayerDefenseRoundCounter] = useState(0);
    const [enemyAttackRoundCounter, setEnemyAttackRoundCounter] = useState(0);
    const [enemyDefenseRoundCounter, setEnemyDefenseRoundCounter] = useState(0);

    const [lostTurnCounter, setLostTurnCounter] = useState(0);
    const [eyesBlinded, setEyesBlinded] = useState(0);
    const [isBlinded, setIsBlinded] = useState(false);


    const [logicAndReasonUsed, setLogicAndReasonUsed] = useState(false);
    const [dragonIsChargedUp, setDragonIsChargedUp] = useState(false);

    // resets states stored specifically in BattleLogic.js
    resetBattleStatsRef.current = () => {
        setPlayerAttackRoundCounter(0);
        setPlayerDefenseRoundCounter(0);
        setEnemyAttackRoundCounter(0);
        setEnemyDefenseRoundCounter(0);
        setLostTurnCounter(0);
        setEyesBlinded(0);
        setIsBlinded(false);
        setLogicAndReasonUsed(false);
        setDragonIsChargedUp(false);
        setTimeForDragonToFade(false);
    }

    //This variable will be used to resolve the promise in playRound();
    let resolveKeyPress = null;
    // This variable can be normal because it only matters for the turn it happens in
    let chickenThrown = false;
    let chickenEaten = false;
    // Need a useState variable to go along with this. Otherwise, will just be reset to false
    // each time this component mounts
    // Use normal variables only for things that can be reset each time
    let logicAndReasonUsedThisTurn = false;
    let dragonChargedUpThisTurn = false;

    // variable for triggering the bad ending
    let dragonIsDead = false;

    // create the playRound function as a ref so it can be passed to and called from the parent component
    playRoundRef.current = async (enemy, action) => {
        // Adding this variable wasn't strictly necessary, but by the time I found the real bug I created this
        // to prevent, I had already fully integretated it into the function
        let playerRoundStats = { ...currentPlayerStats };
        let enemyRoundStats = { ...currentEnemyStats };
        console.log("At top of round. This is the value of eyesBlinded:", eyesBlinded);
        await playerActs(enemy, action, playerRoundStats, enemyRoundStats);
        await enemyActs(enemy, action, playerRoundStats, enemyRoundStats);
        // The below if surrounding the pause prevents an extra input from being needed
        // by the user after the dragon uses logic and reason
        // Not entirely sure why it works, but it does
        if (!logicAndReasonUsedThisTurn && !dragonIsAwaitingPlayerResponse && !dragonIsDead) {
            await pauseOnText();
        }
        // account for any buffs/debuffs wearing off
        // Make sure debuff wearing off message only displays if player still alive
        if (playerRoundStats.hp > 0) {
            await adjustBuffAndDebuffCounters(enemy);
        }
        // did the dragon eat the chicken on his turn?
        // if so, replace "throw chicken" with "do nothing"
        // Does not update correctly if stored directly in enemyActs function
        if (chickenEaten) {
            updateClassAttacksToDisplay(3, 6);
        }
        if (playerRoundStats.hp <= 0) {
            // setGameOver(true);
        }
        // return to main action menu if dragon isn't dead
        if (!dragonIsDead) {
            setBattleMenuOpen(true);
            determineBattleText();
            setBattleText(battleMenuTextRef.current);
            setAttackOptionChosen(false);
            setDefendOptionChosen(false);
            setPrayOptionChosen(false);
            setOnActionMenu(true);
            // need to account for mana usage at some point
            return;
        } else {
            await playBadEnding();
        }
    }

    async function playerActs(enemy, action, playerRoundStats, enemyRoundStats) {
        console.log("These are the playerRoundStats:", playerRoundStats);
        if (attackOptionChosen) {
            if (action.attack.name === "Eat Chicken Nuggets") {
                await playerHeals(playerRoundStats, action);
                updateClassAttacksToDisplay(3, 8);
            } else {
                await playerAttacks(enemy, action, playerRoundStats, enemyRoundStats);
            }
        } else if (action === "defend") {
            await playerDefends();
        } else if (action === "pray") {
            await playerHeals(playerRoundStats, action);
            console.log("The player just healed. Here is their current stats:", playerRoundStats);
        }
        console.log("These are the playerRoundStats at the end of the player's turn:", playerRoundStats);
    }

    async function playerDefends() {
        setBattleMenuOpen(false);
        setBattleText("You hold your weak arms up in self-defense!");
        await pauseOnText();
    }

    async function playerHeals(playerRoundStats, action) {
        setBattleMenuOpen(false);
        const healAmount = 80;
        if (action === "pray") {
            setBattleText("You offer a prayer of desperation to the heavens!");
            await pauseOnText();
            setBattleText(`You heal ${healAmount} HP!`);
            if (playerRoundStats.hp <= 100 - healAmount) {
                playerRoundStats.hp += healAmount;
                setPlayerHp(playerRoundStats.hp);
            } else {
                playerRoundStats.hp = 100;
                setPlayerHp(100);
            }
            // This takes care of when you heal from eating the chicken
        } else {
            setBattleText(action.attack.attackText);
            await pauseOnText();
            setBattleText("The tenderness of your friend's love (and flesh) restores you to full health!");
            setPlayerHp(100);
        }
        // ensure healing passes on to next round
        setCurrentPlayerStats(playerRoundStats);
        await pauseOnText();
    }

    async function playerAttacks(enemy, action, playerRoundStats, enemyRoundStats) {
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
            // The use effect takes care of making sure hp does not show below 0 on screen, so don't need to worry about that here
            if (enemyRoundStats.hp <= 0) {
                dragonIsDead = true;
            }
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
                // eslint-disable-next-line no-unused-vars
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
                // eslint-disable-next-line no-unused-vars
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
        }
        // evaluating the special effects of individual attacks below:
        // reset attack after swinging charged sword
        if (action.attack.name === "Sword Attack" && swordIsCharged) {
            setSwordIsCharged(false);
            // eslint-disable-next-line no-unused-vars
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
            updateClassAttacksToDisplay(2, 4);
            if (eyesBlinded <= 2 && !logicAndReasonUsed) {
                setEyesBlinded(eyesBlinded + 1);
                setIsBlinded(true);
                if (eyesBlinded + 1 <= 2) {
                    setLostTurnCounter(action.extra_Effect.turnsLost);
                }
            }
        }
        if (action.attack.name === "Fetch Pitchfork") {
            updateClassAttacksToDisplay(2, 2);
        }
        if (action.attack.name === "Throw Chicken") {
            updateClassAttacksToDisplay(3, 5);
            // This variable is only checked to see if the chicken is burnt
            // to a crisp by the dragon's breath attack
            chickenThrown = true;
        }
        if (action.attack.name === "Fetch Chicken") {
            updateClassAttacksToDisplay(3, 3);
        }
    }

    async function enemyActs(enemy, action, playerRoundStats, enemyRoundStats) {
        if (dragonIsDead) {
            return;
        }
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
            if (action.attack.name === "Throw Pitchfork" && eyesBlinded < 2 && !logicAndReasonUsed) {
                setBattleText(`The ${enemy} is blinded by the pitchfork in its eye!`);
                return;
            } else if (action.attack.name === "Throw Pitchfork" && eyesBlinded >= 2 && !logicAndReasonUsed) {
                setBattleText(`The ${enemy} closed both eyes to avoid being blinded. It's learning!`);
                await pauseOnText();
            } else if (action.attack.name === "Throw Pitchfork" && logicAndReasonUsed) {
                setBattleText(`The ${enemy} closed both eyes to avoid being blinded. It's done playing around.`);
                await pauseOnText();
            } else if (action.attack.name === "Throw Chicken" && !dragonIsChargedUp) {
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
            dragonChargedUpThisTurn = true;
            return;
        } else if (enemyRoundStats.hp <= 500 && enemy === "Dragon" && dragonIsChargedUp) {
            // Dragon needs to use breath attack
            if (chickenThrown) {
                setBattleText(enemyAttacks[4].attack.attackText);
                await pauseOnText();
                setBattleText("With a mightly cluck, your lucky chicken flies in front of the flames, shielding you from the blast!");
                // Somewhere include the text: "The smell of dragon-fried chicken fills your nostrils"
                // Probably on main battle screen textbox
                // Replace fetch chicken with eat chicken nuggets
                updateClassAttacksToDisplay(3, 7);
            } else {
                await enemyUsesAttack(enemyAttacks[4], action, playerRoundStats);
            }
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
        // Also prevents stat buffs/debuffs from lasting more than this one turn
        if (action === "defend") {
            damageEnemyDealt *= 0.5;
            console.log("Enemy damage decreased by half:", damageEnemyDealt);
        }
        if (action === "Fetch Pitchfork") {
            damageEnemyDealt *= 2;
            console.log("Enemy damage doubled because player drew close:", damageEnemyDealt);
        }
        if (action === "Fetch Chicken") {
            damageEnemyDealt *= 2;
            console.log("Enemy damage doubled because player drew close:", damageEnemyDealt);
        }
        if (enemyAttack.extra_Effect) {
            const statAffected = enemyAttack.extra_Effect.targetStat;
            let originalStatValue;
            console.log("Enemy's attack has an extra effect. This is the stat affected:", statAffected);
            if (Object.keys(playerRoundStats).length === 0) {
                playerRoundStats = { ...currentPlayerStats };
            }
            // eslint-disable-next-line no-unused-vars
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
            // Need this here so that hp updates on screen before message displays
            if (playerRoundStats.hp <= 0) {
                setBattleText("You crumple to the ground in agony as you die. Disappointing. So much for you being the hero.");
            }
            return;
        } else {
            setBattleText(`You take ${damageEnemyDealt} damage!`);
            playerRoundStats.hp -= damageEnemyDealt;
            if (playerRoundStats.hp < 0) {
                playerRoundStats.hp = 0;
            }
            setPlayerHp(playerRoundStats.hp);
            setCurrentPlayerStats(playerRoundStats);
            // Need this here so that hp updates on screen before message displays
            if (playerRoundStats.hp <= 0) {
                setBattleText("You crumple to the ground in agony as you die. Disappointing. So much for you being the hero.");
            }
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

    async function playBadEnding() {
        await playBadEndDragonDialog();
        setTimeForDragonToFade(true);
        setBadEndingReached(true);
        setBattleText("");
        setAttackOptionChosen(false);
    }

    // Plays through the lines the dragon says for the bad ending. These will just be in the battle text textbox
    async function playBadEndDragonDialog() {
        for (let i = 0; i < 4; i++) {
            setBattleText(badEndingText[i].text);
            await pauseOnText();
        }
    }
    // adds event listeners for progressing text box and progresses the round 
    async function pauseOnText() {
        document.addEventListener("keydown", resolveUserInput);
        await progressRound();
        document.removeEventListener("keydown", resolveUserInput);
    }

    function updateClassAttacksToDisplay(currentIndex, newAttackIndex) {
        const newClassAttacksToDisplay = [...classAttacksToDisplay];
        newClassAttacksToDisplay.splice(currentIndex, 1, classAttacks[newAttackIndex]);
        setClassAttacksToDisplay(newClassAttacksToDisplay);
    }

    function determineBattleText() {
        if (logicAndReasonUsedThisTurn) {
            battleMenuTextRef.current = "The Dragon is planning something! Don't listen to him!";
        // logic for determining when to display the hint for using you chicken
        } else if(dragonChargedUpThisTurn && classAttacksToDisplay[3].attack.name === "Do Nothing") {
            battleMenuTextRef.current = "You wish your lucky chicken was still here so you didn't have to face this alone...";
        } else if(dragonChargedUpThisTurn && classAttacksToDisplay[3].attack.name === "Throw Chicken") { 
            battleMenuTextRef.current = "Your lucky chicken looks at you meaningfully. Does he have an idea?";
        // display normal text at end of round
        } else {
            battleMenuTextRef.current = selectRandomBattleText();
        } 
    }

    // function's sole purpose is to wait for user input and prevent pauseOnText from continuing
    // until that user input is received
    function progressRound() {
        return new Promise((resolve) => {
            // This is what changes resolveKeyPress from null to truthy
            // when it is resolved in the below function, it resolves it here as well
            // resolve is a function that is assigned to a variable here so it can be accessed
            // outside of the promise
            resolveKeyPress = resolve;
        });
    }

    // This function is added via event listener and executes when a key is pressed
    function resolveUserInput(e) {
        // resolveKeyPress is set to a value whenever progressRound is called
        if (resolveKeyPress && (e.key === " " || e.key === "Enter")) {
            resolveKeyPress(); // Resolve the Promise when the desired key is pressed thanks to the resolve function stored in this variable
            resolveKeyPress = null; // Reset the resolveKeyPress variable
        }
    }
    return null;
}

BattleLogic.propTypes = {
    currentPlayerStats: PropTypes.object.isRequired,
    setCurrentPlayerStats: PropTypes.func.isRequired,
    currentEnemyStats: PropTypes.object.isRequired,
    setCurrentEnemyStats: PropTypes.func.isRequired,
    setDragonHp: PropTypes.func.isRequired,
    classAttacks: PropTypes.array.isRequired,
    classAttacksToDisplay: PropTypes.array.isRequired,
    setClassAttacksToDisplay: PropTypes.func.isRequired,
    swordIsCharged: PropTypes.bool.isRequired,
    setSwordIsCharged: PropTypes.func.isRequired,
    setBattleText: PropTypes.func.isRequired,
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
    setGameOver: PropTypes.func.isRequired,
    selectRandomBattleText: PropTypes.func.isRequired,
    battleMenuTextRef: PropTypes.object.isRequired,
    badEndingText: PropTypes.array.isRequired,
    setTimeForDragonToFade: PropTypes.func.isRequired,
    setBadEndingReached: PropTypes.func.isRequired,
    playRoundRef: PropTypes.object.isRequired,
    resetBattleStatsRef: PropTypes.object.isRequired
};

export default BattleLogic;