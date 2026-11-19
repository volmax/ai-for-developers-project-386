MERGE INTO event_type(name, description, duration_minutes) KEY(name)
VALUES ('Консультация', 'Краткая консультация', 15);

MERGE INTO event_type(name, description, duration_minutes) KEY(name)
VALUES ('Глубокое погружение', 'Детальное обсуждение', 30);
