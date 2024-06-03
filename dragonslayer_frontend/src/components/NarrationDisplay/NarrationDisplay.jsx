import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./NarrationDisplay.css";
import { gsap } from "gsap";

function NarrationDisplay(props) {
    const {
        badEndingReached,
        setBadEndingReached,
        badEndingText,
        setBadEndingText
    } = props;
    const [narrationText, setNarrationText] = useState("");
    // This is for tracking when new text is added so it can be animated separately
    const [newText, setNewText] = useState("");

    let resolveKeyPress = null;

    async function progressNarration() {
        if (badEndingReached) {
            await pauseOnText();
        }
    }

    function appendText(newText) {
        setNarrationText(currentText => currentText + newText);
    }
    // Okay, I technically should have just defined these functions on the battleScreen and passed them as props
    // to BattleLogic.js and this screen, but that felt like a pain with the resolveKeyPress variable, so I didn't...
    // These functions allow the text to pause and wait for user input
    async function pauseOnText() {
        document.addEventListener("keydown", resolveUserInput);
        await progressText();
        document.removeEventListener("keydown", resolveUserInput);
    }

    function progressText() {
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

    // This useEffect begins the badEnding narration
    useEffect(() => {
        if (badEndingReached) {
            setNarrationText(badEndingText[4].text);
        }
    }, [badEndingReached, setBadEndingReached, badEndingText]);

    return (
        <div id="narration-container">
            <p className="narration-text">
                {narrationText}
                <span className={newText ? "text-to-animate" : ""}>{newText}</span>
                </p>
        </div>
    )
}

NarrationDisplay.propTypes = {
    badEndingReached: PropTypes.bool.isRequired,
    setBadEndingReached: PropTypes.func.isRequired,
    badEndingText: PropTypes.array.isRequired,
    setBadEndingText: PropTypes.func.isRequired
};

export default NarrationDisplay;