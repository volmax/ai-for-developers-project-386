import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">AI for Developers</h1>
      </header>
      <main>
        <Button onClick={() => alert("Каркас работает!")}>Нажми меня</Button>
      </main>
    </div>
  );
}
