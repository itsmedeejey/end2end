"use client"
interface ContactsCardProps {
  displayName: string;
  lastMessageText?: string | null;
  unreadCount?: number;
  onClick?: () => void;
}

export default function ContactsCard({
  displayName,
  lastMessageText,
  unreadCount = 0,
  onClick,
}: ContactsCardProps) {

  return (
    <div>
      <div
        onClick={onClick}
        className="mt-6">

        <div className="text-white rounded-2xl border border-gray-400 cursor-pointer flex items-center gap-3 bg-gray-500 p-2 m-2 hover:bg-gray-700 transition duration-300">

          <div
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black">
            {displayName[0].toUpperCase()}

          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-medium">{displayName}</h1>
            {lastMessageText && (
              <p className="truncate text-xs text-gray-200">
                {lastMessageText}
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1.5 text-xs font-semibold text-black">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}

        </div>

      </div>


    </div>









  )
}
