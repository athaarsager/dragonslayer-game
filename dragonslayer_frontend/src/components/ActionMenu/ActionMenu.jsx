import PropTypes from 'prop-types';
import { useEffect } from 'react';
function ActionMenu({ classAttacks, attackOptionChosen, setAttackOptionChosen }) {
  
    // will need to update this for other menus
    const returnToFirstMenu = (e) => {
        if (e.key === "Backspace" || e.key === "Shift") {
            setAttackOptionChosen(false);
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", returnToFirstMenu);
    });
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
    setAttackOptionChosen: PropTypes.func.isRequired
};
export default ActionMenu;