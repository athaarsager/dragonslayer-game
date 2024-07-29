import TitleScreen from '../TitleScreen/TitleScreen.jsx'
import BattleScreen from '../BattleScreen/BattleScreen.jsx'
import { useState } from 'react'

export default function App() {

    const [onTitleScreen, setOnTitleScreen] = useState(true);
    const [onBattleScreen, setOnBattleScreen] = useState(false);

    return (
        <>
            {onTitleScreen &&
                <TitleScreen
                     setOnTitleScreen={setOnTitleScreen} />
            }
            {onBattleScreen &&
                <BattleScreen />
            }
        </>
    )
}