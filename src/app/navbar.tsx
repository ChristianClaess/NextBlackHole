import Link from "next/link";
import React from "react";

const Navbar = () =>{
    return (
        <nav className ='fixed top-0 w-full flex items-center justify-around 
        py-5 px-25 border-b border-gray-700 bg-black'>
            <Link href="/" className="transition duration-300 hover:scale-110">
                Black Hole Simulatons
            </Link>
            <ul className="flex gap-10 text-lg">
                 <Link href="/Image" className="transition duration-300 hover:scale-110">
                Image-Background
            </Link>
               <Link href="/procedural" className="transition duration-300 hover:scale-110">
                Procedurally Generated-Background
            </Link>

            </ul>

        </nav>

    )

}
export default Navbar;