import { Label } from "@/components/ui/label";
import { useState } from "react";
export function Navbar() {
    const [hamburgerMenuView, setHamburgerMenuView] = useState("false");
    const toggleMenu = () => {
        setHamburgerMenuView(!hamburgerMenuView);
    };
    return (
        <nav className="flex h-full w-full flex-row justify-between bg-transparent">
            <div id="logo" className="flex justify-center items-center">
                <img src="#"></img>
            </div>
            {hamburgerMenuView ? <button onClick={toggleMenu}>menu</button> : <div className="flex flex-row space-x-25 text-foreground font-sans ">
                <button onClick={toggleMenu}>Close</button>
                <Label>Home</Label>
                <Label>About</Label>
                <Label>Help</Label>
            </div>
            }
            
        </nav>
    );
}
