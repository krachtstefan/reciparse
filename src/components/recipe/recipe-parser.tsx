"use client"

import { useState, useCallback } from "react"
import { Sparkles, ScanText, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UploadDropzone } from "./upload-dropzone"
import { RecipeOutput, type Recipe } from "./recipe-output"
import { RecipeSkeleton } from "./recipe-skeleton"
import { mockRecipe } from "./mock-recipe"



type ParseState = "idle" | "loading" | "done"

export function RecipeParser() {
  const [preview, setPreview] = useState<string | null>(null)
  const [parseState, setParseState] = useState<ParseState>("idle")
  const [recipe, setRecipe] = useState<Recipe | null>(null)

  const handleImageSelect = useCallback((_file: File, previewUrl: string) => {
    setPreview(previewUrl)
    setParseState("idle")
    setRecipe(null)
  }, [])

  const handleClear = useCallback(() => {
    setPreview(null)
    setParseState("idle")
    setRecipe(null)
  }, [])

  const handleParse = useCallback(() => {
    setParseState("loading")
    // Simulate AI processing with mock data
    setTimeout(() => {
      setRecipe(mockRecipe)
      setParseState("done")
    }, 2200)
  }, [])

  const handleReset = useCallback(() => {
    setPreview(null)
    setParseState("idle")
    setRecipe(null)
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <ScanText className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-foreground sm:text-4xl text-balance">
          Recipe Lens
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          Upload a photo of any recipe from a cookbook, Instagram, or a
          screenshot and get the full recipe extracted and structured instantly.
        </p>
      </header>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Upload */}
        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">
                  Source Image
                </h2>
                {preview && parseState === "done" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    New image
                  </Button>
                )}
              </div>
              <UploadDropzone
                onImageSelect={handleImageSelect}
                preview={preview}
                onClear={handleClear}
              />
              {preview && parseState === "idle" && (
                <Button
                  className="mt-4 w-full gap-2"
                  size="lg"
                  onClick={handleParse}
                >
                  <Sparkles className="h-4 w-4" />
                  Extract Recipe
                </Button>
              )}
              {parseState === "loading" && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary/5 p-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm text-primary font-medium">
                    Analyzing image...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips card -- only shown when no image */}
          {!preview && (
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Tips for best results
                </h3>
                <ul className="space-y-2">
                  {[
                    "Make sure the text is clearly readable in the image",
                    "Crop out unnecessary elements around the recipe",
                    "Works with cookbook pages, handwritten cards, and screenshots",
                    "Supports multiple languages",
                  ].map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                    >
                      <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-primary/60" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Output */}
        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">
                Extracted Recipe
              </h2>
              {parseState === "done" && (
                <span className="flex items-center gap-1 text-xs text-accent font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Complete
                </span>
              )}
            </div>

            {parseState === "idle" && !recipe && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <ScanText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Upload an image and click{" "}
                  <span className="font-medium text-foreground">
                    Extract Recipe
                  </span>{" "}
                  to see results here
                </p>
              </div>
            )}

            {parseState === "loading" && <RecipeSkeleton />}

            {parseState === "done" && recipe && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <RecipeOutput recipe={recipe} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
