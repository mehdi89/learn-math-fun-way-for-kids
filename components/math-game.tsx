"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, X, Divide, ArrowRight, Volume2, VolumeX, Home } from "lucide-react"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { GameScreen } from "@/components/game-screen"
import { ScoreScreen } from "@/components/score-screen"
import { SplashScreen } from "@/components/splash-screen"
import { NicknameModal } from "./nickname-modal";
import { Leaderboard } from "./leaderboard";

type Operation = "addition" | "subtraction" | "multiplication" | "division"
type Difficulty = "easy" | "medium" | "hard"

export function MathGame() {
  const [gameState, setGameState] = useState<"splash" | "setup" | "playing" | "score">("splash")
  const [operation, setOperation] = useState<Operation>("addition")
  const [number, setNumber] = useState<number>(1)
  const [rounds, setRounds] = useState<number>(5)
  const [score, setScore] = useState<number>(0)
  const [currentRound, setCurrentRound] = useState<number>(1)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [timerDuration, setTimerDuration] = useState<number>(10)
  const [showTutorial, setShowTutorial] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [savedScoreId, setSavedScoreId] = useState<number | null>(null);

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

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedOperation = localStorage.getItem("mathGameOperation") as Operation | null
    const savedNumber = localStorage.getItem("mathGameNumber")
    const savedRounds = localStorage.getItem("mathGameRounds")
    const savedTimerDuration = localStorage.getItem("mathGameTimerDuration")
    const savedDifficulty = localStorage.getItem("mathGameDifficulty") as Difficulty | null
    const savedNickname = localStorage.getItem("mathGameNickname");
    const savedScoreId = localStorage.getItem("mathGameScoreId");

    if (savedOperation) setOperation(savedOperation)
    if (savedNumber) setNumber(Number.parseInt(savedNumber))
    if (savedRounds) setRounds(Number.parseInt(savedRounds))
    if (savedTimerDuration) setTimerDuration(Number.parseInt(savedTimerDuration))
    if (savedDifficulty) setDifficulty(savedDifficulty)
    if (!savedNickname) {
      setShowNicknameModal(true);
    } else {
      setNickname(savedNickname);
    }
    if (savedScoreId) {
      setSavedScoreId(Number.parseInt(savedScoreId));
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

  // Updated difficulty settings with new number ranges
  const getDifficultySettings = (diff: Difficulty) => {
    switch (diff) {
      case "easy":
        return {
          timerMultiplier: 1.5,
          minNumber: 1,
          maxNumber: 20,
          icon: "🐣",
          color: "from-green-500 to-teal-500",
          hoverColor: "hover:from-green-600 hover:to-teal-600",
          borderColor: "border-green-300",
          description: "Numbers 1-20",
        }
      case "medium":
        return {
          timerMultiplier: 1,
          minNumber: 21,
          maxNumber: 99,
          icon: "🦊",
          color: "from-indigo-500 to-purple-500",
          hoverColor: "hover:from-indigo-600 hover:to-purple-600",
          borderColor: "border-indigo-300",
          description: "Numbers 21-99",
        }
      case "hard":
        return {
          timerMultiplier: 0.7,
          minNumber: 100,
          maxNumber: 999,
          icon: "🐉",
          color: "from-red-500 to-orange-500",
          hoverColor: "hover:from-red-600 hover:to-orange-600",
          borderColor: "border-red-300",
          description: "Numbers 100-999",
        }
    }
  }

  const handleSplashComplete = () => {
    setGameState("setup")
  }

  const handleNicknameSubmit = (name: string) => {
    localStorage.setItem("mathGameNickname", name);
    setNickname(name);
    setShowNicknameModal(false);
  };

  return (
    <div className="container mx-auto max-w-md">
      <AnimatePresence mode="wait">
        {gameState === "splash" && <SplashScreen onComplete={handleSplashComplete} />}
        {gameState !== "splash" && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-6 relative"
          >
            <div className="flex items-center justify-center">
              <motion.div
                className="mr-3 text-4xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ type: "keyframes", repeat: Number.POSITIVE_INFINITY, duration: 3 }}
              >
                🧮
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Math Adventure
              </h1>
            </div>
            <p className="text-lg text-purple-500">Learn math the fun way!</p>

            <div className="absolute right-0 top-0 flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleSound}>
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              {gameState !== "setup" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    playSound("button")
                    resetGame()
                  }}
                >
                  <Home className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
        {gameState === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 shadow-xl bg-white rounded-3xl border-8 border-purple-300">
              <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Game Setup
              </h2>
              <Button
                onClick={() => setShowLeaderboard(true)}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl border-4 border-indigo-400 shadow-lg mb-4"
              >
                View Leaderboard
              </Button>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-purple-600 flex items-center">
                  <motion.span
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    className="mr-2"
                  >
                    🎮
                  </motion.span>
                  Choose Operation
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {(["addition", "subtraction", "multiplication", "division"] as Operation[]).map((op) => (
                    <motion.div key={op} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={operation === op ? "default" : "outline"}
                        className={`h-20 text-lg w-full ${operation === op
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-4 border-indigo-300"
                            : "border-4 border-purple-200"
                          }`}
                        onClick={() => {
                          setOperation(op)
                          playSound("button")
                          localStorage.setItem("mathGameOperation", op)
                        }}
                      >
                        <div className="flex flex-col items-center">
                          {getOperationIcon(op)}
                          <span className="mt-2 font-bold">{getOperationName(op)}</span>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-purple-600 flex items-center">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    className="mr-2"
                  >
                    🔢
                  </motion.span>
                  Practice with Number
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <motion.div key={num} whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant={number === num ? "default" : "outline"}
                        className={`h-16 w-16 text-2xl font-bold ${number === num
                            ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 border-4 border-pink-300"
                            : "border-4 border-pink-200"
                          }`}
                        onClick={() => {
                          setNumber(num)
                          playSound("button")
                          localStorage.setItem("mathGameNumber", num.toString())
                        }}
                      >
                        {num}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-purple-600 flex items-center">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    className="mr-2"
                  >
                    🏆
                  </motion.span>
                  Difficulty Level
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => {
                    const settings = getDifficultySettings(diff)
                    return (
                      <motion.div key={diff} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={difficulty === diff ? "default" : "outline"}
                          className={`h-24 text-lg w-full ${difficulty === diff
                              ? `bg-gradient-to-r ${settings.color} ${settings.hoverColor} border-4 ${settings.borderColor}`
                              : "border-4 border-purple-200"
                            }`}
                          onClick={() => {
                            setDifficulty(diff)
                            playSound("button")
                            localStorage.setItem("mathGameDifficulty", diff)
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-2xl mb-1">{settings.icon}</span>
                            <span className="font-bold capitalize">{diff}</span>
                            <span className="text-xs mt-1">{settings.description}</span>
                          </div>
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-purple-600 flex items-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 10, ease: "linear" }}
                    className="mr-2"
                  >
                    🔄
                  </motion.span>
                  Number of Rounds: {rounds}
                </h3>
                <div className="px-4">
                  <Slider
                    defaultValue={[rounds]}
                    max={30}
                    min={5}
                    step={5}
                    onValueChange={(value) => {
                      setRounds(value[0])
                      localStorage.setItem("mathGameRounds", value[0].toString())
                    }}
                    className="py-6"
                  />
                  <div className="flex justify-between text-sm text-purple-500 mt-2">
                    <span>5</span>
                    <span>15</span>
                    <span>30</span>
                  </div>
                </div>
              </div>
              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4 text-purple-600 flex items-center">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                    className="mr-2"
                  >
                    ⏱️
                  </motion.span>
                  Answer Time: {timerDuration}s
                </h3>
                <div className="px-4">
                  <Slider
                    defaultValue={[timerDuration]}
                    min={5}
                    max={20}
                    step={1}
                    onValueChange={(value) => {
                      setTimerDuration(value[0])
                      localStorage.setItem("mathGameTimerDuration", value[0].toString())
                    }}
                    className="py-6"
                  />
                  <div className="flex justify-between text-sm text-purple-500 mt-2">
                    <span>5s</span>
                    <span>10s</span>
                    <span>20s</span>
                  </div>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={startGame}
                  className="w-full h-20 text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-xl border-4 border-indigo-400 shadow-lg"
                >
                  Start Learning <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </motion.div>
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
            timerDuration={timerDuration * getDifficultySettings(difficulty).timerMultiplier}
            onExit={resetGame}
            difficulty={difficulty}
            difficultySettings={getDifficultySettings(difficulty)}
          />
        )}
        {gameState === "score" && (
          <ScoreScreen
            score={score}
            totalRounds={rounds}
            onPlayAgain={resetGame}
            operation={operation}
            numberUsed={number}
            timerDuration={timerDuration}
            difficulty={difficulty}
          />
        )}
      </AnimatePresence>

      {showNicknameModal && (
        <NicknameModal 
          onSubmit={handleNicknameSubmit} 
          onCancel={() => setShowNicknameModal(false)} 
        />
      )}

      {showLeaderboard && gameState === "setup" && (
        <Leaderboard
          operation={operation}
          numberUsed={number}
          rounds={rounds}
          timerDuration={timerDuration}
          difficulty={difficulty}
          onClose={() => setShowLeaderboard(false)}
          showAllEntries={true}
        />
      )}

      {showLeaderboard && gameState === "score" && (
        <Leaderboard
          operation={operation}
          numberUsed={number}
          rounds={rounds}
          timerDuration={timerDuration}
          difficulty={difficulty}
          onClose={() => setShowLeaderboard(false)}
          userScoreId={savedScoreId ?? undefined}
        />
      )}

      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md p-6 bg-white rounded-xl">
            <h2 className="text-2xl font-bold mb-4">How to Play</h2>
            <p>Instructions would go here...</p>
            <Button onClick={() => setShowTutorial(false)} className="mt-6">Close</Button>
          </Card>
        </div>
      )}

      {/* Hidden audio elements */}
      <audio src="/sounds/click.mp3" ref={buttonSoundRef} />
      <audio src="/sounds/start.mp3" ref={startSoundRef} />
      <audio src="/sounds/background.mp3" ref={bgMusicRef} />
    </div>
  )
}
