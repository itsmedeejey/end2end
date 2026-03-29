"use client"

import ContactsBar from "@/components/contactsBar";

export default function Home() {
  return (
    <div className="flex h-screen w-screen gap-3 overflow-hidden  bg-gray-699 ">
      <div className="flex bg-gray-800 w-1/5 ">
        <ContactsBar></ContactsBar>
      </div>

      <div className="flex w-4/5"></div>

    </div>
  );
}
