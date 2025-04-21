"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">How to Use Math Blocks</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Getting Started</h3>
            <p>
              Math Blocks helps you learn addition and subtraction using visual blocks. Each block represents a number,
              making it easier to understand how numbers work together.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">How to Play</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Choose an operation (addition or subtraction)</li>
              <li>Select a difficulty level (higher levels use larger numbers)</li>
              <li>Look at the blocks to understand the problem</li>
              <li>Use the up and down arrows to select your answer</li>
              <li>Click "Check Answer" to see if you're right</li>
              <li>If you need help, click "Show Me How" for a step-by-step guide</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Understanding the Visuals</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium text-blue-600">Blue blocks</span> represent the first number
              </li>
              <li>
                For addition, <span className="font-medium text-green-600">green blocks</span> represent the second
                number
              </li>
              <li>
                For subtraction, <span className="font-medium text-red-600">red blocks</span> represent the blocks being
                taken away
              </li>
              <li>
                <span className="font-medium text-purple-600">Purple blocks</span> show the final answer
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Tips for Success</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Start with lower difficulty levels and work your way up</li>
              <li>Watch the animations to understand how numbers combine or separate</li>
              <li>Try to get a streak of correct answers to earn special rewards</li>
              <li>Use the "Show Me How" button if you're stuck</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-center text-blue-700 font-medium">
            Remember, practice makes perfect! The more you play, the better you'll get at math.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
