import { Label } from "@/components/ui/label";
export function Navbar() {
    return (
        <nav className="absolute top-0 flex h-full w-full flex-row gap-5 p-6 px-26 justify-between bg-transparent backdrop-blur-lg">
            <img src="#" className="logo"></img>
            <div className="flex flex-row gap-25 text-foreground font-sans ">
                <Label>Home</Label>
                <Label>About</Label>
                <Label>Help</Label>
            </div>
        </nav>
    );
}
