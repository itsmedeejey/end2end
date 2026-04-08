"use client"
type chatTopBarProps = {
  displayName: string;
}

export default function ChatTopBar({ displayName }: chatTopBarProps) {
  const initial = displayName ? displayName[0].toUpperCase() : "";
  return (
    <div>
      <div className="flex flex-row p-2 h-fit w-screen bg-gray-800">
        <div className="flex items-center justify-center text-white" >
        </div>
        <div className="flex flex-row gap-2 items-center text-xl ml-2 cursor-pointer  " >
          <div className="ml-2 w-10 h-10 flex items-center justify-center rounded-full bg-white">
            {initial}
          </div>
          <div className="text-white">{displayName}</div>
        </div>
      </div>
    </div>
  );
}
