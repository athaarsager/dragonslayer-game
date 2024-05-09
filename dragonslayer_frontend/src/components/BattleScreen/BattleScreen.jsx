import { useState } from "react";
import axios from "axios";
import "./BattleScreen.css";
function BattleScreen() {

    // putting axios calls here for now. Will very likely need to move them to a different component later


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
            <div id="battle-menu" class="text-box">
                <div id="attack-action"><span className="selector">&#9659;</span>Attack</div>
                <div id="defend-action"><span className="selector">&#9659;</span>Defend</div>
                <div id="magic-action"><span className="selector">&#9659;</span>Magic</div>
                <div id="run-action"><span className="selector">&#9659;</span>Run</div>
            </div>
        </>
    )
}

export default BattleScreen;