"use client"
interface ContactsCardProps {
  displayName: string;
  onClick?: () => void;
}

export default function ContactsCard({ displayName, onClick }: ContactsCardProps) {

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

          <h1 className="text-sm font-medium">{displayName}</h1>

        </div>

      </div>


    </div>









  )
}
