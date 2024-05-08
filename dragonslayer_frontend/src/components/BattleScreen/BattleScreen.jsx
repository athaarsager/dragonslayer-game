import { useState } from "react";
import axios from "axios";
function BattleScreen() {

    // putting axios calls here for now. Will very likely need to move them to a different component later

    return (
        <>
        <h2>A dragon draws near!</h2>
        {/* Credit for dragon image: Image by Artie Blur from Pixabay 
        Granted, it is AI generated, so do I need to credit him? Probablys still should...*/}
        <img src="/public/images/dragon.jpg" 
        alt="A dark blue dragon whose tail and wings exude flames as it sets a forest on fire in the night"/>
        </>
    )
}

export default BattleScreen;