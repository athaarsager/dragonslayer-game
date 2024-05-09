import { useState } from "react";
import axios from "axios";
import "./BattleScreen.css";
function BattleScreen() {

    // putting axios calls here for now. Will very likely need to move them to a different component later


    // e.key to detect key code (what key was pressed)
    const displaySelector = (e) => {
        e.target.children[0].classList.remove("unselected");
    }

    const hideSelector = (e) => {
        e.target.children[0].classList.add("unselected");
    }

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
                <div onFocus={displaySelector} onBlur={hideSelector} tabIndex={1} className={"selector-container left-option"}>
                    <div id="attack-select" className="selector unselected">&#9659;</div>
                    <div className="action">Attack</div>
                </div>
                <div onFocus={displaySelector} onBlur={hideSelector} tabIndex={2} className={"selector-container right-option"}>
                    <div id="defend-select" className="selector unselected">&#9659;</div>
                    <div className="action">Defend</div>
                </div>
                <div onFocus={displaySelector} onBlur={hideSelector} tabIndex={3} className={"selector-container left-option"}>
                    <div id="magic-select" className="selector unselected">&#9659;</div>
                    <div className="action">Magic</div>
                </div>
                <div onFocus={displaySelector} onBlur={hideSelector}  tabIndex={4} className={"selector-container right-option"}>
                    <div id="run-select" className="selector unselected">&#9659;</div>
                    <div className="action">Run</div>
                </div>
            </div>
        </>
    )
}

export default BattleScreen;