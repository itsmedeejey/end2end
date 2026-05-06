"use client"
import { generateIdentityKeys } from "@/lib/libsodium/identity"
import api from "@/config/axios"
import { useEffect } from "react"
import { getIdentityKeys } from "@/lib/libsodium/store/sodiumStore"

export const useInitSodium = () => {

  useEffect(() => {
    const init = async () => {

      try {

        const identity = await getIdentityKeys();

        if (!identity?.publicKey || !identity.privateKey) {
          const publicKey = await generateIdentityKeys();
          await api.post("api/keys/upload", { publicKey: publicKey })
        }

      } catch (error) {
        console.error(
          "sodium initialization failed",
          error
        );
      }
    }

    init()
  }, [])

}
