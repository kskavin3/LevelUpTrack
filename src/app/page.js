import Image from "next/image";
import DbStatus from "@/components/DbStatus";
import PlaylistManager from "@/components/PlaylistManager";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <Image
            className="dark:invert mx-auto"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
        </div>
        
        {/* MongoDB Connection Status */}
        <div className="max-w-md mx-auto">
          <DbStatus />
        </div>

        {/* Playlist Manager */}
        <PlaylistManager />
      </main>
    </div>
  );
}
