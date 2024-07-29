import PropTypes from "prop-types";
import "./TitleScreen.css";
import gsap from "gsap";
import { useEffect } from "react";

function TitleScreen({ setOnTitleScreen }) {

    useEffect(() => {
        gsap.timeline()
            .from("#left-title-text", { x: "-100vw", duration: .8 })
            .from("#right-title-text", { x: "100vw", duration: .8 });
        }, []);
   

    return (
        <>
            <div id="title-text">
                <p id="left-title-text">Dragon</p>
                <p id="right-title-text">Slayer</p>
            </div>
            {/* Image by <a href="https://pixabay.com/users/clker-free-vector-images-3736/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=33979">Clker-Free-Vector-Images</a>
             from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=33979">
             Pixabay</a> */}
            <img id="swords-image" src="/public/images/swordsAndShield.png" alt="Two swords crossed over a shield"/>
            <p className="start-text">Press Spacebar or Enter to Begin</p>
        </>
    )
}

TitleScreen.propTypes = {
    setOnTitleScreen: PropTypes.func.isRequired
}

export default TitleScreen;