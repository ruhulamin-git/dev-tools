# Quran Khatmah Tracker — UI Redesign Brief

A complete, design-ready description of the app: purpose, every screen/state, components,
real-time behavior, internationalization, the functional invariants a redesign must keep, a
screen-by-screen wireframe checklist, and a full EN/BN copy deck.

> Hand this whole file to a design tool. Sections 1–12 = the spec, 13 = wireframe checklist,
> 14 = copy deck. The locale files (`src/routes/quran-khatmah-tracker/locales/{en,bn}.json`)
> are the canonical source of strings.

---

## 1. Product overview
A **real-time, collaborative web app for completing the entire Qur'an together**. A "khatmah" is one
full reading of the Qur'an (30 juz' / 604 pages). A group splits the Qur'an into contiguous parts; each
person reads their share, marks it done, and everyone watches the whole Qur'an finish **live**.

- **Audience:** families, friend groups, masjids/communities — often in Ramadan, or to dedicate the
  reward to a loved one ("sadaqah jariyah").
- **Principles:** 100% free, **no signup/accounts**, instant, mobile-first, bilingual (**English +
  Bangla**), two Arabic scripts (**Uthmani/Madani** and **Indo-Pak**).
- **Tone:** warm, respectful, spiritual yet modern and friendly; calm and trustworthy; not corporate.

## 2. Platform & constraints
- One **route inside a larger "DevXHub Tools" SvelteKit site**; the host wraps it with its own dark
  header/footer. This app owns everything in between.
- **Canvas is always dark** (deep indigo `#1A1139`). Current design uses **white cards on dark**.
- **Real-time** over WebSocket — any change propagates to **all connected devices in ~1s**; the server
  is the single source of truth.
- **No login.** Identity = a typed **name + ID** (e.g. NID/mobile), stored locally per room. Rooms are
  reached by a 6-char **code** or an **invite link**.
- **Bilingual + RTL:** all strings translated EN/BN; Arabic ayah text is **right-to-left** with special
  fonts; two selectable scripts.
- **Roles:** **Admin** (creator, holds a secret admin token) and **Participant/Reader**; plus passive
  **watchers**.

## 3. Lifecycle (the spine of the UX — make the current phase obvious)
```
LOBBY ──(admin joins, confirms a number, starts)──► ACTIVE ──(all parts done)──► COMPLETED
gathering people,                                   reading board:               celebration +
Qur'an not split yet                                claim / read / finish        admin export
```

## 4. Global elements (every screen)
- **App bar:** brand glyph "۞" + "Quran Khatmah"; **Language** selector (English/বাংলা); **Script**
  selector (Madani/Uthmani · Indo-Pak).
- **Toast:** transient bottom pill ("Invite link copied", "Khatmah exported and closed", errors).

## 5. Screens & states

### A. Landing / Home (no room yet)
1. **Hero** — H1 + lead + two buttons ("Start a khatmah", "I have a code") + 3 pills.
2. **"Done in three simple steps"** — 3 numbered cards.
3. **"Why families & communities love it"** — 6 emoji feature tiles (⚡📖📱🌍🔒🤲).
4. **Create / Join cards** (with an "or" divider):
   - **Create:** *Expected participants* (number + helper), *Dedication* (optional), "Create khatmah".
   - **Join:** *Room code*, *Your name*, *Your ID*, "Join".
5. **FAQ** — 5 expandable Q&As.
6. **Promo/CTA band** — sponsor CTA (gradient + illustration + gold button). Keep, can restyle.

### B. Lobby (room created, not divided yet) — the "waiting room"
- **Header card:** Room code (prominent), **Copy invite link** + (admin) **Copy admin link**.
- Title "Waiting room" + subtitle; **live count headline** "{n} of {target} joined"; **"Who's in"**
  participant chips (empty state when none).
