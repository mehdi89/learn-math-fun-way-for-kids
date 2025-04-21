"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface VisualBlocksProps {
  num1: number
  num2: number
  operation: "addition" | "subtraction"
  isCorrect: boolean | null
  showAnswer: boolean
  correctAnswer: number
}

export function VisualBlocks({ num1, num2, operation, isCorrect, showAnswer, correctAnswer }: VisualBlocksProps) {
  const [animationStep, setAnimationStep] = useState(0)

  // Reset animation when problem changes
  useEffect(() => {
    setAnimationStep(0)
  }, [num1, num2, operation])

  // Advance animation when showing answer
  useEffect(() => {
    if (showAnswer) {
      const timer = setTimeout(() => {
        setAnimationStep(1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showAnswer])

  // Generate blocks for visualization
  const renderBlocks = (count: number, color: string, offset = 0) => {
    return Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={`${color}-${index + offset}`}
        className={`h-10 w-10 rounded-md ${color} shadow-md flex items-center justify-center text-white font-bold`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        {index + offset + 1}
      </motion.div>
    ))
  }

  return (
    <div className="min-h-[300px]">
      {operation === "addition" ? (
        <div className="space-y-8">
          {/* First row - First number */}
          <div className="flex flex-wrap gap-2 justify-center">{renderBlocks(num1, "bg-blue-500")}</div>

          {/* Plus sign */}
          <div className="flex justify-center">
            <motion.div
              className="text-3xl font-bold text-blue-700"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
            >
              +
            </motion.div>
          </div>

          {/* Second row - Second number */}
          <div className="flex flex-wrap gap-2 justify-center">{renderBlocks(num2, "bg-green-500", num1)}</div>

          {/* Equals sign */}
          <div className="flex justify-center">
            <motion.div
              className="text-3xl font-bold text-blue-700"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1, delay: 0.5 }}
            >
              =
            </motion.div>
          </div>

          {/* Result row - Combined blocks */}
          {(isCorrect === true || showAnswer) && (
            <motion.div
              className="flex flex-wrap gap-2 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {renderBlocks(correctAnswer, "bg-purple-500")}
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* First row - First number */}
          <div className="flex flex-wrap gap-2 justify-center">{renderBlocks(num1, "bg-blue-500")}</div>

          {/* Minus sign */}
          <div className="flex justify-center">
            <motion.div
              className="text-3xl font-bold text-blue-700"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
            >
              -
            </motion.div>
          </div>

          {/* Second row - Second number */}
          <div className="flex flex-wrap gap-2 justify-center">{renderBlocks(num2, "bg-red-500")}</div>

          {/* Equals sign */}
          <div className="flex justify-center">
            <motion.div
              className="text-3xl font-bold text-blue-700"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1, delay: 0.5 }}
            >
              =
            </motion.div>
          </div>

          {/* Result row - Remaining blocks */}
          {(isCorrect === true || showAnswer) && (
            <motion.div
              className="flex flex-wrap gap-2 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {renderBlocks(correctAnswer, "bg-purple-500")}
            </motion.div>
          )}

          {/* Visual demonstration of subtraction */}
          {showAnswer && animationStep >= 1 && (
            <motion.div className="mt-8 p-4 bg-blue-100 rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-center mb-4 font-medium text-blue-700">
                Let's see how we subtract {num2} from {num1}:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: num1 }).map((_, index) => (
                  <motion.div
                    key={`demo-${index}`}
                    className={`h-10 w-10 rounded-md shadow-md flex items-center justify-center text-white font-bold ${
                      index < num1 - num2 ? "bg-purple-500" : "bg-red-500 opacity-50"
                    }`}
                    animate={
                      index >= num1 - num2
                        ? {
                            scale: [1, 0],
                            opacity: [1, 0],
                            y: [0, -20],
                          }
                        : {}
                    }
                    transition={{
                      delay: index >= num1 - num2 ? (index - (num1 - num2)) * 0.2 + 1 : 0,
                      duration: 0.5,
                    }}
                  >
                    {index + 1}
                  </motion.div>
                ))}
              </div>
              <p className="text-center mt-4 font-medium text-blue-700">
                {num1} - {num2} = {correctAnswer}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
