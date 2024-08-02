/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./ProloguePage.css";

function ProloguePage({ openingText, prologueText, playerName, setPlayerName }) {

    const [narrationText, setNarrationText] = useState(openingText.length > 0 ? openingText[0].textContent : "");
    const [displayNameBox, setDisplayNameBox] = useState(false);
    const [selectedOption, setSelectedOption] = useState(1);

    let resolveKeyPress = null;

    // Re-using some functionality I wrote for the other narration page below.
    // There's probably a more efficient way for me to do this aside from copy-pasting.
    // Oh well, can fix later if I'm feeling motivated
    function appendText(newText) {
        setNarrationText(currentText => currentText + newText);
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

    async function pauseOnText() {
        document.addEventListener("keydown", resolveUserInput);
        await progressText();
        document.removeEventListener("keydown", resolveUserInput);
    }

    // Logic for player typing in their name. Limit 8 characters
    function updatePlayerName(e) {
        // using regex for determining a pattern. Thanks ChatGPT
        // The caret indicates the start of the line, 
        // The $ indicates the end
        // We then test the input against the regex
        const letterRegex = /^[a-zA-Z]$/;
        setPlayerName(currentText => {
            if (letterRegex.test(e.key) && currentText.length < 8) {
                return currentText + e.key;
            } else if (e.key === "Backspace") {
                return currentText.slice(0, currentText.length - 1);
            } else {
                return currentText;
            }
        });
    }

    function handleNameConfirm(e) {
        if (e.key === "Enter") {
            if (playerName === "") {
                return;
            }
            document.removeEventListener("keydown", updatePlayerName);
            setDisplayNameBox(false);
            setNarrationText(`${openingText[1].textContent} '${playerName}' ${openingText[2].textContent}`);
            return;
        }
    }

    // useEffect for handling when a player confirms their name
    // Thanks useState for being asynchronous and not letting me do this
    // in the updatePlayerName function
    useEffect(() => {
        if (displayNameBox) {
            document.addEventListener("keydown", handleNameConfirm)
        }

    }, [playerName, displayNameBox]);

    useEffect(() => {
        // Add an event listener here for user typing in their name
        // Also change state so component where user types their name displays
        // These should not happen until after the text scroll animation plays
        document.addEventListener("keydown", updatePlayerName);
        setDisplayNameBox(true);
    }, []);

    return (
        <div id="narration-container">
            <p className="prologue-text">{narrationText}</p>
            {displayNameBox &&
                <div id="name-container">
                    <div id="name-line">{playerName}</div>
                    <div id="type-block"></div>
                </div>
            }
            <div id="yes-no-box-container">
                <div id="yes-no-box">
                    <div className="option-container">
                        <div className="selector-container">
                            <div className={selectedOption === 1 ? "selector" : "selector unselected"}>&#9659;</div>
                        </div>
                        <p className="prologue-text">Yes</p>
                    </div>
                    <div className="option-container">
                        <div className="selector-container">
                            <div className={selectedOption === 2 ? "selector" : "selector unselected"}>&#9659;</div>
                        </div>
                        <p className="prologue-text" id="no-option">No</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

ProloguePage.propTypes = {
    openingText: PropTypes.arrayOf(PropTypes.object).isRequired,
    prologueText: PropTypes.arrayOf(PropTypes.object).isRequired,
    playerName: PropTypes.string.isRequired,
    setPlayerName: PropTypes.func.isRequired
}

export default ProloguePage;