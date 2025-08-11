import { Label } from "@/components/ui/label";
import { useState, memo } from "react";
import logo from "../assets/logo.svg";
import menu from "../assets/menu.svg";

export const Navbar = memo(function Navbar() {
    const [hamburgerMenuView, setHamburgerMenuView] = useState(false);
    
    const toggleMenu = () => {
        setHamburgerMenuView(!hamburgerMenuView);
    };
    
    return (
        <div className="sticky top-0 bg-background w-full">
            {console.log("rerendering Navbar")}
            <div className=" grid grid-cols-[1fr_min(calc(100%-48px),80rem)_1fr] sm:grid-cols-[1fr_min(calc(100%-85px),80rem)_1fr] border-b border-b-secondary-background shadow-nav py-[14px]">
                <nav className="col-start-2 col-end-3 flex justify-between items-center">
                    <a href="/" className="">
                        <img src={logo} alt="logo" width={40} height={40} />
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
                <div className="absolute h-[100vh] w-[100vw] bg-black/40" onClick={() => toggleMenu()}>
                <div className="md:hidden fixed inset-0 bg-secondary-background top-20 z-40 h-fit w-[95%] rounded-xs mx-auto shadow-[0_10px_95px_0_rgba(0,0,0,0.3)] p-5">
                    <div className="flex flex-col items-center space-y-4 text-xl font-poppins">
                        <a href="#" className="w-full py-2 text-center rounded-md active:bg-background hover:text-gray-600 active:underline transition-colors" onClick={toggleMenu}>Home</a>
                        <a href="#" className="w-full py-2 text-center rounded-md active:bg-background hover:text-gray-600 active:underline transition-colors" onClick={toggleMenu}>About</a>
                        <a href="#" className="w-full py-2 text-center rounded-md active:bg-background hover:text-gray-600 active:underline transition-colors" onClick={toggleMenu}>Help</a>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
});