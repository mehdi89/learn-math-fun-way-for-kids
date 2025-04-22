"use client"
import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Star, RotateCcw, Volume2, VolumeX, Home, Download, Sparkles, BarChart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { NicknameModal } from "./nickname-modal"
import { Leaderboard } from "./leaderboard"
import { HighScoreAlert } from "./high-score-alert"
import { saveScore, checkHighScore, getUserRank, type ScoreData } from "@/app/actions"

interface ScoreScreenProps {
  score: number
  totalRounds: number
  onPlayAgain: () => void
  operation: string
  numberUsed: number
  timerDuration: number
  difficulty: string
}

export function ScoreScreen({
  score,
  totalRounds,
  onPlayAgain,
  operation,
  numberUsed,
  timerDuration,
  difficulty,
}: ScoreScreenProps) {
  const percentage = Math.round((score / totalRounds) * 100)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [savedScoreId, setSavedScoreId] = useState<number | null>(null)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [totalScores, setTotalScores] = useState<number>(0)
  const [isHighScore, setIsHighScore] = useState(false)
  const [previousBest, setPreviousBest] = useState(0)
  const [showHighScoreAlert, setShowHighScoreAlert] = useState(false)
  const [scoreSubmitted, setScoreSubmitted] = useState(false)
  const [nickname, setNickname] = useState<string | null>(null)

  // Sound references
  const victorySoundRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const starSoundRef = useRef<HTMLAudioElement | null>(null)

  // Precompute confetti and bubble randoms
  const confettiData = useRef(
    Array.from({ length: 40 }, () => ({
      width: Math.random() * 20 + 10,
      height: Math.random() * 20 + 10,
      left: Math.random() * 100,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
      rotate: Math.random() * 360,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3,
      repeatDelay: Math.random() * 5,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    }))
  ).current
  const bubbleData = useRef(
    Array.from({ length: 30 }, () => ({
      width: Math.random() * 80 + 40,
      height: Math.random() * 80 + 40,
      left: Math.random() * 100,
      top: Math.random() * 100,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      rotate: Math.random() * 360,
      scale: Math.random() * 0.3 + 0.8,
      duration: Math.random() * 10 + 10,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    }))
  ).current

  useEffect(() => {
    // Initialize audio elements
    victorySoundRef.current = new Audio("/sounds/victory.mp3")
    clickSoundRef.current = new Audio("/sounds/click.mp3")
    starSoundRef.current = new Audio("/sounds/star.mp3")

    // Set volume levels
    if (victorySoundRef.current) victorySoundRef.current.volume = 0.5
    if (clickSoundRef.current) clickSoundRef.current.volume = 0.3
    if (starSoundRef.current) starSoundRef.current.volume = 0.4

    // Show confetti after a short delay
    const timer = setTimeout(() => {
      setShowConfetti(true)
    }, 500)

    // Check if the user has a nickname saved
    const savedNickname = localStorage.getItem("mathGameNickname");
    if (savedNickname) {
      setNickname(savedNickname);
    }

    // Check if this is a high score
    checkIfHighScore()

    return () => {
      // Stop all sounds when component unmounts
      try {
        if (victorySoundRef.current) victorySoundRef.current.pause()
        clearTimeout(timer)
      } catch (err) {
        // Silently catch errors
      }
    }
  }, [])

  const checkIfHighScore = async () => {
    const savedNickname = localStorage.getItem("mathGameNickname");
    
    const scoreData: ScoreData = {
      nickname: savedNickname || "",
      operation,
      numberUsed,
      rounds: totalRounds,
      timerDuration,
      difficulty,
      score,
      percentage,
    }

    const result = await checkHighScore(scoreData)

    if (result.isHighScore) {
      setIsHighScore(true)
      setPreviousBest(result.previousBest)
      
      // If we already have the nickname, save the score immediately
      if (savedNickname) {
        await handleSaveScore(savedNickname);
        // Show high score alert
        setTimeout(() => {
          setShowHighScoreAlert(true);
        }, 1500);
      } else {
        // Only show nickname modal if we don't have a nickname
        setTimeout(() => {
          setShowNicknameModal(true);
        }, 1500);
      }
    } else {
      // Not a high score, but if we have a nickname, auto-save the score
      if (savedNickname && !scoreSubmitted) {
        await handleSaveScore(savedNickname);
      }
    }
  }

  const handleSaveScore = async (name: string) => {
    setShowNicknameModal(false)

    const scoreData: ScoreData = {
      nickname: name,
      operation,
      numberUsed,
      rounds: totalRounds,
      timerDuration,
      difficulty,
      score,
      percentage,
    }

    console.log("Saving score data:", scoreData);
    const result = await saveScore(scoreData)

    if (result.success) {
      setSavedScoreId(result.id)
      setScoreSubmitted(true)
      
      // Save the scoreId to localStorage for persistence
      localStorage.setItem("mathGameScoreId", result.id.toString())

      // Get user's rank
      const rankResult = await getUserRank(result.id)
      console.log("Raw rank result:", rankResult);
      
      if (rankResult.rank) {
        // Log the data type and value of rankResult.rank
        console.log("Rank type:", typeof rankResult.rank, "Rank value:", rankResult.rank);
        
        // Ensure rank is treated as a number
        const numericRank = parseInt(rankResult.rank.toString(), 10);
        console.log("Converted rank:", numericRank);
        
        setUserRank(numericRank);
        setTotalScores(rankResult.total)
        
        // Log the final userRank state
        console.log("Final userRank set to:", numericRank);
      }

      // Show high score alert immediately if it's a high score
      if (isHighScore) {
        setShowHighScoreAlert(true)
      }
    }
  }

  const playSound = (type: "click" | "star" | "victory") => {
    if (!soundEnabled) return
    setHasUserInteracted(true)

    try {
      if (type === "click" && clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0
        clickSoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      } else if (type === "star" && starSoundRef.current) {
        starSoundRef.current.currentTime = 0
        starSoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      } else if (type === "victory" && victorySoundRef.current) {
        victorySoundRef.current.currentTime = 0
        victorySoundRef.current.play().catch(() => {
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
    playSound("click")
  }

  const getMessage = () => {
    if (percentage >= 90) return "Amazing! You're a math superstar! 🌟"
    if (percentage >= 70) return "Great job! You're getting really good! 🎉"
    if (percentage >= 50) return "Good effort! Keep practicing! 👍"
    return "Keep trying! Practice makes perfect! 💪"
  }

  const getStars = () => {
    if (percentage >= 90) return 5
    if (percentage >= 70) return 4
    if (percentage >= 50) return 3
    if (percentage >= 30) return 2
    return 1
  }

  return (
    <motion.div
      key="score"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="absolute -z-10 inset-0 overflow-hidden">
        {showConfetti &&
          confettiData.map((c, i) => (
            <motion.div
              key={c.id}
              className="absolute rounded-full"
              style={{
                width: c.width,
                height: c.height,
                left: `${c.left}%`,
                top: `-10%`,
                backgroundColor: c.color,
              }}
              initial={{ y: -100, opacity: 0 }}
              animate={{
                y: window.innerHeight * 1.5,
                opacity: [0, 1, 1, 0],
                rotate: c.rotate,
              }}
              transition={{
                duration: c.duration,
                delay: c.delay,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: c.repeatDelay,
              }}
            />
          ))}

        {[...bubbleData].map((b, i) => (
          <motion.div
            key={b.id}
            className="absolute rounded-full bg-gradient-to-r from-yellow-300 to-pink-300 opacity-70"
            style={{
              width: b.width,
              height: b.height,
              left: `${b.left}%`,
              top: `${b.top}%`,
            }}
            animate={{
              x: [0, b.x, 0],
              y: [0, b.y, 0],
              rotate: [0, b.rotate, 0],
              scale: [1, b.scale, 1],
            }}
            transition={{
              duration: b.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <Card className="p-10 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl border-8 border-indigo-300">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: [0, 10, -10, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            delay: 0.2,
            duration: 1,
            y: {
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 2,
              duration: 1.5,
            },
          }}
          className="flex justify-center mb-8"
          onClick={() => {
            if (!hasUserInteracted) {
              playSound("victory")
            }
          }}
        >
          <div className="relative">
            <Trophy className="h-40 w-40 text-yellow-500" />
            <motion.div
              className="absolute -top-5 -right-5"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sparkles className="h-12 w-12 text-yellow-300" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent"
        >
          Game Complete!
        </motion.h2>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-10"
        >
          <p className="text-2xl text-indigo-600 mb-3">Your Score:</p>
          <motion.div
            className="text-6xl font-bold text-pink-600 mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {score} / {totalRounds}
          </motion.div>
          <motion.div
            className="text-3xl font-semibold text-indigo-500 mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <span className="inline-block px-6 py-2 bg-indigo-100 rounded-full">{percentage}%</span>
          </motion.div>

          {userRank && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mb-6 p-4 bg-indigo-50 rounded-xl border-2 border-indigo-100"
              onAnimationStart={() => {
                console.log("Rendering rank display with userRank:", userRank, "type:", typeof userRank);
              }}
            >
              <p className="text-lg font-medium text-indigo-700">
                Your Rank: <span className="font-bold">{parseInt(String(userRank), 10)}</span> of {totalScores}
              </p>

              {/* add a button to see the leaderboard */}
              <Button
                variant="outline"
                onClick={() => setShowLeaderboard(true)}
                className="mt-4 bg-indigo-500 text-white hover:bg-indigo-600"
              >
                View Leaderboard
              </Button>
            </motion.div>
          )}

          <div className="flex justify-center gap-3 mb-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                  y: i < getStars() ? [0, -15, 0] : 0,
                }}
                transition={{
                  delay: 0.5 + i * 0.2,
                  y: {
                    delay: 1.5 + i * 0.1,
                    duration: 0.5,
                    repeat: i < getStars() ? 1 : 0,
                  },
                }}
                onAnimationComplete={() => {
                  if (i < getStars()) {
                    playSound("star")
                  }
                }}
              >
                <Star className={`h-16 w-16 ${i < getStars() ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-2xl font-medium text-indigo-600 p-6 bg-indigo-50 rounded-2xl border-4 border-indigo-200 mb-8"
          >
            <motion.div
              animate={{
                scale: percentage >= 90 ? [1, 1.05, 1] : 1,
              }}
              transition={{
                repeat: percentage >= 90 ? Number.POSITIVE_INFINITY : 0,
                repeatDelay: 1,
                duration: 0.5,
              }}
            >
              {getMessage()}
            </motion.div>
          </motion.div>

          {!scoreSubmitted && !isHighScore && !nickname && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
              className="mb-6"
            >
              <Button
                onClick={() => setShowNicknameModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Save Your Score
              </Button>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => {
                  playSound("click")
                  onPlayAgain()
                }}
                className="w-full h-16 text-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl border-4 border-indigo-400"
              >
                <RotateCcw className="mr-2 h-5 w-5" /> Play Again
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  playSound("click")
                  onPlayAgain()
                }}
                className="w-full h-16 text-xl border-4 border-pink-400 text-pink-600 rounded-xl"
              >
                <Home className="mr-2 h-5 w-5" /> Home
              </Button>
            </motion.div>
          </div>

          {/* <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" onClick={() => playSound("click")} className="w-full h-12 text-lg text-indigo-600">
              <Download className="mr-2 h-5 w-5" /> Save Certificate
            </Button>
          </motion.div> */}
        </motion.div>

        {/* Character */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute -bottom-20 right-0"
        >
          <motion.div
            className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-6xl shadow-lg"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 3,
            }}
          >
            {percentage >= 70 ? "🦄" : "🐢"}
          </motion.div>
        </motion.div>

        {/* Additional character */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute -bottom-16 left-10"
        >
          <motion.div
            className="w-24 h-24 bg-pink-400 rounded-full flex items-center justify-center text-5xl shadow-lg"
            animate={{
              y: [0, -10, 0],
              rotate: [0, -5, 5, 0],
              x: [0, 5, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2.5,
              delay: 0.5,
            }}
          >
            {percentage >= 50 ? "🎓" : "📚"}
          </motion.div>
        </motion.div>
      </Card>

      {/* Hidden audio elements */}
      <audio src="/sounds/victory.mp3" ref={victorySoundRef} />
      <audio src="/sounds/click.mp3" ref={clickSoundRef} />
      <audio src="/sounds/star.mp3" ref={starSoundRef} />

      {/* Modals */}
      <AnimatePresence>
        {showNicknameModal && (
          <NicknameModal
            onSubmit={handleSaveScore}
            onCancel={() => setShowNicknameModal(false)}
            isHighScore={isHighScore}
          />
        )}

        {showLeaderboard && (
          <Leaderboard
            operation={operation}
            numberUsed={numberUsed}
            rounds={totalRounds}
            timerDuration={timerDuration}
            difficulty={difficulty}
            onClose={() => setShowLeaderboard(false)}
            userScoreId={savedScoreId || undefined}
            showAllEntries={false}
          />
        )}

        {showHighScoreAlert && (
          <HighScoreAlert score={score} previousBest={previousBest} onClose={() => setShowHighScoreAlert(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
