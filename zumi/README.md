# Zumi — голосовой ассистент

Мобильное приложение для iOS (App Store) и Android (Google Play) из одного кода — Expo SDK 57 / React Native.
Сначала сделано для брокеров по недвижимости, но подходит всем, кому нужен ассистент.

> Сказал → сделано. «Привет, Зуми, встреча с Иваном в пятницу в 15:00» — встреча в календаре, напоминание в WhatsApp, клиент в CRM.

## Что умеет

| | |
|---|---|
| 🎙 **Голосовые команды** | Встречи, напоминания, задачи, заметки, клиенты. Применяются **сразу**, без подтверждений (у каждой строки есть «Отменить»). |
| 👋 **«Привет, Зуми»** | Голосовая активация без нажатий (Picovoice, на устройстве). Сама понимает, когда вы закончили говорить. На iPhone работает при заблокированном экране. |
| 💬 **Отправка сообщений** | «Напиши Алексею, что показ переносится на 18:00» — ИИ пишет вежливое сообщение и отправляет в WhatsApp. |
| 📣 **Рассылки** | «Сделай утреннюю рассылку всем лидам…» — уходит сама, можно каждое утро / по будням. |
| 🗓 **Расписание голосом** | «Какие у меня встречи завтра?» — Zumi отвечает голосом (ElevenLabs; без сети — голос телефона). |
| 📱 **Управление телефоном** | «Открой камеру / Инстаграм / WhatsApp / 2ГИС / Kaspi», «Позвони Ерлану». Фото с камеры падают в Студию. |
| 📞 **Запись звонков → выжимка в WhatsApp** | **Линия Zumi** (личный номер Twilio): все входящие и исходящие звонки записываются автоматически, расшифровываются, карточка клиента обновляется, ставится фоллоу-ап, а короткие итоги приходят в WhatsApp. Ноль нажатий. |
| 🧠 **Выжимка смыслов** | Голосовое / звонок / переписка → Summary, To-Do с дедлайнами, договорённости. |
| 💼 **Memory Box (микро-CRM)** | ИИ сам ведёт карточку: с кем говорили, что интересует, на чём сошлись, когда перезвонить. Этапы воронки, импорт контактов. |
| ✍️ **Студия** | Скриншоты, ссылки, обрывки текста и аудио → рассылка, сценарий видео, лендинг, справка клиенту **по короткой ссылке**. |
| 💎 **Подписка** | Apple In-App Purchase и Google Play Billing через RevenueCat. Бесплатно — 30 команд в месяц. |

### Про запись обычных звонков
Apple и Google **не разрешают** сторонним приложениям записывать обычные звонки или добавлять кнопки на экран звонка. Поэтому:
1. **Линия Zumi** — основной, полностью автоматический путь (номер ставится в объявления, исходящие — кнопка «Позвонить» в карточке клиента).
2. iPhone iOS 18.1+: системная кнопка записи в «Телефоне» → запись в «Заметках» → «Поделиться» → Zumi.
3. Android: встроенная запись звонков → «Поделиться» → Zumi.
4. Встреча / громкая связь — режим «Звонок» в приложении.

Всё, чем «поделились» с Zumi (голосовые из WhatsApp/Telegram, записи, переписки, скрины), разбирается автоматически.

## Архитектура

```
zumi/
├─ src/app/               экраны (Expo Router)
│  ├─ (tabs)/             Главная · История · Люди · Студия · Профиль
│  ├─ capture.tsx         голосовой ввод (команда / выжимка / звонок)
│  ├─ memory.tsx          Memory Box
│  ├─ compose.tsx         Студия: сборка текста из материалов
│  ├─ incoming.tsx        всё, что пришло через «Поделиться»
│  └─ paywall.tsx         подписка
├─ src/components/        дизайн-система «Glass Night»: стекло, волна, маскот
├─ src/lib/               логика: ИИ, календарь, уведомления, WhatsApp, CRM, звонки, wake word
├─ supabase/              сервер (секреты ИИ/голоса/WhatsApp живут только здесь)
│  ├─ migrations/         таблицы, RLS, cron
│  └─ functions/          assistant · digest · compose · transcribe · speak · publish
│                         whatsapp-schedule · whatsapp-dispatch · line · call-twiml · call-recording
└─ share-viewer/          страница для коротких ссылок из Студии
```

- **ИИ**: Claude (Anthropic) через Edge Functions, структурированный JSON-ответ.
- **Голос**: ElevenLabs Scribe (распознавание, разделение на спикеров) + ElevenLabs TTS.
- **Офлайн-режим**: без сервера приложение работает на встроенном парсере русских фраз — можно показывать и тестировать сразу.

## Запуск

```bash
cd zumi
npm install
cp .env.example .env.local      # заполнить ключи (можно пусто — будет офлайн-режим)
npx expo start                  # Expo Go: базовые экраны
npx expo run:ios / run:android  # dev-сборка: голос, Share Extension, подписки, «Привет, Зуми»
```

Проверки: `npx tsc --noEmit`, `npx expo lint`.

## Сервер (Supabase)

```bash
supabase link --project-ref <ref>
supabase db push                                   # таблицы + cron
supabase secrets set --env-file supabase/.env      # см. supabase/.env.example
supabase functions deploy
```
Затем один раз в SQL-редакторе:
```sql
select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
select vault.create_secret('https://<ref>.supabase.co', 'project_url');
```
И включить **Anonymous sign-ins** (Authentication → Providers).

**WhatsApp Business** (Meta → WhatsApp → API Setup): номер + токен, и два шаблона с одной переменной:
`zumi_note` — «{{1}}» (вам: напоминания, итоги звонков), `zumi_message` — «Здравствуйте! {{1}}» (клиентам).

**Twilio** (Линия Zumi): Account SID + Auth Token; номера покупаются автоматически кнопкой «Получить номер».

**«Привет, Зуми»**: в [Picovoice Console](https://console.picovoice.ai/) обучить фразу «Привет, Зуми» (русский), скачать `.ppn` для iOS и Android + `porcupine_params_ru.pv`, выложить (например, в публичный bucket Storage) и указать ссылки в `.env.local`.

## Публикация в App Store и Google Play

1. `npx eas-cli@latest login` → `npx eas-cli@latest init` (впишет `projectId`).
2. **RevenueCat**: проект, приложения iOS + Android, entitlement `pro`, продукты `zumi_pro_monthly` / `zumi_pro_yearly` (в App Store Connect и Google Play Console), offering по умолчанию с пакетами Monthly и Annual. Ключи → `.env.local`.
3. Сборка: `npx eas-cli@latest build --platform all --profile production`.
4. Отправка: `npx eas-cli@latest submit --platform ios` / `--platform android` (заполните `eas.json → submit`).
5. Для ревью Apple: страницы `zumi.app/terms` и `zumi.app/privacy` (ссылки есть на экране подписки), описание фоновой работы микрофона («Привет, Зуми» и запись встреч — по включённой пользователем функции).

Bundle ID / package: `app.zumi.assistant` (поменять в `app.json`, если нужно).
