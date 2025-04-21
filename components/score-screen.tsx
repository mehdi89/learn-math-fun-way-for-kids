"use client"
import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Star, RotateCcw, Volume2, VolumeX, Home, Share2, Download, Sparkles } from "lucide-react"

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
  const [showConfetti, setShowConfetti] = useState(false)

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

    // Show confetti after a short delay
    const timer = setTimeout(() => {
      setShowConfetti(true)
    }, 500)

    return () => {
      // Stop all sounds when component unmounts
      try {
        if (victorySoundRef.current) victorySoundRef.current.pause()
        clearTimeout(timer)
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
        {showConfetti &&
          [...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 20 + 10,
                height: Math.random() * 20 + 10,
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
              }}
              initial={{ y: -100, opacity: 0 }}
              animate={{
                y: window.innerHeight * 1.5,
                opacity: [0, 1, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: Math.random() * 5,
              }}
            />
          ))}

        {/* Animated background bubbles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-yellow-300 to-pink-300 opacity-70"
            style={{
              width: Math.random() * 80 + 40,
              height: Math.random() * 80 + 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              rotate: [0, Math.random() * 360, 0],
              scale: [1, Math.random() * 0.3 + 0.8, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <Card className="p-10 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl border-8 border-indigo-300">
        <div className="absolute top-6 right-6 flex gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={toggleSound}>
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: [0, 10, -10, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            delay: 0.2,
            duration: 1,
            y: {
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 2,
              duration: 1.5,
            },
          }}
          className="flex justify-center mb-8"
          onClick={() => {
            if (!hasUserInteracted) {
              playSound("victory")
            }
          }}
        >
          <div className="relative">
            <Trophy className="h-40 w-40 text-yellow-500" />
            <motion.div
              className="absolute -top-5 -right-5"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sparkles className="h-12 w-12 text-yellow-300" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent"
        >
          Game Complete!
        </motion.h2>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-10"
        >
          <p className="text-2xl text-indigo-600 mb-3">Your Score:</p>
          <motion.div
            className="text-6xl font-bold text-pink-600 mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {score} / {totalRounds}
          </motion.div>
          <motion.div
            className="text-3xl font-semibold text-indigo-500 mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <span className="inline-block px-6 py-2 bg-indigo-100 rounded-full">{percentage}%</span>
          </motion.div>

          <div className="flex justify-center gap-3 mb-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                  y: i < getStars() ? [0, -15, 0] : 0,
                }}
                transition={{
                  delay: 0.5 + i * 0.2,
                  y: {
                    delay: 1.5 + i * 0.1,
                    duration: 0.5,
                    repeat: i < getStars() ? 1 : 0,
                  },
                }}
                onAnimationComplete={() => {
                  if (i < getStars()) {
                    playSound("star")
                  }
                }}
              >
                <Star className={`h-16 w-16 ${i < getStars() ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-2xl font-medium text-indigo-600 p-6 bg-indigo-50 rounded-2xl border-4 border-indigo-200 mb-8"
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

          <div className="grid grid-cols-2 gap-4 mb-4">
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
                className="w-full h-16 text-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl border-4 border-indigo-400"
              >
                <RotateCcw className="mr-2 h-5 w-5" /> Play Again
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  playSound("click")
                  onPlayAgain()
                }}
                className="w-full h-16 text-xl border-4 border-pink-400 text-pink-600 rounded-xl"
              >
                <Home className="mr-2 h-5 w-5" /> Home
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" onClick={() => playSound("click")} className="w-full h-12 text-lg text-indigo-600">
              <Download className="mr-2 h-5 w-5" /> Save Certificate
            </Button>
          </motion.div>
        </motion.div>

        {/* Character */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute -bottom-20 right-0"
        >
          <motion.div
            className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-6xl shadow-lg"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 3,
            }}
          >
            {percentage >= 70 ? "🦄" : "🐢"}
          </motion.div>
        </motion.div>

        {/* Additional character */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute -bottom-16 left-10"
        >
          <motion.div
            className="w-24 h-24 bg-pink-400 rounded-full flex items-center justify-center text-5xl shadow-lg"
            animate={{
              y: [0, -10, 0],
              rotate: [0, -5, 5, 0],
              x: [0, 5, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2.5,
              delay: 0.5,
            }}
          >
            {percentage >= 50 ? "🎓" : "📚"}
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
