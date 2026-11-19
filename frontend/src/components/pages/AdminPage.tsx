import { Link } from "react-router-dom";
import { CalendarDays, PlusCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function AdminPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight">Панель управления</h1>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link to="/admin/meetings" className="group">
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <CalendarDays className="size-6 text-accent" />
                  Предстоящие встречи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Просмотр и управление бронированиями гостей</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/event-types/new" className="group">
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <PlusCircle className="size-6 text-accent" />
                  Добавить тип встречи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Создание нового типа встречи для каталога</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
