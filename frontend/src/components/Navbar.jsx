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
            <div className=" grid grid-cols-[1fr_min(calc(100%-48px),80rem)_1fr] sm:grid-cols-[1fr_min(calc(100%-85px),80rem)_1fr] border-b border-b-secondary-background shadow-nav py-[14px]">
                <nav className="col-start-2 col-end-3 flex justify-between items-center">
                    <a href="/" className="">
                        <img src={logo} alt="logo" width={40} height={40} />
                    </a>

                    {/* Desktop Menu - Hidden on mobile */}
                    <div className="hidden md:flex flex-row space-x-16 items-center font-sans text-base">
                        <a
                            href="https://github.com/Aman-Maurya-coder/Two_Player_Chess"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center hover:text-gray-400 transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://cv-one-rose.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center hover:text-gray-400 transition-colors"
                        >
                            About Me
                        </a>
                        <a
                            href="https://www.instagram.com/aman_._maurya/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center hover:text-gray-400 transition-colors"
                        >
                            Contact Us
                        </a>
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
                <div
                    className="absolute h-[100vh] w-[100vw] bg-black/40"
                    onClick={() => toggleMenu()}
                >
                    <div className="md:hidden fixed inset-0 bg-secondary-background top-20 z-40 h-fit w-[95%] rounded-xs mx-auto shadow-[0_10px_95px_0_rgba(0,0,0,0.3)] p-5">
                        <div className="flex flex-col items-center space-y-4 text-xl font-poppins">
                            <a
                                href="https://github.com/Aman-Maurya-coder/Two_Player_Chess"
                                className="w-full py-2 text-center rounded-md active:bg-background hover:text-gray-600 active:underline transition-colors"
                                onClick={toggleMenu}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GitHub
                            </a>
                            <a
                                href="https://cv-one-rose.vercel.app/"
                                className="w-full py-2 text-center rounded-md active:bg-background hover:text-gray-600 active:underline transition-colors"
                                onClick={toggleMenu}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                About Me
                            </a>
                            <a
                                href="https://www.instagram.com/aman_._maurya/"
                                className="w-full py-2 text-center rounded-md active:bg-background hover:text-gray-600 active:underline transition-colors"
                                onClick={toggleMenu}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
