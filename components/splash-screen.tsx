"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 2500)

    // Animate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative">
          <motion.div
            className="absolute -top-10 -right-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Sparkles className="h-16 w-16 text-yellow-300" />
          </motion.div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl border-8 border-indigo-300">
            <motion.div
              className="text-7xl mb-4"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              🧮
            </motion.div>
            <motion.h1
              className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              Math Adventure
            </motion.h1>
            <motion.p
              className="text-xl text-purple-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Learn math the fun way!
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="w-64 h-4 bg-white/30 rounded-full mt-12 overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: 256 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-0 right-0 text-center text-white/70 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        © 2025 Math Adventure
      </motion.div>
    </motion.div>
  )
}
