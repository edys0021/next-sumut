import Image from "next/image";
import { IMAGE_PATHS } from "@/lib/assets";

export default function Navbar() {
    return (
        <div className="nav" >
            <div className="nav-title">
                <div className="nav-text">eBranch</div>
            </div>
            <Image
                alt="logo-sumut"
                className="elogo-sumut"
                height={60}
                priority
                // sizes="(max-width: 768px) 120px, 180px"
                src={IMAGE_PATHS.sumutLogoColor}
                width={180}
            />
        </div>
    )
}
