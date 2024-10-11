"use client";
import { useState } from "react";

export default function ChatArea({
	messages,
}: {
	messages: Array<{ role: string; content: string }>;
}) {
	return (
		<main className="flex-1 overflow-auto p-6">
			<h2 className="text-4xl font-bold text-center mb-2">
				Your Immigration Assistant
			</h2>
			<div className="flex justify-center items-center mb-6"></div>
			{/* Chat messages */}
			<div className="space-y-4">
				{messages.length === 0 ? (
					<>
						<div className="flex items-start">
							<div className="bg-[#000080] rounded-full p-2 mr-2">
								{/* Bot avatar placeholder */}
							</div>
							<div className="bg-white rounded-lg p-4 max-w-md">
								<p>Hello, I'm PaveUrPath, your expert immigration advisor.</p>
								<p>
									→ I'm here to provide you with the best guidance and support
									for your immigration journey.
								</p>
								<p>
									→ For a more personalized experience, I recommend signing up.
									This way, I can tailor my advice to your specific situation
									and needs.
								</p>
								<p>
									Let's start our conversation{" "}
									<span className="text-blue-500">🤝</span>
								</p>
							</div>
						</div>
					</>
				) : (
					messages.map((message, index) => (
						<div key={index} className="flex items-start">
							<div
								className={`rounded-full p-2 mr-2 ${
									message.role === "ai" ? "bg-[#000080]" : "bg-[#4B0082]"
								}`}
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
