"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
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
  timerDuration = 10,
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
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  // Sound references
  const correctSoundRef = useRef<HTMLAudioElement | null>(null)
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const tickingSoundRef = useRef<HTMLAudioElement | null>(null)
  const timeUpSoundRef = useRef<HTMLAudioElement | null>(null)

  // Check orientation for iPad-friendly layout
  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? "landscape" : "portrait")
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)

    return () => {
      window.removeEventListener("resize", checkOrientation)
    }
  }, [])

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

    // Delay moving to next question - longer for learning
    setTimeout(() => {
      onAnswer(false)
    }, 3000) // 3 seconds to learn from mistake
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
        return <Plus className="h-12 w-12 text-purple-500" />
      case "subtraction":
        return <Minus className="h-12 w-12 text-purple-500" />
      case "multiplication":
        return <X className="h-12 w-12 text-purple-500" />
      case "division":
        return <Divide className="h-12 w-12 text-purple-500" />
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
      className="relative w-full h-full"
    >
      <Card className="p-6 md:p-8 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl border-4 md:border-8 border-indigo-300 max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-600">Learn math the fun way!</h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="bg-indigo-100 px-4 py-2 rounded-full">
            <span className="text-lg md:text-xl font-bold text-indigo-600">
              Round {currentRound}/{totalRounds}
            </span>
          </div>

          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={toggleSound}>
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>

          <div className="bg-pink-100 px-4 py-2 rounded-full">
            <span className="text-lg md:text-xl font-bold text-pink-600">Score: {score}</span>
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

        {/* Enhanced Question display */}
        <motion.div
          className="bg-white p-6 md:p-8 rounded-3xl mb-6 md:mb-8 text-center relative shadow-md"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          layout
        >
          <div className="flex items-center justify-center text-5xl md:text-7xl font-bold gap-4 md:gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full shadow-md -z-10" />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="text-indigo-700 px-6 md:px-8 py-8 md:py-12"
              >
                {question.num1}
              </motion.div>
            </div>

            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-purple-500"
            >
              {getOperationSymbol()}
            </motion.span>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full shadow-md -z-10" />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-white px-6 md:px-8 py-8 md:py-12"
              >
                {question.num2}
              </motion.div>
            </div>

            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-indigo-700"
            >
              =
            </motion.span>

            <div className="relative">
              <div
                className={`absolute inset-0 rounded-full shadow-md -z-10 ${
                  answered ? (isCorrect ? "bg-green-100" : "bg-red-100") : "bg-white"
                }`}
              />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: [1, answered && !isCorrect ? 1.2 : 1],
                  opacity: 1,
                }}
                transition={{ delay: 0.5, type: "spring" }}
                className={`px-6 md:px-8 py-8 md:py-12 ${answered ? (isCorrect ? "text-green-600" : "text-red-600") : "text-pink-500"}`}
              >
                {answered ? (
                  <motion.span
                    animate={
                      !isCorrect
                        ? {
                            scale: [1, 1.2, 1],
                            color: ["#ef4444", "#ffffff", "#ef4444"],
                          }
                        : {}
                    }
                    transition={{ repeat: 2, duration: 0.5 }}
                  >
                    {question.answer}
                  </motion.span>
                ) : (
                  "?"
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Answer options - 2x2 grid for portrait, 4x1 for landscape on tablets */}
        <div className={`grid ${orientation === "landscape" ? "grid-cols-4" : "grid-cols-2"} gap-4 mb-6`}>
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
                className={`w-full h-16 md:h-20 text-4xl md:text-6xl font-bold rounded-2xl shadow-md ${
                  answered && option === question.answer
                    ? "bg-green-500 hover:bg-green-600"
                    : answered && option === selectedOption && option !== question.answer
                      ? "bg-red-500 hover:bg-red-600"
                      : index % 2 === 0
                        ? "bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500"
                        : "bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500"
                }`}
                onClick={() => handleOptionSelect(option)}
                disabled={answered}
              >
                {option}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Feedback message */}
        {answered && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring" }}
            className="p-4 rounded-2xl text-center text-white font-bold text-xl bg-red-500"
          >
            <motion.div className="flex items-center justify-center gap-2">
              {timeLeft === 0 ? (
                <>
                  <span>Time's up!</span>
                </>
              ) : (
                <>
                  <span>Try again!</span>
                </>
              )}
            </motion.div>

            <motion.div
              className="mt-2 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              The correct answer is{" "}
              <motion.span
                className="font-bold text-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  textShadow: ["0px 0px 0px white", "0px 0px 8px white", "0px 0px 0px white"],
                }}
                transition={{ repeat: 2, duration: 0.7 }}
              >
                {question.answer}
              </motion.span>
            </motion.div>
          </motion.div>
        )}

        {answered && isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring" }}
            className="p-4 rounded-2xl text-center text-white font-bold text-xl bg-green-500"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-3"
            >
              <span>Great job! That's correct!</span>
            </motion.div>
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
