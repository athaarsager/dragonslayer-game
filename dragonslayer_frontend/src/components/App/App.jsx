import TitleScreen from '../TitleScreen/TitleScreen.jsx';
import BattleScreen from '../BattleScreen/BattleScreen.jsx';
import ProloguePage from '../ProloguePage/ProloguePage.jsx';
import { useState } from 'react';

export default function App() {

    const [playerName, setPlayerName] = useState("");

    const [onTitleScreen, setOnTitleScreen] = useState(true);
    const [onBattleScreen, setOnBattleScreen] = useState(false);
    const [onProloguePage, setOnProloguePage] = useState(false);

    return (
        <>
            {onTitleScreen &&
                <TitleScreen
                     setOnTitleScreen={setOnTitleScreen} 
                     setOnProloguePage={setOnProloguePage}/>
            }
            {onBattleScreen &&
                <BattleScreen />
            }
        </>
    )
}