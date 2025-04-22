"use server"

import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!)

// Type definitions
export type ScoreData = {
  nickname: string
  operation: string
  numberUsed: number
  rounds: number
  timerDuration: number
  difficulty: string
  score: number
  percentage: number
}

export type LeaderboardEntry = {
  id: number
  nickname: string
  score: number
  percentage: number
  created_at: string
  rank?: number
}

// Save a new score to the database
export async function saveScore(data: ScoreData) {
  try {
    const result = await sql`
      INSERT INTO scores (
        nickname, operation, number_used, rounds, timer_duration, 
        difficulty, score, percentage
      ) 
      VALUES (
        ${data.nickname}, ${data.operation}, ${data.numberUsed}, 
        ${data.rounds}, ${data.timerDuration}, ${data.difficulty}, 
        ${data.score}, ${data.percentage}
      )
      RETURNING id
    `

    revalidatePath("/")
    return { success: true, id: result[0].id }
  } catch (error) {
    console.error("Error saving score:", error)
    return { success: false, error: "Failed to save score" }
  }
}

// Check if the score is a high score
export async function checkHighScore(data: ScoreData) {
  try {
    // Get the top score for this specific configuration
    const topScore = await sql`
      SELECT score, percentage FROM scores
      WHERE operation = ${data.operation}
      AND number_used = ${data.numberUsed}
      AND rounds = ${data.rounds}
      AND timer_duration = ${data.timerDuration}
      AND difficulty = ${data.difficulty}
      ORDER BY score DESC, percentage DESC
      LIMIT 1
    `

    // If no scores exist or the new score is higher
    if (topScore.length === 0 || data.score > topScore[0].score) {
      return { isHighScore: true, previousBest: topScore[0]?.score || 0 }
    }

    return { isHighScore: false, previousBest: topScore[0].score }
  } catch (error) {
    console.error("Error checking high score:", error)
    return { isHighScore: false, error: "Failed to check high score" }
  }
}

// Get leaderboard entries for a specific configuration
export async function getLeaderboard(
  operation: string,
  numberUsed: number,
  rounds: number,
  timerDuration: number,
  difficulty: string,
  limit = 10,
) {
  try {
    const leaderboard = await sql`
      SELECT id, nickname, score, percentage, created_at
      FROM scores
      WHERE operation = ${operation}
      AND number_used = ${numberUsed}
      AND rounds = ${rounds}
      AND timer_duration = ${timerDuration}
      AND difficulty = ${difficulty}
      ORDER BY score DESC, percentage DESC
      LIMIT ${limit}
    `

    // Add rank to each entry
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      created_at: new Date(entry.created_at).toLocaleDateString(),
    }))
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

// Get user's rank on the leaderboard
export async function getUserRank(scoreId: number) {
  try {
    // First get the score details
    const scoreDetails = await sql`
      SELECT operation, number_used, rounds, timer_duration, difficulty, score
      FROM scores
      WHERE id = ${scoreId}
    `

    if (scoreDetails.length === 0) {
      return { rank: null, error: "Score not found" }
    }

    const score = scoreDetails[0]

    // Count how many scores are higher than this one
    const higherScores = await sql`
      SELECT COUNT(*) as rank
      FROM scores
      WHERE operation = ${score.operation}
      AND number_used = ${score.number_used}
      AND rounds = ${score.rounds}
      AND timer_duration = ${score.timer_duration}
      AND difficulty = ${score.difficulty}
      AND (score > ${score.score} OR (score = ${score.score} AND id < ${scoreId}))
    `

    // Rank is the count of higher scores + 1
    return { rank: higherScores[0].rank + 1, total: await getTotalScores(score) }
  } catch (error) {
    console.error("Error getting user rank:", error)
    return { rank: null, error: "Failed to get rank" }
  }
}

// Get total number of scores for a configuration
async function getTotalScores(score: any) {
  try {
    const result = await sql`
      SELECT COUNT(*) as total
      FROM scores
      WHERE operation = ${score.operation}
      AND number_used = ${score.number_used}
      AND rounds = ${score.rounds}
      AND timer_duration = ${score.timer_duration}
      AND difficulty = ${score.difficulty}
    `
    return result[0].total
  } catch (error) {
    console.error("Error getting total scores:", error)
    return 0
  }
}
