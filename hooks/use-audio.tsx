"use client"

import { useState, useRef, useEffect } from "react"

export function useAudio() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Sound references
  const correctSoundRef = useRef<HTMLAudioElement | null>(null)
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio elements
    correctSoundRef.current = new Audio("/sounds/correct.mp3")
    incorrectSoundRef.current = new Audio("/sounds/incorrect.mp3")
    clickSoundRef.current = new Audio("/sounds/click.mp3")

    // Set volume levels
    if (correctSoundRef.current) correctSoundRef.current.volume = 0.5
    if (incorrectSoundRef.current) incorrectSoundRef.current.volume = 0.4
    if (clickSoundRef.current) clickSoundRef.current.volume = 0.3

    // Add interaction detection
    const handleInteraction = () => {
      setHasInteracted(true)
    }

    window.addEventListener("click", handleInteraction)
    window.addEventListener("keydown", handleInteraction)

    return () => {
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
    }
  }, [])

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    setHasInteracted(true)

    // Play a click sound when toggling
    if (soundEnabled && clickSoundRef.current) {
      try {
        clickSoundRef.current.currentTime = 0
        clickSoundRef.current.play().catch(() => {
          // Silently handle the error
        })
      } catch (err) {
        // Silently catch errors
      }
    }
  }

  const playSound = (type: "correct" | "incorrect" | "click") => {
    if (!soundEnabled || !hasInteracted) return

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

  return {
    soundEnabled,
    toggleSound,
    playSound,
    hasInteracted,
  }
}