- **Context action card:**
  - *Not joined (admin or visitor):* **Join form** (name + ID + "Join the room"); admin sees the hint
    "join as a reader first — then you can start".
  - *Admin, joined:* "Divide the Quran into [N]" (defaults to joined count) + **Start khatmah**.
  - *Participant, joined:* "You're in!" + "Waiting for the admin to start…".
- Design intent: anticipatory + social; emphasize the growing count and the gathering list.

### C. Active room — the reading board (core screen, two columns, stacks on mobile)
- **Header card:** room code, optional **Dedication**, share buttons, **progress bar** + "{done} of
  {total} parts completed".
- **"Your part(s)" zone:** claim callout (name/ID + "Claim my part") when none; else your part card(s);
  or "no active part" hint.
- **Left — "All parts" board:** grid of **Part cards** (see §6).
- **Right (aside):** **Admin panel** (admin only: export/reset) + **Activity feed** (live, newest-first,
  timestamped).

### D. Completed
Celebratory banner "The khatmah is complete 🎉" + "May Allah accept it from everyone." Admin can
**Export proof & close**.

### E. Certificate (printable export) — separate print view
Self-contained printable doc: title, "proof" line, meta grid (code, participants, created/completed
dates, dedication), **table of all parts** (range, surahs, reader, status, completed time), full activity
log, credit footer. Optimized for **print/PDF** — clean, document-like, gold/green accents.

## 6. Component inventory
- **App bar** — brand + language select + script select.
- **Section/landing blocks** — hero, step cards, feature tiles, FAQ accordion, promo/CTA band.
- **Create card / Join card** — labeled inputs + primary button + inline error text.
- **Lobby header card** — code + share buttons + live count + participant chips.
- **Lobby action card** — join form / start control / waiting message.
- **Room header card** — code + dedication + share + progress bar + progress text.
- **Your-part zone** — claim form / your part cards / empty hints.
- **Part card** — `#index`; **status badge** (Open/Reading/Done); range "Juz' a–b · Pages x–y"; **From**
  block (label, surah name in Arabic RTL, transliteration, "Ayah n", boundary ayah Arabic text in the
  chosen script); **To** block (same); reader name or "Unassigned"; **live timer** (elapsed / total);
  contextual **action buttons** (Take this part / Start / Finish / Stop & pass / admin Release); colored
  left border = status (mine/reading/done).
- **Admin panel** — "you are admin" note + Export proof & close (gated) + Reset khatmah (danger).
- **Activity feed** — list of human-readable events + timestamps.
- **Toast** — transient confirmations/errors.
- **Certificate** — printable table-based document.

## 7. Real-time behaviors to express visually
- Joins, claims, starts, finishes, passes, releases, resets — **all update instantly on every device**.
  Candidate motion cues: new participant chip appears, progress bar fills, a part flips to Done, a new
  activity line slides in.
- Live **joined count** and live **elapsed timers** on in-progress parts.

## 8. Status & color semantics (keep meaning, restyle freely)
- **Part status:** Open (neutral) · Reading/in-progress (amber) · Done (green).
- **Green** = Qur'an-positive (room code, completion, done). **Gold/yellow** = brand/primary. **Red** =
  danger (reset). Host site's default component accent is blue.
- "Mine" (your own part) is visually distinguished.

## 9. Internationalization & RTL (hard constraints)
- Every label/string is **EN ↔ BN**; layouts must absorb longer Bangla text.
- **Arabic ayah text is RTL** (Amiri Quran / Noto Naskh Arabic); two script styles selectable. Don't
  bake text into images — keep it live and translatable.

## 10. Edge / empty / error states to design
Lobby with 0 joined; board with all parts unassigned; "all parts already assigned" (full); invalid room
code; "khatmah already started"; admin-only action blocked; reconnect after a network drop; popup-blocked
certificate. (Full error copy in §14.)

