import { ChefHat } from "lucide-react";
import { parseInstructions } from "./utils";

type InstructionListProps = {
  instructions: string;
};

export function InstructionList({ instructions }: InstructionListProps) {
  const steps = parseInstructions(instructions);

  if (steps.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="flex items-center gap-2 font-serif text-foreground text-lg">
        <ChefHat className="h-4 w-4 text-primary" />
        Instructions
      </h3>
      <ol className="mt-3 space-y-4">
        {steps.map((text, index) => (
          <li className="flex gap-3" key={text}>
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
              {index + 1}
            </span>
            <p className="pt-0.5 text-foreground text-sm leading-relaxed">
              {text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
