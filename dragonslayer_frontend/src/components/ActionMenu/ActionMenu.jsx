import PropTypes from 'prop-types';
import { useEffect } from 'react';
function ActionMenu({ classAttacks, attackOptionChosen, setAttackOptionChosen, setBattleText, battleText }) {

    // will need to update this for other menus
    const returnToFirstMenu = (e) => {
        if (e.key === "Backspace" || e.key === "Shift") {
            setAttackOptionChosen(false);
            setBattleText("Default");
        }
    }

    const renderBattleText = () => {
        const optionOne = document.querySelector(".option-one").children[0];
        const optionTwo = document.querySelector(".option-two").children[0];
        const optionThree = document.querySelector(".option-three").children[0];
        const optionFour = document.querySelector(".option-four").children[0];
        
        if (!attackOptionChosen) {
            setBattleText("Default");
        }

        if (attackOptionChosen) {
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

    useEffect(() => {
        document.addEventListener("keydown", returnToFirstMenu);
        document.addEventListener("keydown", renderBattleText);
    });

    useEffect(() => {
        renderBattleText();
    });

    useEffect(() => {
    }, [battleText]);
    
    return (
        <>
            <div className={"option-one selector-container left-option"}>
                <div className="selector">&#9659;</div>
                <div className="action">
                    {attackOptionChosen ? classAttacks[0].attack.name : "Attack"}</div>
            </div>
            <div className={"option-two selector-container right-option"}>
                <div className="selector unselected">&#9659;</div>
                <div className="action">
                    {attackOptionChosen ? classAttacks[1].attack.name : "Defend"}</div>
            </div>
            <div className={"option-three selector-container left-option"}>
                <div className="selector unselected">&#9659;</div>
                <div className="action">
                    {attackOptionChosen ? classAttacks[2].attack.name : "Magic"}</div>
            </div>
            <div className={"option-four selector-container right-option"}>
                <div className="selector unselected">&#9659;</div>
                <div className="action">
                    {attackOptionChosen ? classAttacks[3].attack.name : "Run"}</div>
            </div>
        </>
    );
}
// This is to avoid a linting error
ActionMenu.propTypes = {
    classAttacks: PropTypes.array.isRequired,
    attackOptionChosen: PropTypes.bool.isRequired,
    setAttackOptionChosen: PropTypes.func.isRequired,
    setBattleText: PropTypes.func.isRequired,
    battleText: PropTypes.string.isRequired
};
export default ActionMenu;