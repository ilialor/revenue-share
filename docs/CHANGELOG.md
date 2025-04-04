# Changelog

## v2.0.0 (2023-08-15)

### Added

- **Buy-to-Earn Model**: Добавлена полная поддержка модели Buy-to-Earn с двухфазной системой распределения доходов
  - Инвестиционная фаза с предоплатой для создателя
  - Фаза регулярных продаж с распределением доходов
  - Двух-пуловая система для приоритизации неокупившихся токенов
  - Отслеживание точек окупаемости для токенов

- **Новые классы для работы с Buy-to-Earn моделью**:
  - Обновлен класс `RevenueSharing` для поддержки Buy-to-Earn модели
  - Добавлены методы для расчета количества предоплатных токенов
  - Функция оценки точки окупаемости для любого токена

- **Предустановленные схемы Buy-to-Earn**:
  - 11 предустановленных схем для различных сценариев использования
  - Модуль `BuyToEarnSchemes.js` с функциями для работы со схемами
  - Доступ к схемам через `Schemes.BuyToEarnSchemes`

- **Новые API для работы с Buy-to-Earn**:
  - `createBuyToEarn()` - создание инстанса модели
  - `createFromBuyToEarnScheme()` - создание инстанса из предустановленной схемы
  - `createCustomBuyToEarnScheme()` - создание кастомной схемы
  - `getBuyToEarnSchemes()` - получение списка предустановленных схем
  - `estimateTokenPayback()` - оценка точки окупаемости токена

- **Документация**:
  - Добавлен файл `BuyToEarn.md` с подробным описанием модели
  - Обновлен `Architecture.md` с учетом новой архитектуры
  - Расширен `README.md` с примерами использования Buy-to-Earn

- **Примеры использования**:
  - Добавлен пример `examples/buy-to-earn/basic-usage.js`

### Changed

- Обновлены все основные компоненты библиотеки для поддержки Buy-to-Earn модели
- Улучшен калькулятор выплат для работы с двух-пуловой системой распределения
- Расширена система валидации для Buy-to-Earn параметров
- Обновлен интерфейс API с сохранением обратной совместимости

### Fixed

- Улучшена обработка граничных случаев при расчетах распределения
- Исправлены проблемы с округлением выплат

## v1.0.0 (2023-04-01)

### Added

- Первый публичный релиз библиотеки
- Базовые схемы распределения доходов
- Продвинутые схемы с группами и временными окнами
- Система валидации схем
- Подробная документация 