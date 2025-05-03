import Image from "next/image";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">LevelUp Track</h1>
          <p className="text-gray-600">Your AI-powered career development assistant</p>
        </div>
        
        {/* Chat Interface */}
        <div className="h-[75vh] border rounded-lg shadow-sm">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
