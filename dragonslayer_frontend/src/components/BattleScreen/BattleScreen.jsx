import { useState, useEffect } from "react";
import axios from "axios";
import "./BattleScreen.css";
function BattleScreen() {

    // putting axios calls here for now. Will very likely need to move them to a different component later


    // e.key to detect key code (what key was pressed)
    // keycodes for arrows:
    // left = ArrowLeft
    // up = ArrowUp
    // right = ArrowRight
    // down = ArrowDown
    // so...need to write a function that detects what element does not have the class name "unselected"
    // on key press, determine which element should next have the unselected class removed based on what key was pressed
    // selected class will do nothing in terms of css, it will just be an identifier for which element is selected
    const displaySelector = (e) => {
        const optionOne = document.querySelector(".option-one").children[0];
        const optionTwo = document.querySelector(".option-two").children[0];
        const optionThree = document.querySelector(".option-three").children[0];
        const optionFour = document.querySelector(".option-four").children[0];
        console.log("This is optionOne:", optionOne);
        console.log("this is the classlist of optionOne:", optionOne.classList);
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

    useEffect(() => {
        document.addEventListener("keydown", displaySelector);
    }, []);

    return (
        <>
            <h2>A dragon draws near!</h2>
            {/* Credit for dragon image: Image by Artie Blur from Pixabay 
                Granted, it is AI generated, so do I need to credit him? Probablys still should...*/}
            <div id="dragon-display">
                <img src="/public/images/dragon.jpg"
                    alt="A dark blue dragon whose tail and wings exude flames as it sets a forest on fire in the night" />
            </div>
            <div id="battle-text" className="text-box">
                <p>Battle Text Here</p>
            </div>
            <div id="battle-menu" className="text-box">
                {/* onFocus focuses element, onBlur hides it*/}
                <div className={"option-one selector-container left-option"}>
                    <div id="attack-select" className="selector">&#9659;</div>
                    <div className="action">Attack</div>
                </div>
                <div className={"option-two selector-container right-option"}>
                    <div id="defend-select" className="selector unselected">&#9659;</div>
                    <div className="action">Defend</div>
                </div>
                <div className={"option-three selector-container left-option"}>
                    <div id="magic-select" className="selector unselected">&#9659;</div>
                    <div className="action">Magic</div>
                </div>
                <div className={"option-four selector-container right-option"}>
                    <div id="run-select" className="selector unselected">&#9659;</div>
                    <div className="action">Run</div>
                </div>
            </div>
        </>
    )
}

export default BattleScreen;