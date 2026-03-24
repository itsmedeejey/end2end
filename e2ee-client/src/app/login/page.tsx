"use client"
import { useState } from "react"
import RegisterCard from "@/components/registerCard"
import LoginCard from "@/components/loginCard"

export default function Login() {
  const [mode, setMode] = useState<"idle" | "register" | "login">("idle")

  return (
    <div className="flex h-screen w-screen">

      {/* left */}
      <div className="w-1/2 flex items-center justify-center bg-gray-200">
        <h1 className="text-5xl font-sans text-center px-10 ">
          Privacy is not a{" "}
          <span className="font-extrabold text-blue-700">LUXURY</span>, it is our{" "}
          <span className="font-extrabold text-blue-700">RIGHT</span>
        </h1>
      </div>

      {/* right */}
      <div className="w-1/2 bg-gray-900 flex items-center justify-center">

        {/* Conditional rendering */}
        {mode === "idle" && (
          <div className="text-white flex flex-col gap-5 w-64">
            <button
              onClick={() => setMode("register")}
              className="w-full p-2 rounded-md cursor-pointer bg-blue-600 hover:bg-blue-700 transition"
            >
              Create an Account
            </button>

            <button
              onClick={() => setMode("login")}
              className="w-full p-2 rounded-md cursor-pointer bg-blue-600 hover:bg-blue-700 transition"
            >
              Login to existing account
            </button>
          </div>
        )}

        {mode === "register" && <RegisterCard />}
        {mode === "login" && <LoginCard />}

      </div>
    </div>
  )
}
