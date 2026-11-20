# Coding Standards

## Unit-тесты сервисов

### Моки вместо Spring Boot контекста

Тесты сервисов — это **чистые unit-тесты**, а не интеграционные тесты с Spring Boot.

```java
// ✅ Правильно: чистые unit-тесты
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    @Mock private BookingRepository bookingRepository;
    @Mock private EventTypeRepository eventTypeRepository;
    @Mock private SlotService slotService;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(
                bookingRepository, eventTypeRepository, slotService, FIXED_CLOCK);
    }

    @Test
    void shouldReturnCreatedBooking() {
        // ... тест ...
        verify(bookingRepository).save(any());
        verifyNoMoreInteractions(eventTypeRepository, bookingRepository, slotService);
    }
}
```

```java
// ❌ Неправильно: интеграционные тесты с Spring Boot
@SpringBootTest
class BookingServiceTest {
    @Autowired private BookingService bookingService;
    @Autowired private BookingRepository bookingRepository;

    @Test
    void shouldCreateBooking() {
        bookingRepository.deleteAll(); // ❌
        // ... реальные вызовы БД ❌
    }
}
```

**Правила:**
- ❌ Без `@SpringBootTest`, `@TestConfiguration`, `@Autowired`
- ✅ `@ExtendWith(MockitoExtension.class)` + `@Mock` + ручное создание сервиса
- ✅ Все зависимости — моки
- ✅ `verify()` после каждого теста, `verifyNoMoreInteractions(...)`
- ✅ `@Nested` группы для логической организации методов

### Фиксированное время через Clock

Тесты не должны зависеть от текущего дня недели или времени.

```java
private static final Clock FIXED_CLOCK = Clock.fixed(
        LocalDateTime.of(2026, 11, 16, 12, 0)
                .atZone(ZoneId.of("Europe/Moscow"))
                .toInstant(),
        ZoneId.of("Europe/Moscow"));
```

В сервисах:
```java
// ✅ Правильно
LocalDate today = LocalDate.ofInstant(clock.instant(), clock.getZone());

// ❌ Неправильно
LocalDate today = LocalDate.now(ZoneId.of("Europe/Moscow"));
```

### Тестовые билдеры

Для сущностей, которые используются в тестах, создавайте `testEntity()` builder через Lombok `@Builder(builderMethodName = "testEntity")`.

```java
// В сущности:
@Builder(builderMethodName = "testEntity")
public Booking(Long id, String eventTypeId, ...) { ... }

// В тесте:
Booking booking = Booking.testEntity()
        .id(1L)
        .eventTypeId("1")
        .eventTypeName("Консультация")
        .slotStart(LocalDateTime.of(2026, 11, 16, 10, 0))
        .slotEnd(LocalDateTime.of(2026, 11, 16, 10, 30))
        .guestName("Test Guest")
        .guestEmail("test@example.com")
        .createdAt(LocalDateTime.now(FIXED_CLOCK))
        .build();
```
