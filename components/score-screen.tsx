"use client"
import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Star, RotateCcw, Volume2, VolumeX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ScoreScreenProps {
  score: number
  totalRounds: number
  onPlayAgain: () => void
}

export function ScoreScreen({ score, totalRounds, onPlayAgain }: ScoreScreenProps) {
  const percentage = Math.round((score / totalRounds) * 100)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Sound references
  const victorySoundRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const starSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio elements
    victorySoundRef.current = new Audio("/sounds/victory.mp3")
    clickSoundRef.current = new Audio("/sounds/click.mp3")
    starSoundRef.current = new Audio("/sounds/star.mp3")

    // Set volume levels
    if (victorySoundRef.current) victorySoundRef.current.volume = 0.5
    if (clickSoundRef.current) clickSoundRef.current.volume = 0.3
    if (starSoundRef.current) starSoundRef.current.volume = 0.4

    // We don't auto-play victory sound anymore - it will play on first interaction

    return () => {
      // Stop all sounds when component unmounts
      try {
        if (victorySoundRef.current) victorySoundRef.current.pause()
      } catch (err) {
        // Silently catch errors
      }
    }
  }, [])

  const playSound = (type: "click" | "star" | "victory") => {
    if (!soundEnabled) return
    setHasUserInteracted(true)

    try {
      if (type === "click" && clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0
        clickSoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      } else if (type === "star" && starSoundRef.current) {
        starSoundRef.current.currentTime = 0
        starSoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      } else if (type === "victory" && victorySoundRef.current) {
        victorySoundRef.current.currentTime = 0
        victorySoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      }
    } catch (err) {
      // Silently catch errors
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    setHasUserInteracted(true)
    playSound("click")
  }

  const getMessage = () => {
    if (percentage >= 90) return "Amazing! You're a math superstar! 🌟"
    if (percentage >= 70) return "Great job! You're getting really good! 🎉"
    if (percentage >= 50) return "Good effort! Keep practicing! 👍"
    return "Keep trying! Practice makes perfect! 💪"
  }

  const getStars = () => {
    if (percentage >= 90) return 5
    if (percentage >= 70) return 4
    if (percentage >= 50) return 3
    if (percentage >= 30) return 2
    return 1
  }

  return (
    <motion.div
      key="score"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="absolute -z-10 inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-yellow-300 to-pink-300 opacity-70"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              rotate: [0, Math.random() * 360, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-purple-300">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleSound}>
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 10, 0] }}
          transition={{ delay: 0.2, duration: 1 }}
          className="flex justify-center mb-6"
          onClick={() => {
            if (!hasUserInteracted) {
              playSound("victory")
            }
          }}
        >
          <Trophy className="h-32 w-32 text-yellow-500" />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-center mb-4 text-purple-700"
        >
          Game Complete!
        </motion.h2>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <p className="text-xl text-purple-600 mb-2">Your Score:</p>
          <motion.div
            className="text-5xl font-bold text-pink-600 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {score} / {totalRounds}
          </motion.div>
          <motion.div
            className="text-2xl font-semibold text-purple-500 mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {percentage}%
          </motion.div>

          <div className="flex justify-center gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                  y: i < getStars() ? [0, -10, 0] : 0,
                }}
                transition={{
                  delay: 0.5 + i * 0.2,
                  y: {
                    delay: 1.5 + i * 0.1,
                    duration: 0.3,
                    repeat: i < getStars() ? 1 : 0,
                  },
                }}
                onAnimationComplete={() => {
                  if (i < getStars()) {
                    playSound("star")
                  }
                }}
              >
                <Star className={`h-12 w-12 ${i < getStars() ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-xl font-medium text-purple-600 p-4 bg-purple-50 rounded-lg border-2 border-purple-200"
          >
            <motion.div
              animate={{
                scale: percentage >= 90 ? [1, 1.05, 1] : 1,
              }}
              transition={{
                repeat: percentage >= 90 ? Number.POSITIVE_INFINITY : 0,
                repeatDelay: 1,
                duration: 0.5,
              }}
            >
              {getMessage()}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => {
              playSound("click")
              onPlayAgain()
            }}
            className="w-full h-16 text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl border-2 border-purple-400"
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Play Again
          </Button>
        </motion.div>

        {/* Character */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute -bottom-16 right-0"
        >
          <motion.div
            className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-5xl"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
            }}
          >
            {percentage >= 70 ? "🎓" : "📚"}
          </motion.div>
        </motion.div>
      </Card>

      {/* Hidden audio elements */}
      <audio src="/sounds/victory.mp3" ref={victorySoundRef} />
      <audio src="/sounds/click.mp3" ref={clickSoundRef} />
      <audio src="/sounds/star.mp3" ref={starSoundRef} />
    </motion.div>
  )
}
