import { Label } from "@/components/ui/label";

export function Footer(){
    return (
        <footer className="flex flex-row w-full h-full p-4 justify-end items-center flex-5/100 gap-8 bg-sidebar/20 border-t border-sidebar">
                {/* <li>Hello</li>
                <li>Hello</li>
                <li>Hello</li> */}
                {/* <p>GitHub</p>
                <p>Instagram</p>
                <p>Contact</p> */}
                <Label className="text-sm">GitHub</Label>
                <Label className="text-sm">Instagram</Label>
                <Label className="text-sm">Contact</Label>
        </footer>
    )
}