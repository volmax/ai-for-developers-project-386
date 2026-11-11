import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  "Выбор типа события и удобного времени для встречи.",
  "Быстрое бронирование с подтверждением и дополнительными заметками.",
  "Управление типами встреч и просмотр предстоящих записей в админке.",
];

export function FeaturesCard() {
  return (
    <Card className="bg-background/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Возможности</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {features.map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
