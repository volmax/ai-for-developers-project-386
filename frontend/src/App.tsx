import { Header } from "@/components/layout/Header";
import { HomePage } from "@/components/pages/HomePage";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-gray-50 to-orange-100">
      <Header />
      <HomePage />
    </div>
  );
}
