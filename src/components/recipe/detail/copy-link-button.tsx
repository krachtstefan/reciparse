import { Check, Link } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const COPIED_STATE_DURATION_MS = 2000;

export function CopyLinkButton() {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, COPIED_STATE_DURATION_MS);
    } catch {
      // Silently fail if clipboard is not available
    }
  };

  return (
    <Button
      aria-label={isCopied ? "Link copied" : "Copy link"}
      onClick={handleCopy}
      size="sm"
      variant="outline"
    >
      {isCopied ? <Check /> : <Link />}
      {isCopied ? "Copied!" : "Copy link"}
    </Button>
  );
}
