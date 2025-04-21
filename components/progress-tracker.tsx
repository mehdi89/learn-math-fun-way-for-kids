"use client"

import { motion } from "framer-motion"
import { Trophy, Flame } from "lucide-react"

interface ProgressTrackerProps {
  score: number
  streak: number
}

export function ProgressTracker({ score, streak }: ProgressTrackerProps) {
  // Calculate level based on score
  const level = Math.floor(score / 10) + 1
  const progressToNextLevel = (score % 10) / 10

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-blue-600">Level {level}</span>
          <span className="text-sm font-medium text-blue-600">{score} points</span>
        </div>
        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${progressToNextLevel * 100}%` }}
            initial={{ width: "0%" }}
            animate={{ width: `${progressToNextLevel * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-xs text-blue-400 mt-1">
          <span>Level {level}</span>
          <span>Level {level + 1}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="font-medium text-blue-700">Score: {score}</span>
        </div>

        <div className="flex items-center">
          <Flame className={`h-5 w-5 ${streak > 0 ? "text-orange-500" : "text-gray-400"} mr-2`} />
          <motion.span
            className="font-medium text-blue-700"
            animate={{ scale: streak > 2 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            Streak: {streak}
          </motion.span>
        </div>
      </div>
    </div>
  )
}
