import PropTypes from 'prop-types';

function ActionMenu({ classAttacks, attackOptionChosen }) {
    console.log("these are the classAttacks:", classAttacks);
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
    attackOptionChosen: PropTypes.bool.isRequired
};
export default ActionMenu;