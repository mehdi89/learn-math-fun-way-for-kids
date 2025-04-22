"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Award, ChevronDown, ChevronUp, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getLeaderboard, getAllLeaderboardEntries, type LeaderboardEntry } from "@/app/actions"

interface LeaderboardProps {
  operation: string
  numberUsed: number
  rounds: number
  timerDuration: number
  difficulty: string
  onClose: () => void
  userScoreId?: number
  showAllEntries?: boolean
}

export function Leaderboard({
  operation,
  numberUsed,
  rounds,
  timerDuration,
  difficulty,
  onClose,
  userScoreId,
  showAllEntries = false,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      let data: LeaderboardEntry[];
      
      if (showAllEntries) {
        data = await getAllLeaderboardEntries();
      } else {
        data = await getLeaderboard(operation, numberUsed, rounds, timerDuration, difficulty);
      }
      
      setLeaderboard(data)
      setLoading(false)
    }

    fetchLeaderboard()
  }, [operation, numberUsed, rounds, timerDuration, difficulty, showAllEntries])

  const getOperationSymbol = (op: string) => {
    switch (op) {
      case "addition":
        return "+"
      case "subtraction":
        return "-"
      case "multiplication":
        return "×"
      case "division":
        return "÷"
      default:
        return op
    }
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />
      default:
        return <Award className="h-6 w-6 text-purple-500" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-auto"
    >
      <Card className="w-full max-w-md max-h-[90vh] p-6 bg-white rounded-3xl border-4 border-indigo-300 shadow-xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Leaderboard
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {!showAllEntries && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">Game Configuration</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-indigo-600">Operation:</span>
                <span className="bg-indigo-100 px-2 py-1 rounded-md">
                  {getOperationSymbol(operation)} ({operation})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-indigo-600">Number:</span>
                <span className="bg-indigo-100 px-2 py-1 rounded-md">{numberUsed}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-indigo-600">Rounds:</span>
                <span className="bg-indigo-100 px-2 py-1 rounded-md">{rounds}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-indigo-600">Timer:</span>
                <span className="bg-indigo-100 px-2 py-1 rounded-md">{timerDuration}s</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="font-medium text-indigo-600">Difficulty:</span>
                <span className="bg-indigo-100 px-2 py-1 rounded-md capitalize">{difficulty}</span>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No scores yet!</p>
            <p className="text-sm">Be the first to set a high score</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border-2 border-indigo-100 flex-1 min-h-0">
              <div className="max-h-[calc(90vh-280px)] md:max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-indigo-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-indigo-600">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-indigo-600">Player</th>
                      {showAllEntries && (
                        <th className="px-4 py-3 text-left text-sm font-medium text-indigo-600">Config</th>
                      )}
                      <th className="px-4 py-3 text-right text-sm font-medium text-indigo-600">Score</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-indigo-600">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(expanded ? leaderboard : leaderboard.slice(0, 5)).map((entry) => (
                      <motion.tr
                        key={entry.id}
                        className={`border-t border-indigo-100 ${entry.id === userScoreId ? "bg-indigo-50" : ""}`}
                        initial={entry.id === userScoreId ? { backgroundColor: "#c7d2fe" } : {}}
                        animate={entry.id === userScoreId ? { backgroundColor: ["#c7d2fe", "#eff6ff", "#c7d2fe"] } : {}}
                        transition={{ duration: 2, repeat: 2 }}
                      >
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {getMedalIcon(entry.rank!)}
                            <span className="font-medium">{entry.rank}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{entry.nickname}</td>
                        {showAllEntries && (
                          <td className="px-4 py-3 text-xs">
                            <div className="flex flex-col">
                              <span>{getOperationSymbol(entry.operation as string)} {entry.number_used}</span>
                              <span className="text-gray-500">{entry.rounds}×{entry.timer_duration}s ({entry.difficulty})</span>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm text-right font-bold text-indigo-600">{entry.score}</td>
                        <td className="px-4 py-3 text-sm text-right">{entry.percentage}%</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {leaderboard.length > 5 && (
              <Button variant="ghost" className="w-full mt-4 text-indigo-600" onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <span className="flex items-center">
                    Show Less <ChevronUp className="ml-2 h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex items-center">
                    Show More <ChevronDown className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            )}
          </>
        )}

        <Button onClick={onClose} className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500">
          Close
        </Button>
      </Card>
    </motion.div>
  )
}
