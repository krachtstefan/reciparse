"use client"

import React from "react"

import { useCallback, useState } from "react"
import { Upload, ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadDropzoneProps {
  onImageSelect: (file: File, preview: string) => void
  preview: string | null
  onClear: () => void
}

export function UploadDropzone({
  onImageSelect,
  preview,
  onClear,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageSelect(file, e.target?.result as string)
      }
      reader.readAsDataURL(file)
    },
    [onImageSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  if (preview) {
    return (
      <div className="relative group">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <img
            src={preview || "/placeholder.svg"}
            alt="Uploaded recipe"
            className="w-full h-auto max-h-[400px] object-contain"
          />
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-md bg-card text-card-foreground hover:bg-secondary"
          onClick={onClear}
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 transition-all cursor-pointer ${
        isDragOver
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload recipe image"
      />
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
          isDragOver ? "bg-primary/10" : "bg-muted"
        }`}
      >
        {isDragOver ? (
          <Upload className="h-6 w-6 text-primary" />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          Drop your recipe image here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          or click to browse. Supports JPG, PNG, WEBP
        </p>
      </div>
    </div>
  )
}
