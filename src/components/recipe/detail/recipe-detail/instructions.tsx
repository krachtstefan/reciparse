import { ChefHat } from "lucide-react";

type InstructionStep = {
  type: "HowToStep";
  text: string;
};

type InstructionListProps = {
  instructions: InstructionStep[];
};

export function InstructionList({ instructions }: InstructionListProps) {
  if (instructions.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="flex items-center gap-2 font-serif text-foreground text-lg">
        <ChefHat className="size-4 text-primary" />
        Instructions
      </h3>
      <ol className="mt-3 space-y-4">
        {instructions.map((step, index) => (
          <li className="flex gap-3" key={`${index}-${step.text}`}>
            <span className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
              {index + 1}
            </span>
            <p className="pt-0.5 text-foreground text-sm leading-relaxed">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
