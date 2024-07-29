import PropTypes from "prop-types";
import "./TitleScreen.css";
import gsap from "gsap";
import { useState, useEffect, useRef } from "react";

function TitleScreen({ setOnTitleScreen }) {

    const [display, setDisplay] = useState("hide-display");
    const animationRef = useRef(null);

    useEffect(() => {
        // set the gsap timeline to a ref so I can change its state easily
        animationRef.current = gsap.timeline();
        // startup animation
        animationRef.current
            .from("#left-title-text", { x: "-100vw", duration: .8 })
            .from("#right-title-text", { x: "100vw", duration: .8 })
            .to({}, { duration: 0.2 })
            .to("#screen-flash", { opacity: 1, duration: 0.25 })
            .to("#screen-flash", { opacity: 0, duration: 0.5 })
            .to({}, { duration: 0.2 })
            // start text fade in-and-out animation
            .to("#start-text", {
                opacity: 0,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        // This makes the image and start text magically appear while the screen is white
        setTimeout(() => {
            setDisplay("");
        }, 2000);

        const handleKeyPress = (e) => {
            if (e.key === " " || e.key === "Enter")
            if (animationRef.current) {
                // progress lets me set where I would like the animation to skip to
                animationRef.current.progress(1);
                setDisplay("");
            }
        }

        document.addEventListener("keydown", handleKeyPress);

        // cleanup event listeners when component unmounts
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        }

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
            <img id="swords-image" className={display} src="/public/images/swordsAndShield.png" alt="Two swords crossed over a shield" />
            <p id="start-text" className={display}>Press Spacebar or Enter to Begin</p>
            {/* overlay for screen flash */}
            <div id="screen-flash"></div>
        </>
    )
}

TitleScreen.propTypes = {
    setOnTitleScreen: PropTypes.func.isRequired
}

export default TitleScreen;