"use client"


type PropType = {
  name: string | undefined;
  uniqueUserId: string | undefined;
}
import { useChatStore } from "@/store/chat.store";

export default function ContactProfileCard(props: PropType) {
  const setIsProfileOpen = useChatStore((s) => s.setIsProfileOpen)
  const name = props.name;
  const uniqueUserId = props.uniqueUserId;

  return (
    <div className=" w-full  h-fit  rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">

      <div
        onClick={() => setIsProfileOpen(false)}
        className="cursor-pointer text-2xl text-white "
      >
        X
      </div>

      <div className="flex flex-col items-center text-center gap-5">

        {/* Avatar */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-200 to-green-600 text-2xl font-bold text-white shadow-lg">
          {name?.charAt(0).toUpperCase()}
        </div>

        {/* User Info */}

        <h2 className="text-2xl font-semibold text-white">
          {name}
        </h2>


        {/* User ID */}
        <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
            User ID
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm text-zinc-200">
              {uniqueUserId}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
