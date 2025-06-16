import { Label } from "@/components/ui/label";
export function Navbar() {
    return (
        <nav className="flex flex-5/100 flex-row gap-5 p-6 border border-accent justify-around dark bg-background">
            <img src="#" className="logo"></img>
            <div className="flex flex-row gap-10 text-foreground font-serif ">
                <Label>Home</Label>
                <Label>About</Label>
                <Label>Help</Label>
            </div>
        </nav>
    );
}
