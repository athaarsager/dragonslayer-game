import PropTypes from "prop-types";

function ProloguePage({ openingText, prologueText, playerName, setPlayerName }) {
    return (
        <>
        <h1>On Prologue Page</h1>
        </>
    );
}

ProloguePage.PropTypes = {
    openingText: PropTypes.array.isRequired,
    prologueText: PropTypes.array.isRequired,
    playerName: PropTypes.string.isRequired,
    setPlayerName: PropTypes.func.isRequired
}

export default ProloguePage;