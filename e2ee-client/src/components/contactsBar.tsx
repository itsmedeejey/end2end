"use client"
import ContactsCard from "./contactsCard";
import { useRouter } from "next/navigation"
import { useChatStore } from "@/store/chat.store";
import Link from "next/link";

export default function ContactsBar() {
  const router = useRouter();
  const conversations = useChatStore((state) => state.conversations);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const setIsSearchOpen = useChatStore((state) => state.setIsSearchOpen);

  const handleConversationClick = (conversation: typeof conversations[number]) => {
    setActiveConversationId(conversation.conversationId);
    const id = conversation.conversationId;
    router.push(`/chat/${id}`);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div onClick={() => { router.push("/") }} className=" cursor-pointer p-2 flex justify-center   font-extrabold text-4xl font-mono text-white mb-4">End2End </div>

      <div className="p-2">
        <button onClick={() => setIsSearchOpen(true)} className="w-full p-2  bg-linear-to-br from-emerald-400 to-green-600 rounded-lg shadow-2xl  text-gray-200 cursor-pointer hover:bg-green-800 ">start a new chat</button>
      </div>


      <div className="flex-1 overflow-y-auto px-2 space-y-2 scroll-auto ">
        {conversations.map((conversation) => (
          <ContactsCard
            key={conversation.conversationId}
            displayName={conversation.participant.displayName}
            onClick={() => handleConversationClick(conversation)}
          />
        ))}
      </div>

      <div className="p-2">
        <Link href={"/profile"}>
          <div className="h-fit p-3 text-white border text-center font-semibold  bg-linear-to-br from-gray-600 to-gray-800  rounded-full">
            Your Profile
          </div>
        </Link>
      </div>
    </div>
  );
}
