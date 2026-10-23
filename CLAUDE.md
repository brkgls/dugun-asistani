# Düğün Salonu Asistanı (venue CRM)

Düğün salonları için WhatsApp tabanlı planlama ve satış asistanı. Çiftler
salonun WhatsApp numarasına yazar; bot salon, ay/hafta, saat dilimi, davetli
sayısı ve menü tercihini sorup bir **lead** (potansiyel müşteri) oluşturur.
Salon personeli panelden lead'leri, salonları, menüleri ve kapasite kurallarını yönetir.
Prod: api-dugun.akillirandevum.com, tek VPS, systemd altında `dugun.service`.

Akıllı Randevum ile aynı mimariden türetildi; desenler ortak.

## Teknoloji

- Backend: Java 21, Spring Boot 4.1, Maven (`./mvnw`), PostgreSQL 16, Flyway,
  Spring Data JPA (`ddl-auto=validate`), Spring Security + JWT, WhatsApp Cloud API, Web Push, Lombok
- Panel (`randevu-panel/`): React + TypeScript + Vite

## Komutlar

```bash
./mvnw -B verify                 # backend derleme + testler (Postgres gerekir)
./mvnw -B -DskipTests package    # sadece jar

cd randevu-panel
npm ci && npm run lint && npm run build
```

`AppApplicationTests` gerçek bir Postgres'e bağlanır. CI'da ve agent
ortamında `DB_URL`, `DB_USER`, `DB_PASSWORD` ile bir Postgres servisi sağlanır.
Lokalde `docker compose up -d` (DB 5432'de açılır; uygulamanın varsayılanı 5433, `DB_URL` ile ez).

## Mimari

```
com.venuecrm.app
├── controller/            REST uçları (/api/** JWT ister, /api/auth/** açık)
├── webhook/controller/    WhatsApp webhook
├── conversation/          Sohbet durum makinesi
│   └── handler/           Hall → Month → Week → TimeSlot → GuestRange → Menu → Name → Confirm
├── service/ + impl/       İş mantığı; AvailabilityEvaluationService kapasite kurallarını değerlendirir
├── repository/            Spring Data JPA
├── model/entity           Tenant, Hall, Menu, HallMenu, CapacityRule, Lead, LeadNote, Customer ...
├── scheduler/OutboxPoller Giden mesaj kuyruğu (outbox deseni)
├── security/ whatsapp/ config/ util/ exception/
randevu-panel/src/features/  lead-board, halls, menus, capacity-rules, calendar, settings ...
```

**Sohbet akışı:** `ConversationServiceImpl`, `List<StateHandler>`'ı `state()` ile
bir map'e çevirip mevcut duruma göre handler çağırır. Yeni adım için:
`ConversationState`'e değer ekle → `AbstractStateHandler`'dan türeyen `@Component` yaz →
durum adının `wa_conversation` kolonuna sığdığını kontrol et.

## Kurallar (agent'lar dahil herkes için)

### Veritabanı
- **Mevcut bir `V*__*.sql` dosyasını asla değiştirme.** Yeni migration bir sonraki numarayla (`V8__...`).
- Entity değişikliği ve migration aynı PR'da olmalı (Hibernate `validate`).
- Veri silen ya da kolon daraltan migration için PR açıklamasında açıkça uyar; PR'a `migration` etiketi ekle.

### Çok kiracılılık
- Her sorgu tenant'a göre filtrelenmeli. Panel isteklerinde tenant `PanelPrincipal`'dan gelir.

### Zaman, gizli bilgiler, stil
- Şu anki zaman için enjekte edilen `Clock` kullanılır (`ClockConfig`).
- Gizli bilgi koda ya da `application.properties` varsayılanına yazılmaz. Yeni ayar `${ENV_ADI:}` olarak eklenir,
  `.env.example`'a da yazılır ve PR açıklamasında belirtilir.
- Servis arayüzü + `impl/`, constructor injection. Yorum ve loglar Türkçe ASCII; kullanıcıya giden mesajlar düzgün Türkçe.

### Testler
- Şu an sadece `contextLoads` testi var. Dokunduğun iş mantığına birim testi ekle
  (Mockito + sabit `Clock`; örnek desen Akıllı Randevum'daki `SlotServiceImplTest`).
- Panel değişikliklerinde `npm run lint` ve `npm run build` temiz geçmeli.

### Dokunma
- `.github/workflows/deploy.yml` ve sunucu ayarları: sadece Burak değiştirir.
- `Dockerfile` ve `docker-compose.prod.yml` eski deploy yöntemine ait; prod artık systemd + jar. Bunları kendiliğinden güncelleme.

## İş akışı (agent'lar için)

1. Issue'yu oku. Belirsizlik varsa varsayımını issue'ya yorum olarak yaz, sonra devam et.
2. Değişikliği yap, testleri ekle, `./mvnw -B verify` (ve panel değiştiyse lint + build) çalıştır.
3. Commit mesajları İngilizce, kısa ve emir kipinde.
4. Branch'i push et; PR'ı Burak açar. Bitirdiğinde issue yorumuna Türkçe bir PR özeti yaz:
   ne/neden (`Closes #N`), nasıl test edildi, migration ya da yeni `.env` ayarı var mı, riskler.
5. Prod'a deploy etme. Deploy her zaman Burak'ın onayıyla, elle tetiklenir.
