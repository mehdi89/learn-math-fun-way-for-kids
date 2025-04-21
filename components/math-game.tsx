"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, X, Divide, ArrowRight, Volume2, VolumeX, Clock } from "lucide-react"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { GameScreen } from "@/components/game-screen"
import { ScoreScreen } from "@/components/score-screen"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Operation = "addition" | "subtraction" | "multiplication" | "division"

export function MathGame() {
  const [gameState, setGameState] = useState<"setup" | "playing" | "score">("setup")
  const [operation, setOperation] = useState<Operation>("addition")
  const [number, setNumber] = useState<number>(1)
  const [rounds, setRounds] = useState<number>(5)
  const [score, setScore] = useState<number>(0)
  const [currentRound, setCurrentRound] = useState<number>(1)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [timerDuration, setTimerDuration] = useState<number>(10) // Default to 10 seconds

  // Sound references
  const buttonSoundRef = useRef<HTMLAudioElement | null>(null)
  const startSoundRef = useRef<HTMLAudioElement | null>(null)
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio elements
    buttonSoundRef.current = new Audio("/sounds/click.mp3")
    startSoundRef.current = new Audio("/sounds/start.mp3")
    bgMusicRef.current = new Audio("/sounds/background.mp3")

    // Set properties
    if (buttonSoundRef.current) buttonSoundRef.current.volume = 0.3
    if (startSoundRef.current) startSoundRef.current.volume = 0.5
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.2
      bgMusicRef.current.loop = true
    }

    return () => {
      // Stop all sounds when component unmounts
      if (bgMusicRef.current) bgMusicRef.current.pause()
    }
  }, [])

  const playSound = (type: "button" | "start") => {
    if (!soundEnabled) return
    setHasUserInteracted(true)

    try {
      if (type === "button" && buttonSoundRef.current) {
        buttonSoundRef.current.currentTime = 0
        buttonSoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      } else if (type === "start" && startSoundRef.current) {
        startSoundRef.current.currentTime = 0
        startSoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      }
    } catch (err) {
      // Silently catch errors
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    setHasUserInteracted(true)
    playSound("button")

    if (bgMusicRef.current) {
      try {
        if (soundEnabled) {
          bgMusicRef.current.pause()
        } else if (hasUserInteracted) {
          bgMusicRef.current.play().catch(() => {
            // Silently handle the error
          })
        }
      } catch (err) {
        // Silently catch errors
      }
    }
  }

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setCurrentRound(1)
    setHasUserInteracted(true)
    playSound("start")

    // Start background music
    if (soundEnabled && bgMusicRef.current && hasUserInteracted) {
      try {
        bgMusicRef.current.currentTime = 0
        bgMusicRef.current.play().catch(() => {
          // Silently handle the error
        })
      } catch (err) {
        // Silently catch errors
      }
    }
  }

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore(score + 1)
      // Trigger small confetti for correct answer
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      })
    }

    if (currentRound >= rounds) {
      setGameState("score")
      // Stop background music
      if (bgMusicRef.current) {
        bgMusicRef.current.pause()
        bgMusicRef.current.currentTime = 0
      }

      // Trigger big confetti for game completion
      if (score / rounds > 0.7) {
        confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.6 },
        })
      }
    } else {
      setCurrentRound(currentRound + 1)
    }
  }

  const resetGame = () => {
    setGameState("setup")
    playSound("button")

    // Stop background music
    if (bgMusicRef.current) {
      bgMusicRef.current.pause()
      bgMusicRef.current.currentTime = 0
    }
  }

  const getOperationIcon = (op: Operation) => {
    switch (op) {
      case "addition":
        return <Plus className="h-6 w-6" />
      case "subtraction":
        return <Minus className="h-6 w-6" />
      case "multiplication":
        return <X className="h-6 w-6" />
      case "division":
        return <Divide className="h-6 w-6" />
    }
  }

  const getOperationName = (op: Operation) => {
    switch (op) {
      case "addition":
        return "Addition"
      case "subtraction":
        return "Subtraction"
      case "multiplication":
        return "Multiplication"
      case "division":
        return "Division"
    }
  }

  return (
    <div className="container mx-auto max-w-md">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-6 relative">
        <h1 className="text-4xl font-bold text-purple-600 mb-2">Math Adventure</h1>
        <p className="text-lg text-purple-500">Learn math the fun way!</p>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-8 w-8 rounded-full"
          onClick={toggleSound}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {gameState === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 shadow-xl bg-white rounded-3xl border-4 border-purple-300">
              <motion.div
                className="absolute -top-6 -right-6 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-3xl"
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
              >
                🧮
              </motion.div>

              <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">Game Setup</h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-600">Choose Operation</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(["addition", "subtraction", "multiplication", "division"] as Operation[]).map((op) => (
                    <Button
                      key={op}
                      variant={operation === op ? "default" : "outline"}
                      className={`h-16 text-lg ${operation === op ? "bg-purple-500 hover:bg-purple-600" : "border-purple-200"}`}
                      onClick={() => {
                        setOperation(op)
                        playSound("button")
                      }}
                    >
                      <div className="flex flex-col items-center">
                        {getOperationIcon(op)}
                        <span className="mt-1">{getOperationName(op)}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-600">Practice with Number</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <Button
                      key={num}
                      variant={number === num ? "default" : "outline"}
                      className={`h-12 w-12 text-lg ${number === num ? "bg-pink-500 hover:bg-pink-600" : "border-pink-200"}`}
                      onClick={() => {
                        setNumber(num)
                        playSound("button")
                      }}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-600">Number of Rounds: {rounds}</h3>
                <Slider
                  defaultValue={[5]}
                  max={30}
                  min={5}
                  step={5}
                  onValueChange={(value) => setRounds(value[0])}
                  className="py-4"
                />
              </div>

              {/* Subtle timer settings */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-3 text-purple-600">Answer Time: {timerDuration}s</h3>
                  <Slider
                    defaultValue={[10]}
                    min={5}
                    max={20}
                    step={1}
                    onValueChange={(value) => setTimerDuration(value[0])}
                    className="py-4"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="text-sm text-gray-600">
                      <p>Adjust how much time is given to answer each question.</p>
                      <p className="mt-2">Shorter times make the game more challenging!</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={startGame}
                className="w-full h-14 text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl border-2 border-purple-400"
              >
                Start Learning <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Card>
          </motion.div>
        )}

        {gameState === "playing" && (
          <GameScreen
            operation={operation}
            number={number}
            currentRound={currentRound}
            totalRounds={rounds}
            onAnswer={handleAnswer}
            score={score}
            timerDuration={timerDuration}
          />
        )}

        {gameState === "score" && <ScoreScreen score={score} totalRounds={rounds} onPlayAgain={resetGame} />}
      </AnimatePresence>

      {/* Hidden audio elements */}
      <audio src="/sounds/click.mp3" ref={buttonSoundRef} />
      <audio src="/sounds/start.mp3" ref={startSoundRef} />
      <audio src="/sounds/background.mp3" ref={bgMusicRef} />
    </div>
  )
}
