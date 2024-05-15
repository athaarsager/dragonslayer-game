import { useState, useEffect } from "react";
import axios from "axios";
import "./BattleScreen.css";
import ActionMenu from "../ActionMenu/ActionMenu";
function BattleScreen() {

    const [onActionMenu, setOnActionMenu] = useState(true);
    const [classAttacks, setClassAttacks] = useState([]);
    const [characterStats, setCharacterStats] = useState({});
    const [attackOptionChosen, setAttackOptionChosen] = useState(false);
    const [battleText, setBattleText] = useState("Default");
    // putting axios calls here for now. Will very likely need to move them to a different component later
    async function fetchClassAttacks() {
        const response = await axios.get("/api/attacks/4");
        console.log(response.data);
        setClassAttacks(response.data);
    }

    async function fetchCharacterStats() {
        const response = await axios.get(`/api/stats/4`);
        console.log("These are the character's stats:", response.data[0]);
        setCharacterStats(response.data[0]);
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

    useEffect(() => {
        fetchClassAttacks();
        fetchCharacterStats();
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
                <p>Hp: {characterStats.hp}</p>
                <p>Mana: {characterStats.mana}</p>
            </div>
            <div id="battle-text" className="text-box">
                <p>{battleText}</p>
            </div>
            <div id="battle-menu" className="text-box">
                <ActionMenu
                    classAttacks={classAttacks}
                    attackOptionChosen={attackOptionChosen}
                    setAttackOptionChosen={setAttackOptionChosen}
                    setBattleText={setBattleText} />
            </div>
        </>
    )
}

export default BattleScreen;