/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
function ProloguePage(props) {

    const {
        openingText,
        prologueText,
        playerName,
        setPlayerName,
        playerClasses,
        displayClassesMenu,
        setDisplayClassesMenu,
        displaySelector,
        selectedOption,
        setSelectedOption,
        setOnBattleScreen,
        setOnProloguePage,
        setBattleMenuOpen,
    } = props;

    const [narrationText, setNarrationText] = useState("");
    const [displayNameBox, setDisplayNameBox] = useState(false);
    const [displayYesNoBox, setDisplayYesNoBox] = useState(false);
    const [classDescription, setClassDescription] = useState(playerClasses.length > 0 ? playerClasses[0].description : "");

    const [yesNoBoxNumber, setYesNoBoxNumber] = useState(1);
    const [animationCompleted, setAnimationCompleted] = useState(false);

    const [readyToProgressText, setReadyToProgressText] = useState(false);
    const [timeToInitializePrologueText, setTimeToInitializePrologueText] = useState(false);

    // Refs
    const selectedOptionRef = useRef(selectedOption);
    const yesNoBoxNumberRef = useRef(yesNoBoxNumber);
    const narrationTextRef = useRef(narrationText);
    const animationCompletedRef = useRef(animationCompleted);
    // This gets set to a DOM element on page load
    const narrationTextDisplayRef = useRef(null);

    let resolveKeyPress = null;

    // Re-using some functionality I wrote for the other narration page below.
    // There's probably a more efficient way for me to do this aside from copy-pasting.
    // Oh well, can fix later if I'm feeling motivated

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


    function animateText(text, callback) {
        if (!narrationTextDisplayRef.current) {
            return;
        }
        const container = narrationTextDisplayRef.current;
        container.innerHTML = "";
        const chars = text.split("");
        chars.forEach(char => {
            const span = document.createElement("span");
            span.innerHTML = char;
            container.appendChild(span);
        });

        gsap.fromTo(
            container.children,
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.1,
                stagger: 0.03,
                onComplete: callback
            }
        );
    }

    function progressOpeningText(e) {
        if ((e.key === " " || e.key === "Enter") && animationCompletedRef.current) {
            if (narrationTextRef.current === `${openingText[4].textContent}, "${playerName}."`) {
                setNarrationText(openingText[5].textContent);
                setReadyToProgressText(false);
            } else {
                for (let i = 6; i < openingText.length; i++) {
                    if (i === 9 && narrationTextRef.current !== openingText[5].textContent) {
                        setReadyToProgressText(false);
                        setTimeToInitializePrologueText(true);
                        return;
                    }
                    if (narrationTextRef.current === openingText[i].textContent) {
                        setNarrationText(openingText[i + 1].textContent);
                        return;
                    }
                }
            }
        }
    }

    async function progressPrologueText(textBlock) {
        if (!narrationTextRef.current === openingText[9].textContent) {
            await pauseOnText();
        }
        setNarrationText(textBlock);
        await pauseOnText();
        setNarrationText(prologueText[2].textContent);
        await pauseOnText();
        textBlock = "";
        for (let i = 3; i < 6; i++) {
            textBlock += ` ${prologueText[i].textContent}`;
        }
        setNarrationText(textBlock);
        await pauseOnText();
        setNarrationText(`${playerName}, ${prologueText[6].textContent}`);
        await pauseOnText();
        for (let i = 7; i < prologueText.length; i++) {
            setNarrationText(prologueText[i].textContent);
            await pauseOnText();
        }
        // Begin battle!
        setOnProloguePage(false);
        setOnBattleScreen(true);
        setBattleMenuOpen(true);
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
            setAnimationCompleted(false);
            setNarrationText(`${openingText[1].textContent} '${playerName}' ${openingText[2].textContent}`);
            document.addEventListener("keydown", makeSelection);
            return;
        }
    }

    function addYesNoBox() {
        setDisplayYesNoBox(true);
        if (selectedOption !== 1) {
            setSelectedOption(1);
        }
    }

    function changeSelection(e) {
        if (displayYesNoBox) {
            if (e.key === "ArrowDown") {
                setSelectedOption(2);
            } else if (e.key === "ArrowUp") {
                setSelectedOption(1);
            }
        }
    }

    function makeSelection(e) {
        if ((e.key !== " " && e.key !== "Enter") || (!displayYesNoBox && !displayClassesMenu)) {
            return;
        }
        if (yesNoBoxNumberRef.current === 1) {
            if (selectedOptionRef.current === 1) {
                document.removeEventListener("keydown", makeSelection);
                setDisplayYesNoBox(false);
                setNarrationText(openingText[3].textContent);
                setYesNoBoxNumber(2);
                document.addEventListener("keydown", makeSelection);
            } else {
                // return player to input for name selection
                setDisplayYesNoBox(false);
                setNarrationText(openingText[0].textContent);
                setPlayerName("");
                setYesNoBoxNumber(1);
                document.removeEventListener("keydown", makeSelection);
            }
        } else if (yesNoBoxNumberRef.current === 2) {
            // This is what progresses the player into the next segment (the class select screen)
            if (selectedOptionRef.current === 1) {
                setDisplayYesNoBox(false);
                setNarrationText(`${openingText[4].textContent}, "${playerName}."`);
                document.removeEventListener("keydown", makeSelection);
                setReadyToProgressText(true);
                setSelectedOption(0);
                setYesNoBoxNumber(0);
            } else {
                // return player to input for name selection
                setDisplayYesNoBox(false);
                setNarrationText(openingText[0].textContent);
                setPlayerName("");
                setYesNoBoxNumber(1);
                document.removeEventListener("keydown", makeSelection);
            }
            // logic for class selection
        } else {
            switch (selectedOptionRef.current) {
                case 0:
                    setClassDescription(playerClasses[0].denialText);
                    break;
                case 1:
                    setClassDescription(playerClasses[1].denialText);
                    break;
                case 2:
                    setClassDescription(playerClasses[2].denialText);
                    break;
                case 3:
                    setDisplayClassesMenu(false);
                    // maybe add a brief pause here
                    setNarrationText(openingText[6].textContent);
                    // insert progress text function here or something
                    setReadyToProgressText(false);
                    // setRemoveMakeSelection(true);
                    setSelectedOption(0);
                    document.removeEventListener("keydown", makeSelection);
                    break;
            }
        }
    }

    // Will also handle logic for displaying rejection text
    function displayClassDescriptions() {
        setClassDescription(playerClasses[selectedOptionRef.current].description);
    }

    // useEffect for handling when a player confirms their name
    // Thanks useState for being asynchronous and not letting me do this
    // in the updatePlayerName function
    useEffect(() => {
        if (displayNameBox) {
            document.addEventListener("keydown", handleNameConfirm);
        }

        return () => {
            document.removeEventListener("keydown", handleNameConfirm);
        };

    }, [playerName, displayNameBox]);

    // Handles delaying menus from appearing until text animation is complete
    useEffect(() => {
        animationCompletedRef.current = animationCompleted;
        // Add an event listener to this first one for user typing in their name
        if (animationCompleted && narrationTextRef.current === openingText[0].textContent) {
            document.addEventListener("keydown", updatePlayerName);
            setDisplayNameBox(true);
            // make first yesNo box not appear until after text is done animating
        } else if (animationCompleted && narrationTextRef.current === `${openingText[1].textContent} '${playerName}' ${openingText[2].textContent}`) {
            addYesNoBox();
        } else if (animationCompleted && narrationTextRef.current === openingText[3].textContent) {
            addYesNoBox();
        } else if (animationCompleted && narrationTextRef.current === openingText[5].textContent) {
            setDisplayClassesMenu(true);
        }

        return () => {
            document.removeEventListener("keydown", updatePlayerName);
        }
    }, [animationCompleted]);

    useEffect(() => {
        if (displayYesNoBox) {
            document.addEventListener("keydown", changeSelection);
            document.addEventListener("keydown", makeSelection);
        }
        return () => {
            document.removeEventListener("keydown", changeSelection);
            document.removeEventListener("keydown", makeSelection);
        };
    }, [displayYesNoBox]);

    useEffect(() => {
        // add event listener here
        if (readyToProgressText) {
            document.addEventListener("keydown", progressOpeningText);
        } else if (!readyToProgressText || narrationText === openingText[9].textContent) {
            document.removeEventListener("keydown", progressOpeningText);
        }
    }, [readyToProgressText, narrationText]);

    // This updates the selectedOptionRef whenever the selectedOption is updated
    useEffect(() => {
        selectedOptionRef.current = selectedOption;
    }, [selectedOption]);

    useEffect(() => {
        yesNoBoxNumberRef.current = yesNoBoxNumber;
    }, [yesNoBoxNumber]);

    useEffect(() => {
        narrationTextRef.current = narrationText;
        animateText(narrationText, () => setAnimationCompleted(true));
        // Need to reset this
        setAnimationCompleted(false);
    }, [narrationText]);

    useEffect(() => {
        if (timeToInitializePrologueText) {
            let narrationBlock = "";
            for (let i = 0; i < 2; i++) {
                narrationBlock += ` ${prologueText[i].textContent}`;
            }
            setTimeToInitializePrologueText(false);
            progressPrologueText(narrationBlock);
        }
    }, [timeToInitializePrologueText]);

    useEffect(() => {
        if (displayClassesMenu) {
            document.addEventListener("keydown", displaySelector);
            document.addEventListener("keydown", makeSelection);
        } else {
            document.removeEventListener("keydown", displaySelector);
            document.removeEventListener("keydown", makeSelection);
        }

        return () => {
            document.removeEventListener("keydown", displaySelector);
            document.removeEventListener("Keydown", makeSelection);
        }
    }, [displayClassesMenu]);

    useEffect(() => {
        if (displayClassesMenu) {
            displayClassDescriptions();
        }
    }, [selectedOption, displayClassesMenu]);

    useEffect(() => {
        narrationTextDisplayRef.current = document.querySelector('.prologue-text');
        setNarrationText(openingText.length > 0 ? openingText[0].textContent : "");
    }, []);

    return (
        <div id="prologue-narration-container">
            <div id="prologue-text-and-name-container">
                <p className="prologue-text">{narrationText}</p>
                {(displayNameBox && animationCompleted) &&
                    <div id="name-container">
                        <div id="name-line">{playerName}</div>
                        <div id="type-block"></div>
                    </div>
                }
            </div>
            {displayYesNoBox &&
                <div id="yes-no-box-container">
                    <div id="yes-no-box">
                        <div className="option-container">
                            <div className="yes-no-selector">
                                <div className={selectedOption === 1 ? "prologue-page-selector" : "prologue-page-selector unselected"}>&#9659;</div>
                            </div>
                            <p className="prologue-text">Yes</p>
                        </div>
                        <div className="option-container">
                            <div className="yes-no-selector">
                                <div className={selectedOption === 2 ? "prologue-page-selector" : "prologue-page-selector unselected"}>&#9659;</div>
                            </div>
                            <p className="prologue-text" id="no-option">No</p>
                        </div>
                    </div>
                </div>
            }
            {displayClassesMenu &&
                <div id="prologue-text-box">
                    <p id="class-descriptions">{classDescription}</p>
                </div>
            }
        </div>
    );
}

ProloguePage.propTypes = {
    openingText: PropTypes.arrayOf(PropTypes.object).isRequired,
    prologueText: PropTypes.arrayOf(PropTypes.object).isRequired,
    playerName: PropTypes.string.isRequired,
    setPlayerName: PropTypes.func.isRequired,
    playerClasses: PropTypes.arrayOf(PropTypes.object).isRequired,
    displayClassesMenu: PropTypes.bool.isRequired,
    setDisplayClassesMenu: PropTypes.func.isRequired,
    displaySelector: PropTypes.func.isRequired,
    selectedOption: PropTypes.number.isRequired,
    setSelectedOption: PropTypes.func.isRequired,
    setOnBattleScreen: PropTypes.func.isRequired,
    setOnProloguePage: PropTypes.func.isRequired,
    setBattleMenuOpen: PropTypes.func.isRequired,
}

export default ProloguePage;