## 11. Current visual baseline (open to full replacement)
Dark indigo canvas, white rounded cards, gold primary buttons, green for Qur'an/done, amber in-progress,
generous rounding; Poppins (Latin) + Amiri/Naskh (Arabic) + Noto Sans Bengali. The current build mixes
the host "house style" (white shadcn cards / blue buttons) with the bespoke dark/gold landing — a
redesign can unify this into one coherent system.

## 12. Functional invariants a redesign MUST preserve
1. Three phases (**lobby → active → completed**) with a clear current-phase indicator.
2. App-bar **language + script** selectors.
3. **Identity = name + ID** typed inline (no auth screens).
4. **Room code + invite link + admin link** sharing.
5. **Lobby:** live joined count, participant list, everyone-joins-first, admin "divide into N + Start".
6. **Board:** per-part card (index, status, juz/pages, From/To Arabic refs, reader, timer) +
   claim/start/finish/pass/release; "your part" claim zone; progress bar; admin panel; activity feed.
7. **Completed** state + **printable certificate** export.
8. **Real-time** sync, **EN/BN + RTL + two Arabic scripts**.

---

## 13. Screen-by-screen wireframe checklist

**Global (all screens)**
- [ ] App bar: brand (۞ + name), Language select, Script select
- [ ] Toast region (bottom)

**Home / Landing**
- [ ] Hero: H1, lead, "Start a khatmah" + "I have a code" buttons, 3 pills
- [ ] 3 step cards (numbered)
- [ ] 6 feature tiles (icon + title + line)
- [ ] Create card: Expected participants (number + helper), Dedication (optional), Create button, error slot
- [ ] "or" divider
- [ ] Join card: Room code, Your name, Your ID, Join button, error slot
- [ ] FAQ accordion (5)
- [ ] Promo/CTA band

**Lobby**
- [ ] Header card: Room code (prominent), Copy invite link, Copy admin link (admin only)
- [ ] "Waiting room" title + subtitle
- [ ] Live count "{n} of {target} joined"
- [ ] "Who's in" participant chips (+ empty state)
- [ ] Action card — Join form (name + ID + Join); admin hint
- [ ] Action card — Admin start (divide-into number + helper + Start) [after admin joins]
- [ ] Action card — "You're in / waiting" [joined participant]

**Active board**
- [ ] Header card: room code, dedication (if any), share buttons, progress bar + "{done} of {total} parts completed"
- [ ] Your-part zone: claim form / your part card(s) / "no active part" hint
- [ ] "All parts" board grid of Part cards
- [ ] Part card: #index, status badge, juz/pages range, From block (Arabic), To block (Arabic), reader/unassigned, timer, action buttons
- [ ] Aside: Admin panel (export/reset) + Activity feed (timestamped)
- [ ] Completed banner (when 100% done)

