"use client";

import axios from "axios";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatArea from "@/components/ui/chat.area";
import { Home, Calculator, User, Settings, Send } from "lucide-react";
import Link from "next/link";

interface Message {
	role: "human" | "ai";
	content: string;
}

export default function Chat() {
	const router = useRouter();
	const { toast } = useToast();
	const [isTestMode, setIsTestMode] = useState(true); //change to false for production
	const [inputMessage, setInputMessage] = useState("");
	const [chatMessages, setChatMessages] = useState<Message[]>([]);
	const [remainingMessages, setRemainingMessages] = useState(20);
	const [showOverlay, setShowOverlay] = useState(false);
	const email = useAuthStore((state) => state.email);
	const token = useAuthStore((state) => state.token);
	const thread_id = useAuthStore((state) => state.thread_id);

	const isAuthenticated = !!token;

	const mockApiCall = useCallback(async (message: string) => {
		return new Promise<{ data: { messages: Message[] } }>((resolve) => {
			setTimeout(() => {
				resolve({
					data: {
						messages: [
							{ role: "human", content: message },
							{ role: "ai", content: `Mock response to: ${message}` },
						],
					},
				});
			}, 500);
		});
	}, []);

	const handleSendMessage = useCallback(async () => {
		if (inputMessage.trim() === "") return;
		if (!isAuthenticated && remainingMessages <= 0) return;

		if (!isAuthenticated) {
			setRemainingMessages((prev) => {
				const newCount = prev - 1;
				if (newCount === 0) {
					setShowOverlay(true);
					toast({
						title: "Message Limit Reached",
						description:
							"You've reached the free message limit. Sign up to continue chatting!",
					});
				}
				return newCount;
			});
		}

		const newHumanMessage: Message = { role: "human", content: inputMessage };
		setChatMessages((prevMessages) => [...prevMessages, newHumanMessage]);
		setInputMessage("");

		try {
			const response = isTestMode
				? await mockApiCall(inputMessage)
				: await axios.post("http://localhost:8000/chat", {
						messages: [{ role: "human", content: inputMessage }],
						email: email || "",
						thread_id: thread_id || "",
						prompt: inputMessage,
				  });

			if (response.data.messages && response.data.messages.length > 0) {
				const aiResponse = response.data.messages.find(
					(msg: Message) => msg.role === "ai"
				);
				if (aiResponse) {
					setChatMessages((prevMessages) => [
						...prevMessages,
						{
							role: "ai",
							content: aiResponse.content,
						},
					]);
				}
			}
		} catch (error) {
			console.error("Error sending chat message:", error);
			// TODO: Handle error (e.g., show error message to user)
		}
	}, [inputMessage, email, thread_id, remainingMessages, toast, isTestMode]);

	const memoizedChatArea = useMemo(
		() => <ChatArea messages={chatMessages} />,
		[chatMessages]
	);

	useEffect(() => {
		if (!isAuthenticated && remainingMessages === 0) {
			setShowOverlay(true);
		}
	}, [remainingMessages, isAuthenticated]);

	return (
		<div className="flex h-screen bg-gradient-to-b from-[#E6E6FA] to-[#D8BFD8]">
			{/* Sidebar */}
			<aside className="w-20 bg-white bg-opacity-20 flex flex-col items-center py-4 space-y-6">
				<Link
					href="#"
					className="p-2 rounded-lg bg-[#000080]/20 text-[#000080]"
					title="Home"
				>
					<Home className="h-6 w-6" />
				</Link>
				<Link
					href="#"
					className="p-2 rounded-lg text-[#000080]/70"
					title="Points Calculator"
				>
					<Calculator className="h-6 w-6" />
				</Link>
				<Link
					href="#"
					className="p-2 rounded-lg text-[#000080]"
					title="Profile"
				>
					<User className="h-6 w-6" />
				</Link>
				<Link
					href="#"
					className="p-2 rounded-lg text-[#000080]/70"
					title="Settings"
				>
					<Settings className="h-6 w-6" />
				</Link>
			</aside>

			{/* Main content */}
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<header className="bg-white bg-opacity-20 p-4 flex justify-between items-center">
					<div className="flex items-center space-x-4">
						<h1 className="text-2xl font-bold text-[#000080]">PaveUrPath</h1>
						<select className="bg-transparent text-[#000080] border-none">
							<option>Australia</option>
						</select>
					</div>
					<div className="flex items-center space-x-4">
						{!isAuthenticated && (
							<>
								<Button
									className="bg-[#000080] text-white"
									onClick={() => router.push("/signup")}
								>
									Sign up
								</Button>
								<div className="text-[#000080] font-semibold">
									You have {remainingMessages} messages left
								</div>
							</>
						)}
						{isAuthenticated && (
							<Button
								className="bg-[#000080] text-white"
								onClick={() => useAuthStore.getState().clearAuth()}
							>
								Sign out
							</Button>
						)}
					</div>
				</header>

				{memoizedChatArea}

				{showOverlay && (
					<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white p-6 rounded-lg text-center">
							<h2 className="text-xl font-bold mb-4">Message Limit Reached</h2>
							<p className="mb-4">
								You&apos;ve used all your free messages. Sign up to continue
								chatting!
							</p>
							<Button
								onClick={() => router.push("/signup")}
								className="bg-[#000080] text-white"
							>
								Sign Up Now
							</Button>
						</div>
					</div>
				)}

				{/* Input area */}
				<div className="p-4 bg-white bg-opacity-20">
					<div className="flex justify-center space-x-2 mb-4">
						<Button variant="outline" className="bg-white text-[#000080]">
							List all visas
						</Button>
						<Button variant="outline" className="bg-white text-[#000080]">
							Recommend me visas based on my profile
						</Button>
						<Button variant="outline" className="bg-white text-[#000080]">
							Review visa application forms
						</Button>
					</div>
					<div className="flex items-center bg-white rounded-full p-2">
						<Input
							type="text"
							placeholder="Type a message"
							className="flex-1 border-none focus:ring-0"
							value={inputMessage}
							onChange={(e) => setInputMessage(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSendMessage();
							}}
							disabled={!isAuthenticated && remainingMessages === 0}
						/>
						<Button
							className="bg-transparent"
							onClick={handleSendMessage}
							disabled={!isAuthenticated && remainingMessages === 0}
						>
							<Send className="h-6 w-6 text-[#000080]" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
