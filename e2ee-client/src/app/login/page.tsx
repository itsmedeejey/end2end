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
        <div className="px-10 text-center">
          <h1 className="text-5xl font-sans font-bold leading-tight">
            Privacy Without{" "}
            <span className="text-blue-700 text-7xl">Footprints</span>
          </h1>

          <p className="mt-6 text-md text-gray-700 max-w-2xl">
            Secure conversations with zero metadata collection and
            end-to-end encryption by default.
          </p>
        </div>
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
