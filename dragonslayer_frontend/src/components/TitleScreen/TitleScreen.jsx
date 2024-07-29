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
            <p className="start-text">Press Spacebar or Enter to Begin</p>
        </>
    )
}

TitleScreen.propTypes = {
    setOnTitleScreen: PropTypes.func.isRequired
}

export default TitleScreen;