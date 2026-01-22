import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyToggleProps {
  isPrivate: boolean;
  onToggle: () => void;
}

export function PrivacyToggle({ isPrivate, onToggle }: PrivacyToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      data-testid="button-privacy-toggle"
      className="relative"
    >
      {isPrivate ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
      <span className="sr-only">{isPrivate ? "Show values" : "Hide values"}</span>
    </Button>
  );
}
