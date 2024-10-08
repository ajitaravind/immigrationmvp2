"use client";
import { useState } from "react";

export default function ChatArea({
  messages,
}: {
  messages: Array<{ role: string; content: string }>;
}) {
  const [chatMode, setChatMode] = useState("Advisor");

  return (
    <main className="flex-1 overflow-auto p-6">
      <h2 className="text-4xl font-bold text-center mb-2">
        Your Immigration Assistant
      </h2>
      <div className="flex justify-center items-center mb-6">
        <span className="mr-2 text-[#000080]">Chat Mode:</span>
        <span className="font-bold text-[#000080]">{chatMode}</span>
      </div>
      {/* Chat messages */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <>
            <div className="flex items-start">
              <div className="bg-[#000080] rounded-full p-2 mr-2">
                {/* Bot avatar placeholder */}
              </div>
              <div className="bg-white rounded-lg p-4 max-w-md">
                <p>Hey there, I&apos;m PaveUrPath!</p>
                <p>I have two modes:</p>
                <p>Advisor → Talk with an AI immigration advisor</p>
                <p>Search → Ask questions like on Google</p>
                <p>Click below to get started →</p>
              </div>
            </div>
          </>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="flex items-start">
              <div
                className={`rounded-full p-2 mr-2 ${message.role === "ai" ? "bg-[#000080]" : "bg-[#4B0082]"}`}
              >
                {/* Avatar placeholder */}
              </div>
              <div className="bg-white rounded-lg p-4 max-w-md">
                <p>{message.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
