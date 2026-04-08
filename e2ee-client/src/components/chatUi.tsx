"use client"

type ChatUiProps = {
  content: string;
  type: "sent" | "received";
}

export default function ChatUi({ content, type }: ChatUiProps) {

  return (<div className="">

    {type === "sent" && (
      <div className="m-5 flex  justify-end">
        <div className="bg-white w-fit p-3 rounded-l-xl rounded-t-xl  ">
          {content}
        </div>
      </div>
    )}

    {type === "received" && (
      <div className="m-5 flex  justify-start">
        <div className="bg-green-300 w-fit p-3 rounded-r-xl rounded-t-xl  ">
          {content}
        </div>
      </div>
    )}

  </div>
  )
}
