"use client"

import React, { useState, type ChangeEvent } from "react";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useParams } from "next/navigation"

export default function ChatInputBox() {
  const [content, setContent] = useState<string>("");
  const { sendMessage } = useSendMessage();

  const params = useParams<{ id: string }>();
  const convId = params.id; // we are getting the conversationId from parameteer of the url 

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }
  const handleAutoResize = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const maxHeight = 160;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    if (event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    if (!content.trim()) return;

    event.currentTarget.form?.requestSubmit();
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      sendMessage({
        conversationId: convId,
        content: content,
      });
      setContent("");
    } catch {
      throw new Error("message could not be send")
    }
  };

  return (<div className="w-full min-w-0 flex flex-row">

    <form
      onSubmit={handleSubmit}
      className="flex w-full min-w-0 flex-row items-end gap-2">
      <textarea
        className="flex-1 min-w-0 rounded-lg bg-white p-2 resize-none focus:outline-0"
        placeholder="send encrypted messages..."
        rows={1}
        onChange={(e) => {
          handleAutoResize(e);
          handleChange(e);
        }}
        onKeyDown={handleKeyDown}
        value={content}
      />
      <button type="submit" className="flex  items-center h-10 shrink-0 rounded-lg bg-green-700 p-2 px-3  text-xl text-white cursor-pointer">send</button>

    </form>
  </div>
  )
}
