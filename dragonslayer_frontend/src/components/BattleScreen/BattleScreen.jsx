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
    const [playerHpDisplay, setPlayerHpDisplay] = useState("");
    const [playerManaDisplay, setPlayerManaDisplay] = useState("");

    let dragonAttacks = [];
    let dragonStats = {};
    let dragonHp;
    let dragonMana;
    let playerHp;
    let playerMana;
    let waitingForUserInput = false;
    // variable for controlling progressing textboxes:
    let progress = false;

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
        playerHp = response.data[0].hp;
        playerMana = response.data[0].mana;
        setPlayerHpDisplay(playerHp);
        setPlayerManaDisplay(playerMana);
    }

    async function fetchDragonAttacks() {
        const response = await axios.get("/api/attacks/5");
        console.log("These are the dragon's attacks:", response.data);
        dragonAttacks = response.data;
    }

    async function fetchDragonStats() {
        const response = await axios.get("/api/stats/5");
        console.log("These are the dragon's stats:", response.data[0]);
        dragonStats = response.data[0];
        // This might be problematic if page refreshed or component remounts several times
        // don't want to reset hp values accidentally
        dragonHp = dragonStats.hp;
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
        //e.preventDefault();
        const optionOne = document.querySelector(".option-one").children[0];
        const optionTwo = document.querySelector(".option-two").children[0];
        const optionThree = document.querySelector(".option-three").children[0];
        const optionFour = document.querySelector(".option-four").children[0];
        if ((e.key === " " || e.key === "Enter") && !optionOne.classList.contains("unselected")) {
            // option one = "attack". Open attack menu and set the battle text to option one
            if (onActionMenu) {
                setAttackOptionChosen(true);
                // This line right here is doing nothing to the state of battleText
                setBattleText(classAttacks[0].attack.description);
                setOnActionMenu(false);
            }
        }
    }

    function playRound(action) {
        if (attackOptionChosen) {
            // need to ensure action is the correct object in the character attacks array
            setBattleMenuOpen(false);
            setBattleText(action.attack.attackText);
            waitingForUserInput = true;
            while (!progress) {
                progressRound();
            }
            // need to reset this variable right away for the next loop
            progress = false;
            const playerDamageDealt = action.power - dragonStats.defense;
            setBattleText(`The dragon takes ${playerDamageDealt} damage!`);
            // change dragon hp here
            dragonHp -= playerDamageDealt;
            const dragonHpDisplay = document.getElementById("dragon-hp");
            let dragonHpWidth = dragonHpDisplay.offsetWidth;
            dragonHpDisplay.style.width = dragonHpWidth * parseFloat(`0.${dragonHp}`);
            // user needs to press enter to see next text
            waitingForUserInput = true;
            while (!progress) {
                progressRound();
            }
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
                waitingForUserInput = true;
                while (!progress) {
                    progressRound();
                }
            }
        }
        // dragon attacks
        dragonActs();
        // user needs to progress the text again
        waitingForUserInput = true;
        while (!progress) {
            progressRound();
        }
        // return to main battle menu
        setBattleMenuOpen(true);
        setBattleText("Default");
        setAttackOptionChosen(false);
        return;
    }

    function dragonActs() {
        const randomNumber = Math.floor(Math.random() * 3);
        for (let i = 0; i < 3; i++) {
            if (i === randomNumber) {
                const dragonAttack = dragonAttacks[i];
                setBattleText(dragonAttack.attackText);
                waitingForUserInput = true;
                // need user input to progress the textbox
                while (!progress) {
                    progressRound();
                }
                const damageDragonDealt = dragonAttack.power - playerStats.defense;
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
                    playerHp -= damageDragonDealt;
                    setPlayerHpDisplay(playerHp);
                    return;
                } else {
                    setBattleText(`You take ${damageDragonDealt} damage!`);
                    playerHp -= damageDragonDealt;
                    setPlayerHpDisplay(playerHp);
                    return;
                }
            }
        }
    }

    function progressRound(e) {
        if (waitingForUserInput && (e.key === " " || e.key === "Enter")) {
            progress = true;
            waitingForUserInput = false;
            return;
        } else {
            return;
        }
    }

    useEffect(() => {
        fetchClassAttacks();
        fetchCharacterStats();
        fetchDragonAttacks();
        fetchDragonStats();
    }, []);

    useEffect(() => {
        // removing the top two when component dismounts to prevent excessive remounting
        // functionality breaks if I remove the bottom one
        document.addEventListener("keydown", displaySelector);
        document.addEventListener("keydown", renderBattleText);
        document.addEventListener("keydown", executeAction);
        renderBattleText();
        return () => {
            document.removeEventListener("keydown", displaySelector);
            document.removeEventListener("keydown", renderBattleText);
        }
    }, [attackOptionChosen]);

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
                <p>Hp: {playerHpDisplay}</p>
                <p>Mana: {playerManaDisplay}</p>
            </div>
            <div id="battle-text" className="text-box">
                <p>{battleText}</p>
            </div>
            <div id="battle-menu" className="text-box">
                <ActionMenu
                    classAttacks={classAttacks}
                    attackOptionChosen={attackOptionChosen}
                    setAttackOptionChosen={setAttackOptionChosen}
                    battleMenuOpen={battleMenuOpen} />
            </div>
        </>
    )
}

export default BattleScreen;