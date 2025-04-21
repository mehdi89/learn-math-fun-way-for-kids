import { MathGame } from "@/components/math-game"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-100 to-pink-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">
        <MathGame />
      </div>
    </main>
  )
}
