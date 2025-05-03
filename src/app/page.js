import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 text-center">
        <h1 className="text-2xl font-bold">LevelUp Track</h1>
        <p className="text-sm text-gray-600">Your AI-powered career development assistant</p>
      </header>
      
      <main className="flex-1 w-full mx-auto px-2" style={{ maxWidth: "800px" }}>
        <ChatInterface />
      </main>
    </div>
  );
}
