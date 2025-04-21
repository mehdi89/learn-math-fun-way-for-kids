"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { Trophy, Star } from "lucide-react"

interface RewardAnimationProps {
  show: boolean
  score: number
}

export function RewardAnimation({ show, score }: RewardAnimationProps) {
  useEffect(() => {
    if (show) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        >
          <motion.div
            className="bg-gradient-to-r from-yellow-300 to-amber-500 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center"
            animate={{ y: [50, 0], rotate: [-5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex justify-center mb-4"
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Trophy className="h-20 w-20 text-yellow-600" />
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-yellow-900 mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            >
              Amazing Streak!
            </motion.h2>

            <p className="text-xl text-yellow-800 mb-4">You're on fire! Keep up the great work!</p>

            <div className="flex justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Star className="h-8 w-8 text-yellow-600 fill-yellow-500" />
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-2xl font-bold text-yellow-900"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Total Score: {score}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
