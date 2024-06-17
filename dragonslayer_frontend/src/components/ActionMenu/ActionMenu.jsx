import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
function ActionMenu(props) {

    const {
        classAttacks,
        classAttacksToDisplay,
        selectedOption,
        attackOptionChosen,
        setAttackOptionChosen,
        dragonIsAwaitingPlayerResponse,
        setOnActionMenu,
        battleMenuOpen,
        onFinalText,
        gameOver
    } = props

    const [firstOptionText, setFirstOptionText] = useState("Attack");
    const [secondOptionText, setSecondOptionText] = useState("Defend");
    const [thirdOptionText, setThirdOptionText] = useState("Magic");
    const [fourthOptionText, setFourthOptionText] = useState("Pray");

    // will need to update this for other menus
    const returnToFirstMenu = (e) => {
        if ((e.key === "Backspace" || e.key === "Shift") && battleMenuOpen) {
            setAttackOptionChosen(false);
            setOnActionMenu(true);
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", returnToFirstMenu);
        return () => {
            document.removeEventListener("keydown", returnToFirstMenu);
        }
    });

    useEffect(() => {
        if (dragonIsAwaitingPlayerResponse) {
            setSecondOptionText(classAttacks[9].attack.name);
        }
        // including classAttacks in the dependency array because the linter told me to
    }, [dragonIsAwaitingPlayerResponse, classAttacks]);

    // Toggles options when game over state reached
    useEffect(() => {
        if (gameOver || onFinalText) {
            console.log("In ActionMenu useEffect. This is the value of onFinalText:", onFinalText);
            setFirstOptionText("Restart Battle");
            setSecondOptionText("Return to Title");
            setThirdOptionText("");
            setFourthOptionText("");
        } else if (!gameOver && !onFinalText) {
            setFirstOptionText("Attack");
            setSecondOptionText("Defend");
            setThirdOptionText("Magic");
            setFourthOptionText("Pray");
        }
    }, [gameOver, onFinalText]);

    return (
        <>
            {battleMenuOpen &&
                <>
                    <div className={"option-one selector-container left-option"}>
                        <div className={selectedOption === 0 ? "selector" : "selector unselected"}>&#9659;</div>
                        <div className="action">
                            {attackOptionChosen ? classAttacksToDisplay[0].attack.name : firstOptionText}</div>
                    </div>
                    <div className={"option-two selector-container right-option"}>
                        <div className={selectedOption === 1 ? "selector" : "selector unselected"}>&#9659;</div>
                        <div className="action">
                            {attackOptionChosen ? classAttacksToDisplay[1].attack.name : secondOptionText}</div>
                    </div>
                    <div></div>
                    {!gameOver && !onFinalText &&
                        <>
                            <div className={"option-three selector-container left-option"}>
                                <div className={selectedOption === 2 ? "selector" : "selector unselected"}>&#9659;</div>
                                <div className="action">
                                    {attackOptionChosen ? classAttacksToDisplay[2].attack.name : thirdOptionText}</div>
                            </div>
                            <div className={"option-four selector-container right-option"}>
                                <div className={selectedOption === 3 ? "selector" : "selector unselected"}>&#9659;</div>
                                <div className="action">
                                    {attackOptionChosen ? classAttacksToDisplay[3].attack.name : fourthOptionText}</div>
                            </div>
                            <div></div>
                        </>
                    }
                </>
            }
        </>
    );
}
// This is to avoid a linting error
ActionMenu.propTypes = {
    classAttacks: PropTypes.array.isRequired,
    classAttacksToDisplay: PropTypes.array.isRequired,
    selectedOption: PropTypes.number.isRequired,
    attackOptionChosen: PropTypes.bool.isRequired,
    setAttackOptionChosen: PropTypes.func.isRequired,
    dragonIsAwaitingPlayerResponse: PropTypes.bool.isRequired,
    setOnActionMenu: PropTypes.func.isRequired,
    battleMenuOpen: PropTypes.bool.isRequired,
    onFinalText: PropTypes.bool.isRequired,
    gameOver: PropTypes.bool.isRequired
};
export default ActionMenu;