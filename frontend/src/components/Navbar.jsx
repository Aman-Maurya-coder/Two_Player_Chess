import { Label } from "@/components/ui/label";
import { useState } from "react";
import logo from "../assets/logo.svg";
import menu from "../assets/menu.svg";
export function Navbar() {
    const [hamburgerMenuView, setHamburgerMenuView] = useState("false");
    const toggleMenu = () => {
        setHamburgerMenuView(!hamburgerMenuView);
    };
    return (
        // <nav className="flex h-full w-full flex-row justify-between bg-transparent">
        //     <div id="logo" className="flex justify-center items-center">
        //         <img src="#"></img>
        //     </div>
        // {hamburgerMenuView ? <button onClick={toggleMenu}>menu</button> : <div className="flex flex-row space-x-25 text-foreground font-sans ">
        //     <button onClick={toggleMenu}>Close</button>
        //     <Label>Home</Label>
        //     <Label>About</Label>
        //     <Label>Help</Label>
        // </div>
        //     }

        // </nav>
        <div className="relative top-0 bg-transparent w-full">
            <div className="grid grid-cols-[1fr_min(calc(100%-48px),80rem)_1fr] sm:grid-cols-[1fr_min(calc(100%-85px),80rem)_1fr] border-b border-b-secondary-background shadow-nav py-[14px]">
                <nav className="col-start-2 col-end-3 flex justify-between items-center">
                    <a href="/" className="">
                        <img src={logo} alt="logo" width={40} height={40} />
                    </a>
                    {hamburgerMenuView ? (
                        <button onClick={toggleMenu}>
                            <img
                                src={menu}
                                alt="menu options"
                                width={29}
                                height={27}
                            />
                        </button>
                    ) : (
                        <div className="flex flex-row space-x-25  font-sans ">
                            <button onClick={toggleMenu}>Close</button>
                            <Label>Home</Label>
                            <Label>About</Label>
                            <Label>Help</Label>
                        </div>
                    )}
                </nav>
            </div>
        </div>
    );
}
