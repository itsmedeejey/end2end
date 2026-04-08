import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "@/config/axios"


export default function LoginCard() {
  const [key, setKey] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKey(event.target.value)
    setError(null)
  }

  const loginUser = async () => {
    if (!key.trim()) {
      setError("Recovery key is required")
      return
    }

    try {
      setLoading(true)
      await axios.post(
        "/api/auth/login",
        {
          recoveryKey: key.trim(),
        }
      )
      router.push("/")
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
    <form
      onSubmit={(e) => {
        e.preventDefault()
        loginUser()
      }}
      className="w-full max-w-sm bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col gap-5"
    >
      <h1 className="text-white font-mono text-2xl text-center">
        Enter your Recovery Key
      </h1>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <input
        type="text"
        value={key}
        onChange={handleChange}
        disabled={loading}
        placeholder="Recovery Key"
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
  )
}
