import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatArea from "@/components/ui/chat.area";
import { Home, Calculator, User, Settings, Send } from "lucide-react";
import Link from "next/link";

export default function Chat() {
  return (
    <div className="flex h-screen bg-gradient-to-b from-[#E6E6FA] to-[#D8BFD8]">
      {/* Sidebar */}
      <aside className="w-20 bg-white bg-opacity-20 flex flex-col items-center py-4 space-y-6">
        <Link
          href="#"
          className="p-2 rounded-lg bg-[#000080]/20 text-[#000080]"
        >
          <Home className="h-6 w-6" />
        </Link>
        <Link href="#" className="p-2 rounded-lg text-[#000080]/70">
          <Calculator className="h-6 w-6" />
        </Link>
        <Link href="#" className="p-2 rounded-lg text-[#000080]">
          <User className="h-6 w-6" />
        </Link>
        <Link href="#" className="p-2 rounded-lg text-[#000080]/70">
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
        </header>
        <ChatArea />

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
            />
            <Button size="icon" className="bg-transparent">
              <Send className="h-6 w-6 text-[#000080]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
