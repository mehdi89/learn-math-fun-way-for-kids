"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, X, Divide, Volume2, VolumeX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Operation = "addition" | "subtraction" | "multiplication" | "division"

interface GameScreenProps {
  operation: Operation
  number: number
  currentRound: number
  totalRounds: number
  onAnswer: (correct: boolean) => void
  score: number
  timerDuration?: number
}

export function GameScreen({
  operation,
  number,
  currentRound,
  totalRounds,
  onAnswer,
  score,
  timerDuration = 10, // Default to 10 seconds now
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
  }, [currentRound, operation, number, timerDuration])

  useEffect(() => {
    if (!timerActive || answered) {
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
  }, [timerActive, answered, soundEnabled, hasUserInteracted, timerDuration])

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
    let num1, num2, answer

    switch (operation) {
      case "addition":
        // For addition: num2 is the fixed number (e.g., 3 + 5)
        num2 = number
        num1 = Math.floor(Math.random() * 10) + 1
        answer = num1 + num2
        break
      case "subtraction":
        // For subtraction: num2 is the fixed number, num1 is larger (e.g., 8 - 5 = 3)
        num2 = number
        answer = Math.floor(Math.random() * 10) + 1
        num1 = num2 + answer
        break
      case "multiplication":
        // For multiplication: num2 is the fixed number (e.g., 3 × 5)
        num2 = number
        num1 = Math.floor(Math.random() * 5) + 1
        answer = num1 * num2
        break
      case "division":
        // For division: num2 is the fixed number, num1 is the product (e.g., 15 ÷ 5 = 3)
        num2 = number
        answer = Math.floor(Math.random() * 5) + 1
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

    while (optionsArray.length < 4) {
      // Generate a random offset between -3 and +3, but not 0
      let offset = Math.floor(Math.random() * 7) - 3
      if (offset === 0) offset = 1

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

    // Delay moving to next question
    setTimeout(() => {
      onAnswer(false)
    }, 1800)
  }

  const handleOptionSelect = (option: number) => {
    if (answered) return

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

    // Delay moving to next question
    setTimeout(() => {
      onAnswer(correct)
    }, 1800)
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

  return (
    <motion.div
      key="game"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* Animated background elements */}
      <div className="absolute -z-10 inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-300 to-pink-300 opacity-70"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
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

      <Card className="p-6 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-purple-300">
        <div className="flex justify-between items-center mb-4">
          <div className="text-purple-600 font-bold text-lg">
            Round {currentRound}/{totalRounds}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleSound}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <div className="text-pink-600 font-bold text-lg">Score: {score}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-purple-600">Progress</span>
            <motion.span
              className="text-sm font-bold text-pink-600"
              initial={{ scale: 1 }}
              animate={{ scale: timeLeft <= timerDuration * 0.2 ? [1, 1.2, 1] : 1 }}
              transition={{ repeat: timeLeft <= timerDuration * 0.2 ? Number.POSITIVE_INFINITY : 0, duration: 0.5 }}
            >
              Time: {timeLeft}s
            </motion.span>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-4 text-xs flex rounded-full bg-purple-100">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                style={{ width: `${(currentRound / totalRounds) * 100}%` }}
                initial={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }}
                animate={{ width: `${(currentRound / totalRounds) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <div className="relative pt-1 mt-2">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-pink-100">
              <motion.div
                className="bg-gradient-to-r from-pink-500 to-red-500 h-full rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: `${(timeLeft / timerDuration) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </div>
        </div>

        {/* Question display */}
        <motion.div
          className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-xl mb-8 text-center relative"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          layout
        >
          {/* Decorative elements */}
          <motion.div
            className="absolute -top-4 -left-4 h-12 w-12 bg-yellow-300 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-4 -right-4 h-12 w-12 bg-pink-300 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />

          <div className="flex items-center justify-center text-5xl font-bold gap-6">
            <motion.span
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="bg-white h-24 w-24 flex items-center justify-center rounded-2xl shadow-md text-purple-700 border-4 border-purple-200"
            >
              {question.num1}
            </motion.span>

            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-purple-700"
            >
              {getOperationSymbol()}
            </motion.span>

            <motion.span
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotateY: 0,
                y: [0, -5, 0, -5, 0],
              }}
              transition={{
                delay: 0.3,
                type: "spring",
                y: {
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 2,
                  duration: 1,
                },
              }}
              className="bg-gradient-to-r from-pink-400 to-purple-400 h-24 w-24 flex items-center justify-center rounded-2xl shadow-md text-white border-4 border-pink-200"
            >
              {question.num2}
            </motion.span>

            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-purple-700"
            >
              =
            </motion.span>

            <motion.span
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{
                scale: [1, answered && isCorrect ? 1.2 : 1],
                opacity: 1,
                rotateY: 0,
                rotateZ: answered && isCorrect ? [0, -10, 10, -10, 0] : 0,
              }}
              transition={{
                delay: 0.5,
                type: "spring",
                rotateZ: { repeat: 0, duration: 0.5 },
              }}
              className={`h-24 w-24 flex items-center justify-center rounded-2xl shadow-md border-4 ${
                answered
                  ? isCorrect
                    ? "bg-green-100 text-green-600 border-green-300"
                    : "bg-red-100 text-red-600 border-red-300"
                  : "bg-white text-pink-500 border-pink-200"
              }`}
            >
              {answered ? question.answer : "?"}
            </motion.span>
          </div>

          {/* Character reactions */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
              >
                {isCorrect ? (
                  <motion.div
                    className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-4xl"
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 1 }}
                  >
                    😄
                  </motion.div>
                ) : (
                  <motion.div
                    className="w-20 h-20 bg-blue-400 rounded-full flex items-center justify-center text-4xl"
                    animate={{
                      rotate: [0, -5, 5, -5, 0],
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    🤔
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
              whileHover={{ scale: answered ? 1 : 1.05 }}
              whileTap={{ scale: answered ? 1 : 0.95 }}
            >
              <Button
                className={`w-full h-20 text-3xl font-bold rounded-xl ${
                  answered && option === question.answer
                    ? "bg-green-500 hover:bg-green-600 border-4 border-green-300"
                    : answered && option === selectedOption && option !== question.answer
                      ? "bg-red-500 hover:bg-red-600 border-4 border-red-300"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-4 border-purple-300"
                }`}
                onClick={() => handleOptionSelect(option)}
                disabled={answered}
              >
                {option}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Feedback message */}
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring" }}
            className={`p-4 rounded-xl text-center text-white font-bold text-xl ${
              isCorrect ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isCorrect ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center gap-2"
              >
                <span>Great job! That's correct! 🎉</span>
                <motion.span animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ repeat: 2, duration: 0.5 }}>
                  🌟
                </motion.span>
              </motion.div>
            ) : (
              <motion.div className="flex items-center justify-center gap-2">
                {timeLeft === 0 ? (
                  <>
                    <span>Time's up! ⏱️</span>
                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.3 }}>
                      ⏰
                    </motion.span>
                  </>
                ) : (
                  <>
                    <span>Not quite right. Try again! 🤔</span>
                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: 2, duration: 0.5 }}>
                      📚
                    </motion.span>
                  </>
                )}
              </motion.div>
            )}
            {!isCorrect && <div className="mt-2 text-lg">The correct answer is {question.answer}</div>}
          </motion.div>
        )}
      </Card>

      {/* Hidden audio elements */}
      <audio src="/sounds/correct.mp3" ref={correctSoundRef} />
      <audio src="/sounds/incorrect.mp3" ref={incorrectSoundRef} />
      <audio src="/sounds/click.mp3" ref={clickSoundRef} />
      <audio src="/sounds/ticking.mp3" ref={tickingSoundRef} loop />
      <audio src="/sounds/timeup.mp3" ref={timeUpSoundRef} />
    </motion.div>
  )
}
