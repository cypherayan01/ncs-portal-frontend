import React from 'react'
import { Link } from "react-router-dom";
export default function Header() {
  return (
    <>
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Indian emblem + Ministry logo */}
            <div className="flex items-center space-x-4">
              <Link to="/">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/d/d4/Ministry_of_Labour_and_Employment.png"
                alt="Indian Emblem"
                className="h-12 w-auto object-contain"
              />
              </Link>
            </div>
            {/* Right Side - G20 logo */}
            <div>
              <img
                src="https://recruitment.ncs.gov.in/assets/logoNCS-DqbkpRzY.webp"
                alt="Ncs Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}