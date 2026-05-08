"use client"
import { useState } from "react"
import api from "@/config/axios"
import axios from 'axios'
import RecoveryKeyCard from "./recoveryKeyCard"

export default function RegisterCard() {
  const [name, setName] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showRecoveryCard, setShowRecoveryCard] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
    setError(null)
  }

  const RegisterUser = async () => {
    if (!name.trim()) {
      setError("Recovery key is required")
      return
    }

    try {
      setLoading(true)
      const res = await api.post(
        "api/auth/register",
        {
          displayName: name.trim(),
        }
      )
      const recoveryKey = res.data.recoveryKey;
      setRecoveryKey(recoveryKey)
      setShowRecoveryCard(true)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.log(err)
        setError(err.response?.data?.message || "Login failed")
      } else {
        setError("Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  return (

    <div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          RegisterUser()
        }}
        className="w-full max-w-sm bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col gap-5"
      >
        <h1 className="text-white font-mono text-2xl text-center">
          Enter your Display Name
        </h1>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <input
          type="text"
          value={name}
          onChange={handleChange}
          disabled={loading}
          placeholder="display name"
          className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition text-white font-medium disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {
        showRecoveryCard && (
          <RecoveryKeyCard
            recoveryKey={recoveryKey}
            onDone={() => {
              setShowRecoveryCard(false);

              window.location.href = "/";
            }}
          />
        )
      }

    </div>
  )
}
