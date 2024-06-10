/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./NarrationDisplay.css";
import gsap from "gsap";

function NarrationDisplay(props) {
    const {
        badEndingReached,
        setBadEndingReached,
        badEndingText
    } = props;
    const [narrationText, setNarrationText] = useState("");
    // This is for tracking when new text is added so it can be animated separately
    const [newText, setNewText] = useState("");

    let resolveKeyPress = null;

    useEffect(() => {
        if (newText) {
            // cancel any prior animations so that user doesn't have to wait for prior animation to finish if they click ahead
            gsap.killTweensOf(".text-to-animate");
            // set the initial state each time, otherwise it just keeps the ending state and doesn't animate
            gsap.set(".text-to-animate", { opacity: 0 });
            gsap.to(".text-to-animate", { duration: 1.5, opacity: 1 });
        }
    }, [newText]);

    async function progressNarration() {
        if (badEndingReached) {
            await pauseOnText();
            const narratorText = badEndingText.slice(5, badEndingText.length);
            console.log("This is the narratorText:", narratorText);
            for (let i = 0; i < narratorText.length; i++) {
                let entry = narratorText[i].text + " ";
                if (i === 5) {
                entry = narratorText[i].text;
                }
                // Account for appending player name to text after "Congratulations"
                if (i === 0) {
                    entry += " playerNameHere! ";
                    setNewText(entry);
                } else {
                    setNewText(entry);
                }
                await pauseOnText();
                if (i === 2 || i === 5 || i === 7 || i === 11) {
                    setNarrationText("");
                    continue;
                }
                appendText(entry);
            }
            // This just prevents "The End" from displaying twice. State update is one behind or something?
            setNewText("");
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
            gsap.set(".narration-text", { opacity: 0 });
            gsap.to(".narration-text", { duration: 1.5, opacity: 1 });
            setNarrationText(badEndingText[4].text + " ");
            progressNarration();
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
};

export default NarrationDisplay;