**Certificate (print)**
- [ ] Title + proof line
- [ ] Meta grid (code, participants, created/completed, dedication)
- [ ] Parts table (#, range, surahs, reader, status, completed time)
- [ ] Activity log
- [ ] Credit footer

---

## 14. Copy deck (English / বাংলা)

### App / controls
| Key | English | বাংলা |
|---|---|---|
| app.title | Quran Khatmah | কুরআন খতম |
| app.subtitle | Complete the Quran together | সবাই মিলে কুরআন খতম করুন |
| lang.label | Language | ভাষা |
| script.label | Script | লিপি |
| script.uthmani | Madani / Uthmani | মাদানি / উসমানি |
| script.indopak | Indo-Pak | ইন্দো-পাক |

### Home — hero
| Key | English | বাংলা |
|---|---|---|
| home.hero.title | Complete the Quran together — one khatmah, many hearts | সবাই মিলে কুরআন খতম করুন — এক খতম, বহু হৃদয় |
| home.hero.lead | Split the 30 juz' across your family, friends or masjid, claim your part, and watch the whole Quran finish in real time. Free, instant, no signup. | ৩০ পারা আপনার পরিবার, বন্ধু বা মসজিদের মাঝে ভাগ করে নিন, নিজের অংশ নিন, আর পুরো কুরআন সম্পন্ন হতে দেখুন রিয়েল-টাইমে। ফ্রি, তাৎক্ষণিক, সাইনআপ ছাড়াই। |
| home.hero.start | Start a khatmah | খতম শুরু করুন |
| home.hero.join | I have a code | আমার কাছে কোড আছে |
| home.hero.pill1 | 100% free · No signup | ১০০% ফ্রি · সাইনআপ নেই |
| home.hero.pill2 | Madani & Indo-Pak | মাদানি ও ইন্দো-পাক |
| home.hero.pill3 | English & বাংলা | English ও বাংলা |

### Home — steps
| Key | English | বাংলা |
|---|---|---|
| home.steps.title | Done in three simple steps | মাত্র তিন ধাপে সম্পন্ন |
| home.steps.s1t | Create a room | রুম তৈরি করুন |
| home.steps.s1b | Pick how many people will join. We divide the Quran fairly for you. | কতজন যোগ দেবে তা বেছে নিন। আমরা কুরআন সমানভাবে ভাগ করে দিই। |
| home.steps.s2t | Share the code | কোড শেয়ার করুন |
| home.steps.s2b | Send the room code or link. Everyone joins in one tap — no account needed. | রুম কোড বা লিংক পাঠান। সবাই এক ট্যাপে যোগ দেবে — কোনো অ্যাকাউন্ট লাগবে না। |
| home.steps.s3t | Read & finish together | একসাথে পড়ুন ও সম্পন্ন করুন |
| home.steps.s3b | Claim your part, mark it done, and watch the khatmah complete live. | নিজের অংশ নিন, সম্পন্ন চিহ্নিত করুন, আর খতম সম্পূর্ণ হতে দেখুন লাইভ। |

### Home — benefits
| Key | English | বাংলা |
|---|---|---|
| home.benefits.title | Why families & communities love it | কেন পরিবার ও কমিউনিটি এটি পছন্দ করে |
| home.benefits.sub | Everything you need to finish the Quran together — and nothing you don't. | একসাথে কুরআন শেষ করতে যা যা দরকার — অপ্রয়োজনীয় কিছু ছাড়াই। |
| b1t / b1b | Live progress / Every started and completed part updates instantly for the whole group. | লাইভ অগ্রগতি / প্রতিটি শুরু ও সম্পন্ন অংশ সঙ্গে সঙ্গে পুরো দলের কাছে আপডেট হয়। |
| b2t / b2b | Authentic division / Fair shares along real juz' boundaries and the 604-page Madani mushaf. | সঠিক বিভাজন / প্রকৃত পারার সীমা ও ৬০৪ পৃষ্ঠার মাদানি মুসহাফ অনুসারে সঠিক ভাগ। |
| b3t / b3b | Any device / Built mobile-first. Works on every phone, tablet and laptop — no install. | যেকোনো ডিভাইস / মোবাইল-ফার্স্ট। প্রতিটি ফোন, ট্যাবলেট ও ল্যাপটপে চলে — ইনস্টল ছাড়াই। |
| b4t / b4b | Bilingual / Full English and Bangla interface, with Uthmani and Indo-Pak scripts. | দ্বিভাষিক / সম্পূর্ণ English ও বাংলা ইন্টারফেস, উসমানি ও ইন্দো-পাক লিপিসহ। |
| b5t / b5b | Private / No accounts, no tracking. Just a room code shared with the people you choose. | গোপনীয় / কোনো অ্যাকাউন্ট বা ট্র্যাকিং নেই। শুধু একটি রুম কোড, যাদের চান তাদের সাথে শেয়ার করুন। |
| b6t / b6b | A lasting reward / Dedicate your khatmah to a loved one — a beautiful, ongoing sadaqah jariyah. | স্থায়ী সওয়াব / আপনার খতম প্রিয়জনের নামে উৎসর্গ করুন — একটি সুন্দর, চলমান সদকায়ে জারিয়া। |

### Home — FAQ
| Key | English | বাংলা |
|---|---|---|
| faq.title | Frequently asked questions | সাধারণ জিজ্ঞাসা |
| q1 / a1 | What is a Quran khatmah? / A khatmah is completing the entire Quran. Here a group shares the work so the whole Quran is finished together. | কুরআন খতম কী? / খতম মানে সম্পূর্ণ কুরআন পড়া। এখানে একটি দল কাজটি ভাগ করে নেয়, যাতে পুরো কুরআন একসাথে শেষ হয়। |
| q2 / a2 | Is it free? Do I need an account? / It's 100% free with no signup. Create a room, share the code, and begin — no email or password. | এটি কি ফ্রি? অ্যাকাউন্ট লাগবে? / এটি ১০০% ফ্রি, সাইনআপ ছাড়াই। রুম তৈরি করুন, কোড শেয়ার করুন, শুরু করুন — কোনো ইমেইল বা পাসওয়ার্ড নেই। |
| q3 / a3 | How is the Quran divided? / Along authentic juz' boundaries and the 604-page Madani mushaf, so every share is fair and accurate. | কুরআন কীভাবে ভাগ করা হয়? / প্রকৃত পারার সীমা ও ৬০৪ পৃষ্ঠার মাদানি মুসহাফ অনুসারে, যাতে প্রতিটি ভাগ সঠিক ও ন্যায্য হয়। |
| q4 / a4 | Can we join from different places? / Yes — anyone with the code can join from any device, and progress syncs live for everyone. | আমরা কি ভিন্ন ভিন্ন জায়গা থেকে যোগ দিতে পারি? / হ্যাঁ — কোড থাকলে যে কেউ যেকোনো ডিভাইস থেকে যোগ দিতে পারে, আর অগ্রগতি সবার জন্য লাইভ সিঙ্ক হয়। |
| q5 / a5 | Which scripts and languages are supported? / Madani/Uthmani and Indo-Pak scripts, with a full English and Bangla (বাংলা) interface. | কোন লিপি ও ভাষা সমর্থিত? / মাদানি/উসমানি ও ইন্দো-পাক লিপি, সম্পূর্ণ English ও বাংলা ইন্টারফেসসহ। |

### Home — create / join
| Key | English | বাংলা |
|---|---|---|
| home.or | or | অথবা |
| create.title | Start a new khatmah | নতুন খতম শুরু করুন |
| create.count | Expected participants | আনুমানিক অংশগ্রহণকারী |
| create.countHint | Just an estimate — you'll confirm the exact split once people join. | শুধু একটি ধারণা — সবাই যোগ দিলে শুরুর সময় চূড়ান্ত ভাগ ঠিক করবেন। |
| create.countPlaceholder | e.g. 30 | যেমনঃ ৩০ |
| create.dedication | Dedication (optional) | উৎসর্গ (ঐচ্ছিক) |
| create.dedicationPlaceholder | e.g. for the soul of… | যেমনঃ মরহুম … এর রূহের মাগফিরাতের জন্য |
| create.button | Create khatmah | খতম তৈরি করুন |
| join.title | Join a khatmah | খতমে যোগ দিন |
| join.code | Room code | রুম কোড |
| join.codePlaceholder | e.g. AB12CD | যেমনঃ AB12CD |
| join.name | Your name | আপনার নাম |
| join.namePlaceholder | e.g. Abdullah | যেমনঃ আব্দুল্লাহ |
| join.id | Your ID | আপনার আইডি |
| join.idPlaceholder | e.g. NID or mobile number | যেমনঃ এনআইডি বা মোবাইল নম্বর |
| join.button | Join | যোগ দিন |

### Lobby
| Key | English | বাংলা |
|---|---|---|
| lobby.title | Waiting room | ওয়েটিং রুম |
| lobby.subtitle | Share the invite link and wait for everyone to join. | আমন্ত্রণ লিংক শেয়ার করুন এবং সবার যোগ দেওয়ার অপেক্ষা করুন। |
| lobby.joined | {n} joined | {n} জন যোগ দিয়েছেন |
| lobby.target | {n} of {target} joined | {target} জনের মধ্যে {n} জন যোগ দিয়েছেন |
| lobby.participantsTitle | Who's in | যারা আছেন |
| lobby.empty | No one has joined yet — share the link below. | এখনো কেউ যোগ দেননি — নিচের লিংকটি শেয়ার করুন। |
| lobby.waiting | Waiting for the admin to start the khatmah… | অ্যাডমিন খতম শুরু করার অপেক্ষায়… |
| lobby.youJoined | You're in! The khatmah will begin once the admin starts it. | আপনি যোগ দিয়েছেন! অ্যাডমিন শুরু করলেই খতম শুরু হবে। |
| lobby.joinTitle | Join this khatmah | এই খতমে যোগ দিন |
| lobby.adminJoinHint | As the admin, join as a reader first — then you can start the khatmah. | অ্যাডমিন হিসেবে আগে পাঠক হিসেবে যোগ দিন — তারপর খতম শুরু করতে পারবেন। |
| lobby.joinButton | Join the room | রুমে যোগ দিন |
| lobby.start | Start khatmah | খতম শুরু করুন |
| lobby.partsCount | Divide the Quran into | কুরআনকে ভাগ করুন |
| lobby.partsUnit | part(s) | ভাগে |
| lobby.startHint | Defaults to the number who joined — adjust if you like. | যতজন যোগ দিয়েছেন তা ডিফল্ট — চাইলে পরিবর্তন করুন। |

### Room / board / admin
| Key | English | বাংলা |
|---|---|---|
| room.code | Room code | রুম কোড |
| room.dedication | Dedication | উৎসর্গ |
| room.share | Copy invite link | আমন্ত্রণ লিংক কপি করুন |
| admin.shareAdmin | Copy admin link | অ্যাডমিন লিংক কপি করুন |
| admin.title | Admin | অ্যাডমিন |
| admin.youAreAdmin | You are the admin of this khatmah. | আপনি এই খতমের অ্যাডমিন। |
| admin.export | Export proof & close | প্রমাণ রপ্তানি করে বন্ধ করুন |
| admin.exportHint | Available once the khatmah is complete. | খতম সম্পন্ন হলে এটি পাওয়া যাবে। |
| admin.confirmExport | Export this khatmah as proof and permanently delete it? This cannot be undone. | এই খতম প্রমাণ হিসেবে রপ্তানি করে স্থায়ীভাবে মুছে ফেলবেন? এটি আর ফেরানো যাবে না। |
| admin.reset | Reset khatmah | খতম রিসেট করুন |
| admin.release | Release | ছেড়ে দিন |
| admin.confirmReset | Reset the whole khatmah? All progress will be cleared. | পুরো খতম রিসেট করবেন? সমস্ত অগ্রগতি মুছে যাবে। |
| board.title | All parts | সব অংশ |
| progress.text | {done} of {total} parts completed | {total} ভাগের মধ্যে {done} ভাগ সম্পন্ন |
| completed.title | The khatmah is complete 🎉 | খতম সম্পন্ন হয়েছে 🎉 |
| completed.subtitle | May Allah accept it from everyone. | আল্লাহ সবার পক্ষ থেকে কবুল করুন। |

### Part card
| Key | English | বাংলা |
|---|---|---|
| part.juz | Juz' {from}–{to} | পারা {from}–{to} |
| part.juzSingle | Juz' {n} | পারা {n} |
| part.pages | Pages {from}–{to} | পৃষ্ঠা {from}–{to} |
| part.page | Page {n} | পৃষ্ঠা {n} |
| part.from | From | শুরু |
| part.to | To | শেষ |
| part.ayah | Ayah {n} | আয়াত {n} |
| part.start | Start | শুরু করুন |
| part.end | Finish | সম্পন্ন |
| part.statusOpen | Open | খালি |
| part.statusInProgress | Reading | পড়ছেন |
| part.statusDone | Done | সম্পন্ন |
| part.assignedTo | Reader | পাঠক |
| part.unassigned | Unassigned | বরাদ্দ হয়নি |
| part.yourPartsTitle | Your parts | আপনার অংশসমূহ |
| part.noActiveTitle | You have no active part | আপনার কোনো সক্রিয় অংশ নেই |
| part.takeHint | You may take another open part from the board below. | নিচের বোর্ড থেকে আপনি আরেকটি খালি অংশ নিতে পারেন। |
| part.take | Take this part | এই অংশ নিন |
| part.pass | Stop & pass | থামিয়ে ছেড়ে দিন |
| part.confirmPass | Stop and pass this part? It will re-open for someone else. | এই অংশটি থামিয়ে ছেড়ে দেবেন? এটি অন্য কারো জন্য আবার খালি হয়ে যাবে। |
| part.claimTitle | You haven't claimed a part yet | আপনি এখনো কোনো অংশ নেননি |
| part.claimHint | Enter your name and ID to be assigned the next available part. | পরবর্তী খালি অংশ পেতে আপনার নাম ও আইডি দিন। |
| part.claimButton | Claim my part | আমার অংশ নিন |

### Activity feed
| Key | English (template) | বাংলা |
|---|---|---|
| feed.title | Activity | কার্যক্রম |
| feed.room_created | Room created. Share the link and wait for people to join. | রুম তৈরি হয়েছে। লিংক শেয়ার করুন এবং সবার যোগ দেওয়ার অপেক্ষা করুন। |
| feed.lobby_joined | {name} joined the room. | {name} রুমে যোগ দিয়েছেন। |
| feed.khatmah_started | The khatmah started — divided into {count} part(s). | খতম শুরু হয়েছে — {count} ভাগে বিভক্ত হয়েছে। |
| feed.joined | {name} ({id}) joined and took part {index}. | {name} ({id}) যোগ দিয়েছেন এবং {index} নং অংশ নিয়েছেন। |
| feed.started | {name} ({id}) started reading part {index}. | {name} ({id}) {index} নং অংশ পড়া শুরু করেছেন। |
| feed.ended | {name} ({id}) completed part {index}. ✅ | {name} ({id}) {index} নং অংশ সম্পন্ন করেছেন। ✅ |
| feed.claimed | {name} ({id}) took part {index}. | {name} ({id}) {index} নং অংশ নিয়েছেন। |
| feed.passed | {name} ({id}) passed part {index} for someone else. | {name} ({id}) {index} নং অংশ অন্য কারো জন্য ছেড়ে দিয়েছেন। |
| feed.released | Part {index} was released by the admin. | অ্যাডমিন {index} নং অংশ ছেড়ে দিয়েছেন। |
| feed.reset | The admin reset the khatmah. | অ্যাডমিন খতম রিসেট করেছেন। |
| feed.completed | 🎉 The khatmah was completed. May Allah accept it. | 🎉 খতম সম্পন্ন হয়েছে। আল্লাহ কবুল করুন। |

### Toasts
| Key | English | বাংলা |
|---|---|---|
| toast.linkCopied | Invite link copied | আমন্ত্রণ লিংক কপি হয়েছে |
| toast.adminCopied | Admin link copied | অ্যাডমিন লিংক কপি হয়েছে |
| toast.closed | Khatmah exported and closed | খতম রপ্তানি করে বন্ধ করা হয়েছে |

### Certificate (print)
| Key | English | বাংলা |
|---|---|---|
| cert.title | Khatmah Completion Certificate | খতম সমাপ্তির সনদ |
| cert.proof | This certifies the completion of the following Quran khatmah. | এটি নিম্নলিখিত কুরআন খতম সম্পন্ন হওয়ার প্রমাণ। |
| cert.participants | Participants | অংশগ্রহণকারী |
| cert.createdOn | Created on | তৈরির তারিখ |
| cert.completedOn | Completed on | সমাপ্তির তারিখ |
| cert.range | Range | পরিধি |
| cert.surahs | Surahs | সূরা |
| cert.reader | Reader | পাঠক |
| cert.status | Status | অবস্থা |
| cert.generatedOn | Generated on | তৈরি হয়েছে |
| cert.popupBlocked | Please allow pop-ups to view the certificate. | সনদ দেখতে অনুগ্রহ করে পপ-আপ অনুমতি দিন। |

### Promo / CTA band
| Key | English | বাংলা |
|---|---|---|
| promo.title | Need a Mobile App for Your Community or Organization? | আপনার কমিউনিটি বা প্রতিষ্ঠানের জন্য মোবাইল অ্যাপ দরকার? |
| promo.body | We build custom Islamic apps with prayer times, Quran features, donation systems, and community engagement tools. | আমরা কাস্টম ইসলামিক অ্যাপ তৈরি করি — নামাজের সময়, কুরআন ফিচার, ডোনেশন সিস্টেম ও কমিউনিটি এনগেজমেন্ট টুলসহ। |
| promo.cta | Hire Mobile App Developers | মোবাইল অ্যাপ ডেভেলপার নিয়োগ দিন |

### Errors (shown inline / toast)
| Key | English | বাংলা |
|---|---|---|
| NO_ROOM | No khatmah found with that code. | এই কোডে কোনো খতম পাওয়া যায়নি। |
| NO_NAME | Please enter your name. | অনুগ্রহ করে আপনার নাম দিন। |
| NO_ID | Please enter your ID. | অনুগ্রহ করে আপনার আইডি দিন। |
| FULL | All parts are already assigned. | সব অংশ ইতিমধ্যে বরাদ্দ হয়ে গেছে। |
| NOT_YOURS | You can only control the part assigned to you. | আপনি কেবল আপনার বরাদ্দকৃত অংশ নিয়ন্ত্রণ করতে পারবেন। |
| ALREADY_DONE | This part is already complete. | এই অংশটি ইতিমধ্যে সম্পন্ন। |
| NOT_STARTED | Start the part first. | আগে অংশটি শুরু করুন। |
| NOT_ADMIN | Admin privileges required. | অ্যাডমিন অনুমতি প্রয়োজন। |
| TAKEN | That part has already been taken. | এই অংশটি ইতিমধ্যে অন্য কেউ নিয়ে নিয়েছেন। |
| HAS_ACTIVE | Finish or pass your current part before taking another. | আরেকটি অংশ নেওয়ার আগে আপনার বর্তমান অংশটি সম্পন্ন করুন বা ছেড়ে দিন। |
| NOT_COMPLETED | The khatmah can only be exported once every part is complete. | প্রতিটি অংশ সম্পন্ন হলেই কেবল খতম রপ্তানি করা যাবে। |
| BAD_COUNT | Invalid number of participants. | অংশগ্রহণকারীর সংখ্যা সঠিক নয়। |
| NO_PART | Part not found. | অংশ পাওয়া যায়নি। |
| ALREADY_STARTED | This khatmah has already started. | এই খতম ইতিমধ্যে শুরু হয়ে গেছে। |
| NOT_LOBBY | This khatmah is no longer in the waiting room. | এই খতম আর ওয়েটিং রুমে নেই। |
| generic | Something went wrong. | কিছু একটা সমস্যা হয়েছে। |
