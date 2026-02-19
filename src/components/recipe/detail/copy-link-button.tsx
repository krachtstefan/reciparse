import { Check, Link } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton() {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      // Silently fail if clipboard is not available
    }
  };

  return (
    <Button
      aria-label={isCopied ? "Link copied" : "Copy link"}
      onClick={handleCopy}
      size="sm"
      variant="ghost"
    >
      {isCopied ? <Check /> : <Link />}
      {isCopied ? "Copied!" : "Copy link"}
    </Button>
  );
}
