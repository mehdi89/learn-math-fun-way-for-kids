"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface OperationDemoProps {
  open: boolean
  onClose: () => void
  num1: number
  num2: number
  operation: "addition" | "subtraction"
  correctAnswer: number
}

export function OperationDemo({ open, onClose, num1, num2, operation, correctAnswer }: OperationDemoProps) {
  const [step, setStep] = useState(0)
  const maxSteps = operation === "addition" ? 3 : 4

  // Reset step when dialog opens
  useEffect(() => {
    if (open) {
      setStep(0)
    }
  }, [open])

  // Auto-advance steps
  useEffect(() => {
    if (!open) return

    const timer = setTimeout(() => {
      if (step < maxSteps - 1) {
        setStep(step + 1)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [step, open, maxSteps])

  const renderAdditionDemo = () => {
    return (
      <div className="space-y-6">
        {step >= 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-blue-50 p-4 rounded-xl">
            <p className="text-center font-medium text-blue-700 mb-4">First, let's count the first group of blocks:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: num1 }).map((_, i) => (
                <motion.div
                  key={`first-${i}`}
                  className="h-10 w-10 rounded-md bg-blue-500 shadow-md flex items-center justify-center text-white font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <p className="text-center mt-2 font-medium text-blue-700">We have {num1} blocks</p>
          </motion.div>
        )}

        {step >= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 p-4 rounded-xl">
            <p className="text-center font-medium text-green-700 mb-4">Next, let's count the second group of blocks:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: num2 }).map((_, i) => (
                <motion.div
                  key={`second-${i}`}
                  className="h-10 w-10 rounded-md bg-green-500 shadow-md flex items-center justify-center text-white font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <p className="text-center mt-2 font-medium text-green-700">We have {num2} blocks</p>
          </motion.div>
        )}

        {step >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-purple-50 p-4 rounded-xl">
            <p className="text-center font-medium text-purple-700 mb-4">When we add them together, we get:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: correctAnswer }).map((_, i) => (
                <motion.div
                  key={`result-${i}`}
                  className={`h-10 w-10 rounded-md shadow-md flex items-center justify-center text-white font-bold ${
                    i < num1 ? "bg-blue-500" : "bg-green-500"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <p className="text-center mt-4 font-bold text-purple-700 text-xl">
              {num1} + {num2} = {correctAnswer}
            </p>
          </motion.div>
        )}
      </div>
    )
  }

  const renderSubtractionDemo = () => {
    return (
      <div className="space-y-6">
        {step >= 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-blue-50 p-4 rounded-xl">
            <p className="text-center font-medium text-blue-700 mb-4">First, let's count our starting blocks:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: num1 }).map((_, i) => (
                <motion.div
                  key={`start-${i}`}
                  className="h-10 w-10 rounded-md bg-blue-500 shadow-md flex items-center justify-center text-white font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <p className="text-center mt-2 font-medium text-blue-700">We have {num1} blocks</p>
          </motion.div>
        )}

        {step >= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 p-4 rounded-xl">
            <p className="text-center font-medium text-red-700 mb-4">Now, we need to take away {num2} blocks:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: num1 }).map((_, i) => (
                <motion.div
                  key={`remove-${i}`}
                  className={`h-10 w-10 rounded-md shadow-md flex items-center justify-center text-white font-bold ${
                    i >= num1 - num2 ? "bg-red-500" : "bg-blue-500"
                  }`}
                  initial={{ scale: 1 }}
                  animate={
                    i >= num1 - num2
                      ? {
                          scale: [1, 0],
                          opacity: [1, 0],
                          y: [0, -20],
                        }
                      : {}
                  }
                  transition={{
                    delay: i >= num1 - num2 ? (i - (num1 - num2)) * 0.2 : 0,
                    duration: 0.5,
                  }}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <p className="text-center mt-2 font-medium text-red-700">We're taking away {num2} blocks</p>
          </motion.div>
        )}

        {step >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-purple-50 p-4 rounded-xl">
            <p className="text-center font-medium text-purple-700 mb-4">After taking away {num2} blocks, we have:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: correctAnswer }).map((_, i) => (
                <motion.div
                  key={`result-${i}`}
                  className="h-10 w-10 rounded-md bg-purple-500 shadow-md flex items-center justify-center text-white font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-yellow-50 p-4 rounded-xl">
            <p className="text-center font-medium text-yellow-700 mb-2">Let's count to make sure:</p>
            <p className="text-center font-bold text-yellow-800 text-lg mb-4">
              We started with {num1} blocks, took away {num2} blocks, and have {correctAnswer} blocks left.
            </p>
            <div className="flex justify-center">
              <motion.div
                className="text-3xl font-bold text-yellow-600"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                {num1} - {num2} = {correctAnswer} ✓
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">How to {operation === "addition" ? "Add" : "Subtract"} Numbers</DialogTitle>
          <DialogDescription>
            Let's learn how to {operation === "addition" ? "add" : "subtract"} step by step!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{operation === "addition" ? renderAdditionDemo() : renderSubtractionDemo()}</div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-1">
            {Array.from({ length: maxSteps }).map((_, i) => (
              <div key={i} className={`h-2 w-8 rounded-full ${i <= step ? "bg-blue-500" : "bg-gray-200"}`} />
            ))}
          </div>
          <Button onClick={onClose}>
            Got it! <X className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
