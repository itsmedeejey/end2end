import ContactsCard from "./contactsCard";

export default function ContactsBar() {
  return (
    <div className="flex flex-col h-full w-full">

      <div className="p-2">
        <input
          type="text"
          placeholder="Search user by id..."
          className="h-10 w-full text-black rounded-2xl bg-gray-400 px-4 outline-none font-thin"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-2 scroll-auto ">
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />
        <ContactsCard />

      </div>

    </div>
  );
}
