import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./ProloguePage.css";

function ProloguePage({ openingText, prologueText, playerName, setPlayerName }) {

    const [narrationText, setNarrationText] = useState(openingText.length > 0 ? openingText[0].textContent : "");

    return (
        <div id="narration-container">
            <p className="prologue-text">{narrationText}</p>
        </div>
    );
}

ProloguePage.propTypes = {
    openingText: PropTypes.arrayOf(PropTypes.object).isRequired,
    prologueText: PropTypes.arrayOf(PropTypes.object).isRequired,
    playerName: PropTypes.string.isRequired,
    setPlayerName: PropTypes.func.isRequired
}

export default ProloguePage;