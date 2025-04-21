"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, ChevronUp, ChevronDown, HelpCircle, Award, Volume2, VolumeX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAudio } from "@/hooks/use-audio"
import { VisualBlocks } from "@/components/visual-blocks"
import { OperationDemo } from "@/components/operation-demo"
import { RewardAnimation } from "@/components/reward-animation"
import { HelpModal } from "@/components/help-modal"
import { ProgressTracker } from "@/components/progress-tracker"

type Operation = "addition" | "subtraction"

export function MathBlocks() {
  // Game state
  const [operation, setOperation] = useState<Operation>("addition")
  const [difficulty, setDifficulty] = useState(1)
  const [showHelp, setShowHelp] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  // Current problem state
  const [num1, setNum1] = useState(2)
  const [num2, setNum2] = useState(3)
  const [userAnswer, setUserAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  // Audio handling
  const { soundEnabled, toggleSound, playSound } = useAudio()

  // Generate a new problem based on current difficulty
  const generateProblem = () => {
    let newNum1, newNum2

    // Scale the max number based on difficulty
    const maxNumber = Math.min(3 + difficulty * 2, 20)

    if (operation === "addition") {
      newNum1 = Math.floor(Math.random() * maxNumber) + 1
      newNum2 = Math.floor(Math.random() * maxNumber) + 1
    } else {
      // For subtraction, ensure num1 >= num2 to avoid negative results
      newNum2 = Math.floor(Math.random() * maxNumber) + 1
      newNum1 = newNum2 + Math.floor(Math.random() * maxNumber)
    }

    setNum1(newNum1)
    setNum2(newNum2)
    setUserAnswer(null)
    setIsCorrect(null)
    setShowAnswer(false)
    setShowDemo(false)
  }

  // Calculate the correct answer
  const correctAnswer = operation === "addition" ? num1 + num2 : num1 - num2

  // Handle user answer submission
  const checkAnswer = () => {
    if (userAnswer === null) return

    const correct = userAnswer === correctAnswer
    setIsCorrect(correct)

    if (correct) {
      playSound("correct")
      setScore(score + difficulty)
      setStreak(streak + 1)

      // Show reward animation every 5 correct answers
      if ((streak + 1) % 5 === 0) {
        setShowReward(true)
        setTimeout(() => setShowReward(false), 3000)
      }

      // Generate a new problem after a short delay
      setTimeout(() => {
        generateProblem()
      }, 1500)
    } else {
      playSound("incorrect")
      setStreak(0)
      setShowAnswer(true)
    }
  }

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty: number) => {
    setDifficulty(newDifficulty)
    generateProblem()
  }

  // Initialize with a problem
  useState(() => {
    generateProblem()
  })

  return (
    <div className="container mx-auto max-w-4xl">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-6 relative">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Math Blocks</h1>
        <p className="text-lg text-blue-500">Learn addition and subtraction with visual blocks!</p>

        <div className="absolute right-0 top-0 flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleSound}>
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowHelp(true)}>
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel - Controls */}
        <Card className="p-6 shadow-lg bg-white rounded-xl border-2 border-blue-200">
          <h2 className="text-xl font-bold mb-4 text-blue-700">Settings</h2>

          <div className="mb-6">
            <h3 className="text-md font-semibold mb-3 text-blue-600">Choose Operation</h3>
            <Tabs
              defaultValue="addition"
              value={operation}
              onValueChange={(value) => {
                setOperation(value as Operation)
                generateProblem()
                playSound("click")
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="addition" className="text-lg">
                  <Plus className="mr-2 h-4 w-4" /> Addition
                </TabsTrigger>
                <TabsTrigger value="subtraction" className="text-lg">
                  <Minus className="mr-2 h-4 w-4" /> Subtraction
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mb-6">
            <h3 className="text-md font-semibold mb-3 text-blue-600">Difficulty Level: {difficulty}</h3>
            <Slider
              value={[difficulty]}
              min={1}
              max={5}
              step={1}
              onValueChange={(value) => handleDifficultyChange(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-blue-500 mt-1">
              <span>Beginner</span>
              <span>Advanced</span>
            </div>
          </div>

          <div className="mb-6">
            <ProgressTracker score={score} streak={streak} />
          </div>

          <Button
            onClick={() => {
              generateProblem()
              playSound("click")
            }}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            New Problem
          </Button>
        </Card>

        {/* Center panel - Visual representation */}
        <Card className="p-6 shadow-lg bg-white rounded-xl border-2 border-blue-200 lg:col-span-2">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-700">
              {operation === "addition" ? "Addition" : "Subtraction"} Problem
            </h2>
            {isCorrect === false && (
              <Button variant="outline" size="sm" onClick={() => setShowDemo(true)}>
                Show Me How
              </Button>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-xl mb-6">
            <div className="text-center mb-6">
              <motion.div
                className="text-3xl font-bold text-blue-700 flex justify-center items-center gap-4"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <span>{num1}</span>
                <span>{operation === "addition" ? "+" : "-"}</span>
                <span>{num2}</span>
                <span>=</span>
                <div className="relative">
                  {userAnswer !== null ? (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`${
                        isCorrect === true ? "text-green-600" : isCorrect === false ? "text-red-600" : "text-blue-700"
                      }`}
                    >
                      {userAnswer}
                    </motion.span>
                  ) : (
                    <span className="text-gray-400">?</span>
                  )}
                </div>
              </motion.div>
            </div>

            <VisualBlocks
              num1={num1}
              num2={num2}
              operation={operation}
              isCorrect={isCorrect}
              showAnswer={showAnswer}
              correctAnswer={correctAnswer}
            />
          </div>

          {/* Answer input */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-3 text-blue-600">Your Answer</h3>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => {
                  if (userAnswer === null) {
                    setUserAnswer(0)
                  } else {
                    setUserAnswer(Math.max(0, userAnswer - 1))
                  }
                  playSound("click")
                }}
              >
                <ChevronDown className="h-6 w-6" />
              </Button>

              <div className="h-16 w-16 rounded-xl bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700">
                {userAnswer !== null ? userAnswer : "?"}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => {
                  if (userAnswer === null) {
                    setUserAnswer(1)
                  } else {
                    setUserAnswer(userAnswer + 1)
                  }
                  playSound("click")
                }}
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <Button
            onClick={checkAnswer}
            disabled={userAnswer === null}
            className="w-full h-12 text-lg bg-green-500 hover:bg-green-600 text-white"
          >
            Check Answer
          </Button>

          {/* Feedback message */}
          <AnimatePresence>
            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className={`mt-4 p-4 rounded-xl text-center text-white font-bold ${
                  isCorrect ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {isCorrect ? (
                  <div className="flex items-center justify-center gap-2">
                    <span>Great job! That's correct! 🎉</span>
                    <Award className="h-5 w-5" />
                  </div>
                ) : (
                  <div>
                    <p>Not quite right. Let's try again!</p>
                    <p className="text-sm mt-1">The correct answer is {correctAnswer}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Help modal */}
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      {/* Operation demonstration */}
      <OperationDemo
        open={showDemo}
        onClose={() => setShowDemo(false)}
        num1={num1}
        num2={num2}
        operation={operation}
        correctAnswer={correctAnswer}
      />

      {/* Reward animation */}
      <RewardAnimation show={showReward} score={score} />
    </div>
  )
}
