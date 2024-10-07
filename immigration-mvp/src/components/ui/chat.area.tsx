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
        Your Immigration Assistant.
      </h2>
      <div className="flex justify-center items-center mb-6">
        <span className="mr-2 text-[#000080]">Chat Mode:</span>
        <span className="font-bold text-[#000080]">{chatMode}</span>
      </div>

      {/* Chat messages */}
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="bg-[#000080] rounded-full p-2 mr-2">
            {/* Bot avatar placeholder */}
          </div>
          <div className="bg-white rounded-lg p-4 max-w-md">
            <p>Hey there, I&apos;m PaveUrPath!</p>
            <p>I have two modes:</p>
            <p>Advisor → Talk with an AI immigration advisor</p>
            <p>Search → Ask questions like on Google</p>
            <p>click below to get started →</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="bg-[#000080] rounded-full p-2 mr-2">
            {/* Bot avatar placeholder */}
          </div>
          <div className="bg-white rounded-lg p-4 max-w-md">
            <p>Chat mode switched to Search!</p>
            <p>Ask questions just like Google with better results!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
