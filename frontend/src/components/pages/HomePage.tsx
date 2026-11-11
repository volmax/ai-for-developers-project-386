import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeaturesCard } from "./FeaturesCard";

export function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
        {/* Left column */}
        <div className="flex flex-col justify-center">
          <span className="mb-4 inline-block w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Быстрая запись на звонок
          </span>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Calendar
          </h1>
          <p className="mb-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Забронируйте встречу за минуту: выберите тип события и удобное время.
          </p>
          <Link to="/booking">
            <Button variant="accent" size="lg" className="gap-2">
              Записаться
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>

        {/* Right column */}
        <div className="flex items-center justify-center">
          <FeaturesCard />
        </div>
      </div>
    </div>
  );
}
