type RecipeNotesProps = {
  notes: string;
};

export function RecipeNotes({ notes }: RecipeNotesProps) {
  return (
    <div className="rounded-lg bg-muted/60 p-4">
      <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
        Notes
      </p>
      <p className="whitespace-pre-line text-foreground text-sm leading-relaxed">
        {notes}
      </p>
    </div>
  );
}
