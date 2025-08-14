import { Label } from "@/components/ui/label";
import { useState, memo } from "react";
import logo from "../assets/logo.svg";
import menu from "../assets/menu.svg";
import { useGameContext } from "@/context";

export const Navbar = memo(function Navbar() {
    const [hamburgerMenuView, setHamburgerMenuView] = useState(false);
    const { gameStatus } = useGameContext().gameState;
    
    const toggleMenu = () => {
        setHamburgerMenuView(!hamburgerMenuView);
    };
    
    return (
        <div className={`sticky top-0 ${gameStatus === "not started" ? "bg-background" : "bg-secondary-background"} w-full`}>
            {console.log("rerendering Navbar", gameStatus)}
            <div className=" grid grid-cols-[1fr_min(calc(100%-48px),80rem)_1fr] sm:grid-cols-[1fr_min(calc(100%-85px),80rem)_1fr] border-b border-b-secondary-background shadow-nav h-[45px]">
                <nav className="col-start-2 col-end-3 flex justify-between items-center">
                    <a href="/" className="">
                        <img src={logo} alt="logo" width={30} height={30} />
                    </a>
                    
                    {/* Desktop Menu - Hidden on mobile */}
                    <div className="hidden md:flex flex-row space-x-16 items-center font-sans text-base">
                        <a href="#" className="text-center hover:text-gray-600 transition-colors">Home</a>
                        <a href="#" className="text-center hover:text-gray-600 transition-colors">About</a>
                        <a href="#" className="text-center hover:text-gray-600 transition-colors">Help</a>
                    </div>
                    
                    {/* Hamburger Button - Visible on mobile only */}
                    <button 
                        onClick={toggleMenu}
                        className="md:hidden z-50 relative"
                        aria-label="Toggle menu"
                    >
                        {hamburgerMenuView ? (
                            <span className="text-xl font-bold">✕</span>
                        ) : (
                            <img
                                src={menu}
                                alt="menu options"
                                width={29}
                                height={27}
                            />
                        )}
                    </button>
                </nav>
            </div>
            
            {/* Mobile Menu Overlay */}
            {hamburgerMenuView && (
                <>
                <div className="absolute h-[100vh] w-[100vw] backdrop-blur-xs bg-radial from-black/30 to-transparent" onClick={() => toggleMenu()}></div>
                <div className="md:hidden fixed inset-0 bg-transparent backdrop-blur-lg brightness-125 top-15 z-40 h-fit w-[95%] rounded-xs mx-auto shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] p-5">
                    <div className="flex flex-col items-center space-y-4 text-xl font-poppins ">
                        <a href="#" className="w-full py-2 text-center rounded-md active:bg-background hover:text-gray-600 active:underline transition-colors" onClick={toggleMenu}>Home</a>
                        <a href="#" className="w-full py-2 text-center rounded-md active:bg-background hover:text-gray-600 active:underline transition-colors" onClick={toggleMenu}>About</a>
                        <a href="#" className="w-full py-2 text-center rounded-md active:bg-background hover:text-gray-600 active:underline transition-colors" onClick={toggleMenu}>Help</a>
                    </div>
                
                </div>
                </>
            )}
        </div>
    );
});