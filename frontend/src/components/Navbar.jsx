import { Label } from "@/components/ui/label";
export function Navbar() {
    return (
        <nav className="flex flex-5/100 flex-row gap-5 p-6 border-b border-accent justify-around dark bg-sidebar/10">
            <img src="#" className="logo"></img>
            <div className="flex flex-row gap-10 text-foreground font-mono ">
                <Label>Home</Label>
                <Label>About</Label>
                <Label>Help</Label>
            </div>
        </nav>
    );
}
