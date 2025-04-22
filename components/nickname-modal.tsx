"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface NicknameModalProps {
  onSubmit: (nickname: string) => void
  onCancel: () => void
  isHighScore?: boolean
}

export function NicknameModal({ onSubmit, onCancel, isHighScore = false }: NicknameModalProps) {
  const [nickname, setNickname] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }

    // Try to get saved nickname from localStorage
    const savedNickname = localStorage.getItem("mathGameNickname")
    if (savedNickname) {
      setNickname(savedNickname)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nickname.trim()) {
      setError("Please enter a nickname")
      return
    }

    if (nickname.length > 50) {
      setError("Nickname must be 50 characters or less")
      return
    }

    // Save nickname to localStorage for future use
    localStorage.setItem("mathGameNickname", nickname)

    onSubmit(nickname)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md p-6 bg-white rounded-3xl border-4 border-indigo-300 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            {isHighScore ? "New High Score!" : "Enter Your Nickname"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isHighScore && (
          <motion.div
            className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: 3, duration: 0.6 }}
          >
            <div className="text-yellow-600 font-bold text-lg mb-1">Congratulations!</div>
            <div className="text-yellow-700">You've achieved a new high score for this configuration!</div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              Nickname
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                ref={inputRef}
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  setError("")
                }}
                placeholder="Enter your nickname"
                className="pl-10"
                maxLength={50}
              />
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              Submit
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}
