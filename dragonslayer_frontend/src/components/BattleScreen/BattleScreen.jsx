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
                <div onFocus={displaySelector} onBlur={hideSelector} id="attack-action" tabIndex={1}><span className="selector unselected">&#9659;</span>Attack</div>
                <div onFocus={displaySelector} onBlur={hideSelector} id="defend-action" tabIndex={2}><span className="selector unselected">&#9659;</span>Defend</div>
                <div onFocus={displaySelector} onBlur={hideSelector} id="magic-action" tabIndex={3}><span className="selector unselected">&#9659;</span>Magic</div>
                <div onFocus={displaySelector} onBlur={hideSelector} id="run-action" tabIndex={4}><span className="selector unselected">&#9659;</span>Run</div>
            </div>
        </>
    )
}

export default BattleScreen;