function ActionMenu() {
    return (
        <>
            <div className={"option-one selector-container left-option"}>
                <div className="selector">&#9659;</div>
                <div className="action">Attack</div>
            </div>
            <div className={"option-two selector-container right-option"}>
                <div className="selector unselected">&#9659;</div>
                <div className="action">Defend</div>
            </div>
            <div className={"option-three selector-container left-option"}>
                <div className="selector unselected">&#9659;</div>
                <div className="action">Magic</div>
            </div>
            <div className={"option-four selector-container right-option"}>
                <div className="selector unselected">&#9659;</div>
                <div className="action">Run</div>
            </div>
        </>
    );
}
export default ActionMenu;