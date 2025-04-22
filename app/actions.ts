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
  operation?: string
  number_used?: number
  rounds?: number
  timer_duration?: number
  difficulty?: string
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
): Promise<LeaderboardEntry[]> {
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

    // Add rank to each entry and ensure type safety
    return leaderboard.map((entry, index): LeaderboardEntry => ({
      id: entry.id,
      nickname: entry.nickname,
      score: entry.score,
      percentage: entry.percentage,
      created_at: new Date(entry.created_at).toLocaleDateString(),
      rank: index + 1
    }))
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

// Get all leaderboard entries across all configurations
export async function getAllLeaderboardEntries(limit = 10): Promise<LeaderboardEntry[]> {
  try {
    const leaderboard = await sql`
      SELECT id, nickname, score, percentage, created_at, 
             operation, number_used, rounds, timer_duration, difficulty
      FROM scores
      ORDER BY score DESC, percentage DESC
      LIMIT ${limit}
    `

    // Add rank to each entry and ensure type safety
    return leaderboard.map((entry, index): LeaderboardEntry => ({
      id: entry.id,
      nickname: entry.nickname,
      score: entry.score,
      percentage: entry.percentage,
      created_at: new Date(entry.created_at).toLocaleDateString(),
      operation: entry.operation,
      number_used: entry.number_used,
      rounds: entry.rounds,
      timer_duration: entry.timer_duration,
      difficulty: entry.difficulty,
      rank: index + 1
    }))
  } catch (error) {
    console.error("Error fetching all leaderboard entries:", error)
    return []
  }
}

// Get user's rank on the leaderboard
export async function getUserRank(scoreId: number) {
  try {
    console.log("Getting rank for score ID:", scoreId);
    
    // First get the score details
    const scoreDetails = await sql`
      SELECT operation, number_used, rounds, timer_duration, difficulty, score
      FROM scores
      WHERE id = ${scoreId}
    `
    
    console.log("Score details:", scoreDetails);

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
    
    console.log("Higher scores query result:", higherScores);
    console.log("Raw rank value:", higherScores[0].rank);
    console.log("Rank value type:", typeof higherScores[0].rank);
    
    // Convert rank to number explicitly and add 1
    const rankNumber = Number(higherScores[0].rank) + 1;
    console.log("Final rank number:", rankNumber);
    
    const totalCount = await getTotalScores(score);
    
    // Return values as numbers
    return { 
      rank: rankNumber, 
      total: totalCount 
    }
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
    
    console.log("Total scores query result:", result);
    console.log("Raw total value:", result[0].total);
    console.log("Total value type:", typeof result[0].total);
    
    // Convert total to number explicitly
    const totalNumber = Number(result[0].total);
    console.log("Final total number:", totalNumber);
    
    return totalNumber;
  } catch (error) {
    console.error("Error getting total scores:", error)
    return 0
  }
}
