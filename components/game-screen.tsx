"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, X, Divide, Volume2, VolumeX, Pause, Play, Home, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Operation = "addition" | "subtraction" | "multiplication" | "division"
type Difficulty = "easy" | "medium" | "hard"

interface DifficultySettings {
  timerMultiplier: number
  minNumber: number
  maxNumber: number
  icon: string
  color: string
  hoverColor: string
  borderColor: string
  description: string
}

interface GameScreenProps {
  operation: Operation
  number: number
  currentRound: number
  totalRounds: number
  onAnswer: (correct: boolean) => void
  score: number
  timerDuration?: number
  onExit?: () => void
  difficulty?: Difficulty
  difficultySettings?: DifficultySettings
}

export function GameScreen({
  operation,
  number,
  currentRound,
  totalRounds,
  onAnswer,
  score,
  timerDuration = 10,
  onExit,
  difficulty = "medium",
  difficultySettings,
}: GameScreenProps) {
  const [question, setQuestion] = useState({ num1: 0, num2: 0, answer: 0 })
  const [options, setOptions] = useState<number[]>([])
  const [answered, setAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [timeLeft, setTimeLeft] = useState(timerDuration)
  const [timerActive, setTimerActive] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Sound references
  const correctSoundRef = useRef<HTMLAudioElement | null>(null)
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const tickingSoundRef = useRef<HTMLAudioElement | null>(null)
  const timeUpSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio elements
    correctSoundRef.current = new Audio("/sounds/correct.mp3")
    incorrectSoundRef.current = new Audio("/sounds/incorrect.mp3")
    clickSoundRef.current = new Audio("/sounds/click.mp3")
    tickingSoundRef.current = new Audio("/sounds/ticking.mp3")
    timeUpSoundRef.current = new Audio("/sounds/timeup.mp3")

    // Set volume levels
    if (correctSoundRef.current) correctSoundRef.current.volume = 0.5
    if (incorrectSoundRef.current) incorrectSoundRef.current.volume = 0.4
    if (clickSoundRef.current) clickSoundRef.current.volume = 0.3
    if (tickingSoundRef.current) tickingSoundRef.current.volume = 0.2
    if (timeUpSoundRef.current) timeUpSoundRef.current.volume = 0.5

    return () => {
      // Stop all sounds when component unmounts
      if (tickingSoundRef.current) tickingSoundRef.current.pause()
    }
  }, [])

  useEffect(() => {
    generateQuestion()
    // Reset timer when timer duration changes
    setTimeLeft(timerDuration)
  }, [currentRound, operation, number, timerDuration, difficulty, difficultySettings])

  useEffect(() => {
    if (!timerActive || answered || isPaused) {
      if (tickingSoundRef.current) {
        try {
          tickingSoundRef.current.pause()
          tickingSoundRef.current.currentTime = 0
        } catch (err) {
          console.log("Error handling ticking sound:", err)
        }
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        // Start ticking sound when time is running low (last 30% of time)
        if (prevTime <= timerDuration * 0.3 && soundEnabled && tickingSoundRef.current && document.hasFocus()) {
          try {
            // Only play if user has interacted with the page
            if (hasUserInteracted) {
              tickingSoundRef.current.play().catch(() => {
                // Silently handle the error - we don't need to log every failed attempt
              })
            }
          } catch (err) {
            // Silently catch errors
          }
        }

        if (prevTime <= 1) {
          clearInterval(timer)
          setTimerActive(false)
          if (tickingSoundRef.current) {
            try {
              tickingSoundRef.current.pause()
              tickingSoundRef.current.currentTime = 0
            } catch (err) {
              console.log("Error handling ticking sound:", err)
            }
          }
          if (soundEnabled && timeUpSoundRef.current && hasUserInteracted) {
            try {
              timeUpSoundRef.current.play().catch(() => {
                // Silently handle the error
              })
            } catch (err) {
              // Silently catch errors
            }
          }
          handleTimeUp()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timerActive, answered, soundEnabled, hasUserInteracted, timerDuration, isPaused, difficulty])

  const playSound = (type: "correct" | "incorrect" | "click") => {
    if (!soundEnabled) return
    setHasUserInteracted(true)

    try {
      if (type === "correct" && correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0
        correctSoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      } else if (type === "incorrect" && incorrectSoundRef.current) {
        incorrectSoundRef.current.currentTime = 0
        incorrectSoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      } else if (type === "click" && clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0
        clickSoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      }
    } catch (err) {
      // Silently catch errors
    }
  }

  const generateQuestion = () => {
    if (!difficultySettings) return

    let num1, num2, answer

    // Get the min and max number range based on difficulty
    const { minNumber, maxNumber } = difficultySettings

    // Helper function to get a random number within the difficulty range
    const getRandomNumber = () => {
      return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
    }

    // For multiplication and division, we need to adjust the ranges to avoid too large numbers
    const getMultiplicationFactor = () => {
      if (difficulty === "easy") return Math.floor(Math.random() * 5) + 1
      if (difficulty === "medium") return Math.floor(Math.random() * 10) + 1
      return Math.floor(Math.random() * 15) + 1
    }

    switch (operation) {
      case "addition":
        // For addition: num2 is the fixed number (e.g., 3 + 5)
        num2 = number
        num1 = getRandomNumber()
        answer = num1 + num2
        break
      case "subtraction":
        // For subtraction: ensure the result is positive
        num2 = number
        num1 = getRandomNumber() + num2 // Ensure num1 > num2
        answer = num1 - num2
        break
      case "multiplication":
        // For multiplication: adjust factors based on difficulty
        num2 = number
        num1 = getMultiplicationFactor()
        answer = num1 * num2
        break
      case "division":
        // For division: ensure clean division
        num2 = number
        answer = getMultiplicationFactor()
        num1 = num2 * answer
        break
    }

    setQuestion({ num1, num2, answer })
    generateOptions(answer)
    setAnswered(false)
    setSelectedOption(null)
    setIsCorrect(null)
    setTimeLeft(timerDuration)
    setTimerActive(true)
  }

  const generateOptions = (correctAnswer: number) => {
    const optionsArray = [correctAnswer]

    // Determine how close wrong answers should be based on difficulty
    const getOffsetRange = () => {
      switch (difficulty) {
        case "easy":
          return { min: 1, max: 3 }
        case "medium":
          return { min: 2, max: 10 }
        case "hard":
          return { min: 5, max: 50 }
        default:
          return { min: 1, max: 3 }
      }
    }

    const { min, max } = getOffsetRange()

    // For larger numbers (hard difficulty), make the offset proportional to the answer
    const getProportionalOffset = () => {
      const baseOffset = Math.floor(Math.random() * (max - min + 1)) + min

      // For hard difficulty with large numbers, make offset proportional
      if (difficulty === "hard" && correctAnswer > 100) {
        return baseOffset * Math.floor(correctAnswer / 100)
      }

      return baseOffset
    }

    while (optionsArray.length < 4) {
      // Generate a random offset
      const offset = getProportionalOffset() * (Math.random() < 0.5 ? 1 : -1)

      const newOption = correctAnswer + offset

      // Ensure the option is positive and not already in the array
      if (newOption > 0 && !optionsArray.includes(newOption)) {
        optionsArray.push(newOption)
      }
    }

    // Shuffle the options
    setOptions(optionsArray.sort(() => Math.random() - 0.5))
  }

  const handleTimeUp = () => {
    setAnswered(true)
    setIsCorrect(false)

    // Delay moving to next question - longer for learning
    setTimeout(() => {
      onAnswer(false)
    }, 3000) // 3 seconds to learn from mistake
  }

  const handleOptionSelect = (option: number) => {
    if (answered || isPaused) return

    setHasUserInteracted(true)
    playSound("click")

    setTimerActive(false)
    setSelectedOption(option)
    const correct = option === question.answer
    setIsCorrect(correct)
    setAnswered(true)

    // Play sound based on answer
    setTimeout(() => {
      playSound(correct ? "correct" : "incorrect")
    }, 100)

    // Delay moving to next question - longer delay for incorrect answers
    setTimeout(
      () => {
        onAnswer(correct)
      },
      correct ? 1800 : 3000,
    ) // 3 seconds for wrong answers to give time to learn
  }

  const getOperationSymbol = () => {
    switch (operation) {
      case "addition":
        return <Plus className="h-10 w-10 text-purple-500" />
      case "subtraction":
        return <Minus className="h-10 w-10 text-purple-500" />
      case "multiplication":
        return <X className="h-10 w-10 text-purple-500" />
      case "division":
        return <Divide className="h-10 w-10 text-purple-500" />
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    setHasUserInteracted(true)
    playSound("click")
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    playSound("click")
  }

  const handleExit = () => {
    if (onExit) {
      playSound("click")
      onExit()
    }
  }

  return (
    <motion.div
      key="game"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="p-6 shadow-xl bg-white rounded-3xl border-4 border-indigo-300">
        <h1 className="text-3xl font-bold text-center mb-4 text-purple-600">Learn math the fun way!</h1>

        <div className="flex justify-between items-center mb-4">
          <div className="bg-indigo-100 px-4 py-2 rounded-full">
            <span className="text-lg font-bold text-indigo-600">
              Round {currentRound}/{totalRounds}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={toggleSound}>
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={togglePause}>
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
          </div>

          <div className="bg-pink-100 px-4 py-2 rounded-full">
            <span className="text-lg font-bold text-pink-600">Score: {score}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium text-indigo-600">Progress</span>
            <div className="bg-pink-100 px-3 py-1 rounded-full">
              <span className="text-lg font-bold text-pink-600">{timeLeft}s</span>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-8 text-xs flex rounded-full bg-indigo-100">
              <motion.div
                className="bg-indigo-500 h-full rounded-full flex items-center justify-center"
                style={{ width: `${(currentRound / totalRounds) * 100}%` }}
                initial={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }}
                animate={{ width: `${(currentRound / totalRounds) * 100}%` }}
                transition={{ duration: 0.5 }}
              >
                {currentRound > totalRounds / 3 && (
                  <span className="text-white font-bold">{Math.round((currentRound / totalRounds) * 100)}%</span>
                )}
              </motion.div>
            </div>
          </div>
          <div className="relative pt-1 mt-3">
            <div className="overflow-hidden h-8 text-xs flex rounded-full bg-pink-100">
              <motion.div
                className="bg-pink-500 h-full rounded-full relative"
                initial={{ width: "100%" }}
                animate={{ width: `${(timeLeft / timerDuration) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </div>
        </div>

        {/* Equation display */}
        <div className="relative w-full mb-8">
          <div className="bg-white rounded-3xl shadow-md p-6 mx-auto max-w-3xl">
            <div className="flex items-center justify-center gap-4 md:gap-6">
              {/* First number */}
              <div className="flex items-center justify-center bg-white rounded-full shadow-md w-16 h-16 md:w-20 md:h-20">
                <span className="text-4xl md:text-5xl font-bold text-indigo-700">{question.num1}</span>
              </div>

              {/* Operation symbol */}
              <div className="text-purple-500">{getOperationSymbol()}</div>

              {/* Second number */}
              <div className="flex items-center justify-center bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full shadow-md w-16 h-16 md:w-20 md:h-20">
                <span className="text-4xl md:text-5xl font-bold text-white">{question.num2}</span>
              </div>

              {/* Equals sign */}
              <div className="text-4xl md:text-5xl font-bold text-indigo-700">=</div>

              {/* Answer/question mark */}
              <div
                className={`flex items-center justify-center rounded-full shadow-md w-16 h-16 md:w-20 md:h-20 ${
                  answered ? (isCorrect ? "bg-green-100" : "bg-red-100") : "bg-white"
                }`}
              >
                <span
                  className={`text-4xl md:text-5xl font-bold ${
                    answered ? (isCorrect ? "text-green-600" : "text-red-600") : "text-pink-500"
                  }`}
                >
                  {answered ? question.answer : "?"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map((option, index) => (
            <Button
              key={index}
              className={`h-16 text-3xl font-bold rounded-xl shadow-md ${
                answered && option === question.answer
                  ? "bg-green-500 hover:bg-green-600"
                  : answered && option === selectedOption && option !== question.answer
                    ? "bg-red-500 hover:bg-red-600"
                    : index % 2 === 0
                      ? "bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500"
                      : "bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500"
              }`}
              onClick={() => handleOptionSelect(option)}
              disabled={answered || isPaused}
            >
              {option}
            </Button>
          ))}
        </div>

        {/* Feedback message */}
        {answered && !isCorrect && (
          <div className="p-4 rounded-xl text-center text-white font-bold text-xl bg-red-500">
            <div>{timeLeft === 0 ? "Time's up!" : "Try again!"}</div>
            <div className="mt-2 text-lg">
              The correct answer is <span className="font-bold text-2xl">{question.answer}</span>
            </div>
          </div>
        )}

        {answered && isCorrect && (
          <div className="p-4 rounded-xl text-center text-white font-bold text-xl bg-green-500">
            <div>Great job! That's correct!</div>
          </div>
        )}
      </Card>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4"
            >
              <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Game Paused
              </h2>

              <div className="space-y-4">
                <Button
                  onClick={togglePause}
                  className="w-full h-14 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <Play className="mr-2 h-5 w-5" /> Resume Game
                </Button>

                <Button
                  variant="outline"
                  onClick={handleExit}
                  className="w-full h-14 text-xl font-bold border-2 border-pink-400 text-pink-600"
                >
                  <Home className="mr-2 h-5 w-5" /> Exit to Menu
                </Button>

                <div className="flex justify-between gap-4">
                  <Button variant="ghost" onClick={toggleSound} className="flex-1 h-12 text-lg font-medium">
                    {soundEnabled ? <Volume2 className="mr-2 h-5 w-5" /> : <VolumeX className="mr-2 h-5 w-5" />}
                    {soundEnabled ? "Sound On" : "Sound Off"}
                  </Button>

                  <Button variant="ghost" className="flex-1 h-12 text-lg font-medium">
                    <Settings className="mr-2 h-5 w-5" /> Settings
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden audio elements */}
      <audio src="/sounds/correct.mp3" ref={correctSoundRef} />
      <audio src="/sounds/incorrect.mp3" ref={incorrectSoundRef} />
      <audio src="/sounds/click.mp3" ref={clickSoundRef} />
      <audio src="/sounds/ticking.mp3" ref={tickingSoundRef} loop />
      <audio src="/sounds/timeup.mp3" ref={timeUpSoundRef} />
    </motion.div>
  )
}
