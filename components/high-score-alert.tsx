"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Trophy, Star } from "lucide-react"
import confetti from "canvas-confetti"

interface HighScoreAlertProps {
  score: number
  previousBest?: number
  onClose: () => void
}

export function HighScoreAlert({ score, previousBest = 0, onClose }: HighScoreAlertProps) {
  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Trigger confetti when the component mounts
    const rect = alertRef.current?.getBoundingClientRect()
    if (rect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          y: (rect.top + rect.height / 2) / window.innerHeight,
          x: 0.5,
        },
      })
    }

    // Close the alert after 5 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      ref={alertRef}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-xl shadow-lg border-4 border-yellow-300">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">New High Score!</h3>
            <div className="flex items-center gap-2">
              <div className="text-yellow-100 text-sm">
                {previousBest > 0 ? (
                  <span>Previous best: {previousBest}</span>
                ) : (
                  <span>First score in this category!</span>
                )}
              </div>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
              >
                <Star className="h-5 w-5 text-white fill-white" />
              </motion.div>
            </div>
          </div>
          <div className="bg-white rounded-full px-3 py-1 font-bold text-orange-500">{score}</div>
        </div>
      </div>
    </motion.div>
  )
}
