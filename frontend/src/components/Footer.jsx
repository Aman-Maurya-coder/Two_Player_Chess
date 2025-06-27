import { Label } from "@/components/ui/label";

export function Footer(){
    return (
        <footer className="flex flex-row w-full h-full p-4 justify-end items-center gap-8 bg-sidebar/20 border-t border-sidebar">
                {/* <li>Hello</li>
                <li>Hello</li>
                <li>Hello</li> */}
                {/* <p>GitHub</p>
                <p>Instagram</p>
                <p>Contact</p> */}
                <Label>GitHub</Label>
                <Label>Instagram</Label>
                <Label>Contact</Label>
        </footer>
    )
}