import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./ProloguePage.css";

function ProloguePage({ openingText, prologueText, playerName, setPlayerName }) {

    const [narrationText, setNarrationText] = useState("");

    return (
        <div id="narration-container">
            <h1>On Prologue Page</h1>
        </div>
    );
}

ProloguePage.PropTypes = {
    openingText: PropTypes.array.isRequired,
    prologueText: PropTypes.array.isRequired,
    playerName: PropTypes.string.isRequired,
    setPlayerName: PropTypes.func.isRequired
}

export default ProloguePage;