"use client";

import { ScanText } from "lucide-react";
import { ExtractedRecipePanel } from "./extracted-recipe-panel";
import { SourceImagePanel } from "./source-image-panel";
import { TipsCard } from "./tips-card";
import { useRecipeParser } from "./use-recipe-parser";

export function RecipeParser() {
  const parser = useRecipeParser();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <ScanText className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-balance font-serif text-3xl text-foreground sm:text-4xl">
          Recipe Lens
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm leading-relaxed">
          Upload a photo of any recipe from a cookbook, Instagram, or a
          screenshot and get the full recipe extracted and structured instantly.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SourceImagePanel
            isDone={parser.isDone}
            isFailed={parser.isFailed}
            isIdle={parser.isIdle}
            isProcessing={parser.isProcessing}
            onClear={parser.handleClear}
            onImageSelect={parser.handleImageSelect}
            onParse={parser.handleParse}
            onReset={parser.handleReset}
            parseState={parser.parseState}
            preview={parser.preview}
          />
          {!parser.preview && <TipsCard />}
        </div>

        <ExtractedRecipePanel
          isDone={parser.isDone}
          isFailed={parser.isFailed}
          isIdle={parser.isIdle}
          isProcessing={parser.isProcessing}
          melaRecipe={parser.melaRecipe}
        />
      </div>
    </div>
  );
}
