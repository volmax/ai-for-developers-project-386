import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <Calendar className="size-5 text-accent" />
          <span className="font-semibold">Calendar</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/booking"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Записаться
          </Link>
        </nav>
      </div>
    </header>
  );
}
