# Mobile Stickman 2D Game Market (iOS App Store + Google Play), as of October 2026

Notes on data sources used throughout:
- **Google Play install brackets** ("100M+" etc.) and **rating counts** come from AndroidRank (androidrank.org), which mirrors Google Play listing data. Snapshot date shown on every AndroidRank page: **2026-10-09**. That date is when AndroidRank refreshed its data, not when the app was last updated. AndroidRank also publishes its own "estimated installs" model, which is not an official figure. Its "install milestones" show the date a listing first displayed each Play bracket, so they serve as a proxy for release and growth timing when exact "Released on" dates were not retrievable. Direct Google Play detail pages could not be fetched because the fetch tool truncated them; Google Play *search* pages did load and gave developer names, star ratings and package IDs.
- **Sensor Tower** figures come from its auto-generated public blog pages titled "Top 5 Stickman Games" for each quarter, platform and country. These are **US weekly** peaks and endpoints, not global totals. Sensor Tower revenue normally means store (IAP) revenue.
- **AppGoblin** (appgoblin.info) revenue, MAU and ad-split numbers are coarse third-party estimates with bucketed floors such as "$50K+" and "$500K+".

---

## Q1. Which stickman games perform best on Google Play and iOS today, by sub-genre?

### Takeaway
By installed base, the niche is still led by **2016–2019 incumbents**: Stickman Party 234 MiniGames (500M+), Stick War: Legacy, Supreme Duelist, Stickman Warriors, Anger of Stick 5, Stickman Hook, Bowmasters, Johnny Trigger and Mr Bullet (all 100M+ on Play). In current US momentum and revenue, Supreme Duelist, Stickman Hook, Stickman Party, Stick War: Legacy and the 2024 idle RPG **Epic Stickman: Idle RPG War** make up Sensor Tower's Q4 2025 top 5. Epic Stickman is by far the top IAP earner among them.

### Cited Findings

**Sensor Tower: US top-5 "Stickman Games", Q4 2025 (iOS + Android unified, weekly figures)**
- #1 **Supreme Duelist** (Neron's Brother SARL): weekly downloads peaked at ~38K in late December; weekly revenue ~$254; ~389K active users at year end — [Sensor Tower US unified units Q4 2025](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-units-us-60326a29241bc16eb8b4f0b6)
- #2 **Stickman Hook** (MADBOX): weekly downloads peaked at ~39K (week of Dec 22); weekly revenue nearly $862; ~190K active users at quarter end — [Sensor Tower US unified units Q4 2025](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-units-us-60326a29241bc16eb8b4f0b6)
- #3 **Stickman Party: 4 Player Games** (publisher shown as "Maxim Krivokonev"): ~27K weekly downloads peak in the final week; revenue "generally low" (~$199/week in early December); nearly 112K active users by mid-December — [Sensor Tower US unified units Q4 2025](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-units-us-60326a29241bc16eb8b4f0b6)
- #4 **Stick War: Legacy** (Max Games Studios): downloads rising to ~22K/week; weekly revenue peaked at ~$17.7K in late December; ~122K active users at quarter end — [Sensor Tower US unified units Q4 2025](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-units-us-60326a29241bc16eb8b4f0b6)
- #5 **Epic Stickman: RPG Idle War** (Fansipan Limited): ~22K weekly downloads peak in late December; weekly revenue peaked at ~$68.8K in late December, "fluctuating"; ~49K active users at quarter end — [Sensor Tower US unified units Q4 2025](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-units-us-60326a29241bc16eb8b4f0b6)
- **US revenue list, Q4 2025 (unified):** Epic Stickman (~$45K/week early October, peak $68.7K late December; active users rose from 20K to ~49K) > Stick War: Legacy ($17.7K late December) > **Sand Jam!** (Voodoo, ended quarter at $4.8K) > **Eternal Line Heroes** (Nguyen Phuoc, no revenue figure given) > **TABS Pocket Edition** (Landfall Games, ended quarter at $3.2K) — [Sensor Tower US unified revenue Q4 2025](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-revenue-us-60326a29241bc16eb8b4f0b6)
- **US Android only, Q4 2025:** Supreme Duelist (~24K weekly downloads late December; ~288K active users) > **Beats Playground** (Alphabets Games; weekly downloads ~10.5K → 27.7K peak by end of December; active users 54K → 93K+) > Stickman Party 234 MiniGames (15.4K/week; active users 36.5K → 59.9K) > Epic Stickman ($36.2K/week revenue late December) > Stick War: Legacy (12.2K/week; $5.3K/week revenue peak; 75K+ active users) — [Sensor Tower US Android units Q4 2025](https://sensortower.com/blog/2025-q4-android-top-5-stickman-games-units-us-60326a29241bc16eb8b4f0b6)
- **Russia, Android, Q4 2025:** Slapstick Fighter grew from 3.7K to 8.5K weekly downloads; Stick Battle: Ragdoll Fight peaked at 4.2K in December. Taken from a search-result summary of a Sensor Tower page, not read in full — [Sensor Tower RU Android Q4 2025](https://sensortower.com/blog/2025-q4-android-top-5-stickman-games-revenue-ru-60326a29241bc16eb8b4f0b6)
- **US unified revenue, Q1 2025:** Epic Stickman weekly revenue peaked near $25.5K in January 2025. Taken from a search-result summary — [Sensor Tower US unified revenue Q1 2025](https://sensortower.com/blog/2025-q1-unified-top-5-stickman%20games-revenue-us-60326a29241bc16eb8b4f0b6)

**Google Play metrics by sub-genre (AndroidRank snapshot 2026-10-09)**

*Fighting / brawler / duel*

| Title (package) | Developer on Play | Play bracket | AR est. installs | # ratings | Avg | First → latest milestone | 60-day install growth | Source |
|---|---|---|---|---|---|---|---|---|
| Supreme Duelist (com.Neurononfire.SupremeDuelist) | Neron's Brother | 100M+ | 267.4M | 2,043,872 | 4.54 | 100K on 2019-03-22 → 100M on 2021-04-17 | 1.14% | [AndroidRank](https://www.androidrank.org/application/supreme_duelist/com.Neurononfire.SupremeDuelist) |
| Stickman Warriors | SkySoft Studio | 100M+ | 121.7M | 985,933 | 4.69 | 500K on 2020-03-16 → 100M on 2024-02-03 | 0.53% | [AndroidRank](https://www.androidrank.org/application/stickman_warriors/com.stickman.warriors.stickwarriors.dragon.shadow.fight) |
| Anger of Stick 5: Zombie (jpark.AOS5) | 코원홀딩스 (Cowon Holdings) | 100M+ | 205.0M | 1,534,152 | 4.62 | 10K on 2016-06-19 → 100M on 2019-08-01 | 0.17% | [AndroidRank](https://www.androidrank.org/application/anger_of_stick_5/jpark.AOS5) |
| Shadow Fight 2 (silhouette fighter, stickman-adjacent) | NEKKI | 100M+ | 256.9M | 16,692,619 | 4.64 | 10K on 2013-11-11 → 100M on 2016-09-10 | 0.0% | [AndroidRank](https://www.androidrank.org/application/shadow_fight_2/com.nekki.shadowfight) |
| Stickman Legends Offline Games (com.zitga.ninja.stickman.legends) | Putaleng | 50M+ | 51.5M | 468,665 | 4.47 | 100K on 2017-03-25 → 50M on 2023-11-01 | 0.05% | [AndroidRank](https://www.androidrank.org/application/stickman_legends/com.zitga.ninja.stickman.legends) |
| Stickman Dragon Fight | Azura Global | 50M+ | 53.2M | 175,714 | 4.49 | 100K on 2020-10-15 → 50M on 2025-10-02 | 0.93% | [AndroidRank](https://www.androidrank.org/application/stickman_dragon_fight/com.stickman.dragon.fight.stick.warriors.stickmanwarriors) |
| Stickman The Flash | StormHit Games | 10M+ | 21.0M | 99,303 | 4.66 | 10K on 2019-10-03 → 10M on 2022-12-18 | 1.72% | [AndroidRank](https://www.androidrank.org/application/stickman_the_flash/com.SHgames.StickmanTheFlash) |
| Stickman Clash (com.Giveupgames.PixelDuelistStickman) | GIVE UP | 1M+ | 3.07M | 9,998 | 4.51 | 10K on 2023-09-01 → 1M on 2025-07-02 | 10.09% | [AndroidRank](https://www.androidrank.org/application/stickman_clash/com.Giveupgames.PixelDuelistStickman) |

- Other fighting titles visible in Play US search (no metrics pulled): Stick Fight Supreme (KLG Studio, 3.8★), MechaStick Fighter (4.8★), Stickman Legends Go – Fight (Pen-Tool, 4.8★), Smash Strike (Snack Games, 3.5★), Stick Fight: Shadow Warrior 3 (Homecooked Games, 3.2★), Stickman Great War (InfinityFun, 4.6★), Stickman Master Premium (Unimob, 4.6★) — [Play search "stick fight multiplayer"](https://play.google.com/store/search?q=stick%20fight%20multiplayer&c=apps&hl=en_US&gl=US); [Play search "stick fight the game mobile"](https://play.google.com/store/search?q=stick%20fight%20the%20game%20mobile&c=apps&hl=en_US&gl=US); [Play search "stickman"](https://play.google.com/store/search?q=stickman&c=apps&hl=en_US&gl=US)

*Physics / ragdoll / sandbox*

| Title | Developer | Play bracket | AR est. | # ratings | Avg | Milestones | 60-day growth | Source |
|---|---|---|---|---|---|---|---|---|
| Stickman Dismounting | ViperGames | 50M+ | 50.6M | 508,031 | 4.23 | 10K on 2015-09-01 → 50M on 2023-03-01 | 0.0% | [AndroidRank](https://www.androidrank.org/application/stickman_dismounting/com.ViperGames.StickmanDismount) |
| Stickman Ragdoll Fighter: Bash | CASUAL AZUR GAMES | 50M+ | 50.9M | 47,982 | 4.69 | 1M on 2021-07-03 → **50M on 2026-06-10** | 0.75% | [AndroidRank](https://www.androidrank.org/application/stickman_ragdoll_fighter/com.stickman.fighter) |
| Slapstick Fighter – Fight Game | Cybernate Pty Ltd | 10M+ | 27.1M | 125,979 | 4.65 | 1M on 2021-08-15 → 10M on 2022-03-03 | 2.21% | [AndroidRank](https://www.androidrank.org/application/slapstick_fighter/com.Cybernate.SlapstickFighter) |
| Stick Box Ragdoll Playground | Ilia Stasik Games | 10M+ | 10.3M | 48,655 | 4.5 | 10K on 2018-05-21 → **10M on 2026-04-05** | 0.85% | [AndroidRank](https://www.androidrank.org/application/stick_box/com.stickman.killer.backflip) |
| Melon Playground (ragdoll sandbox, not strictly stickman) | TwentySeven | 10M+ | 10M | 364,535 | 4.28 | 10M on 2022-11-13 | 0% | [AndroidRank](https://www.androidrank.org/application/melon_playground/com.TwentySeven.MelonPlayground) |
| Ragdoll Hit (ragdoll.hit.stickman) | Kids Games LLC | 5M+ | 5.2M | 32,063 | 4.63 | 100K on 2024-07-02 → 1M on 2025-01-02 → **5M on 2026-09-13** | 13.4% | [AndroidRank](https://www.androidrank.org/application/ragdoll_hit/ragdoll.hit.stickman) |

- Other ragdoll titles in Play US search: Stickmen Ragdoll: The Game (Say Bia, 4.6★), Ragdoll Physics Simulator (BEAG Global, 4.4★), Stickman Ragdoll Simulator (Dreamy Game Studio, 4.2★), Stickman: Ragdoll Brawl (qqnngames), Crazy Stickman Physics (FreezeNova) — [Play search "stickman ragdoll"](https://play.google.com/store/search?q=stickman%20ragdoll&c=apps&hl=en_US&gl=US)

*Platformer / parkour / swing / runner*

| Title | Developer | Play bracket | AR est. | # ratings | Avg | Milestones | 60-day growth | Source |
|---|---|---|---|---|---|---|---|---|
| Stickman Hook (com.mindy.grap1) | Madbox | 100M+ | 104.3M | 558,323 | 4.17 | 1M on 2018-11-17 → 10M on 2018-12-16 → 50M on 2019-05-02 → 100M on 2022-05-01 | 0.08% | [AndroidRank](https://www.androidrank.org/application/stickman_hook/com.mindy.grap1) |
| Vector (silhouette parkour, stickman-adjacent) | NEKKI | 100M+ | 146.3M | 3,658,967 | 4.69 | 100K on 2013-02-11 → 100M on 2017-01-21 | 0.02% | [AndroidRank](https://www.androidrank.org/application/vector/com.nekki.vector) |

- Stickman Hook went from 1M to 10M Play installs in about one month (2018-11-17 → 2018-12-16) — [AndroidRank](https://www.androidrank.org/application/stickman_hook/com.mindy.grap1)
- Other parkour titles in Play US search: Stickman Parkour 2 (NextPuzzle, 4.1★), Swing Loops: Grapple Hook Race (SayGames, 4.6★), Ragkour (Loyalty Interactive, 4.1★), Parkour Race – FreeRun Game (Madbox, 4.3★) — [Play search "stickman hook parkour runner"](https://play.google.com/store/search?q=stickman%20hook%20parkour%20runner&c=apps&hl=en_US&gl=US)

*Archery / shooter*

| Title | Developer | Play bracket | AR est. | # ratings | Avg | Milestones | 60-day growth | Source |
|---|---|---|---|---|---|---|---|---|
| Bowmasters (original listing com.miniclip.bowmasters) | AndroidRank lists "Ndemic Creations" (see Q3 gap) | 100M+ | 100M | 6,034,210 | 4.53 | 1M on 2016-10-22 → 100M on 2019-07-22 | 0% | [AndroidRank](https://www.androidrank.org/application/bowmasters/com.miniclip.bowmasters) |
| Bowmasters: Archery Shooting (com.playgendary.bowmasters) | Playgendary Limited | 100M+ | 125.9M | 806,981 | 4.27 | 500K on 2021-11-18 → 100M on 2024-06-02 | 1.11% | [AndroidRank](https://www.androidrank.org/application/bowmasters/com.playgendary.bowmasters) |
| Johnny Trigger: Action Shooter | SayGames Ltd | 100M+ | 135.9M | 1,715,430 | 4.62 | 10M on 2020-01-01 → 50M on 2020-02-09 → 100M on 2020-10-01 | 0.12% | [AndroidRank](https://www.androidrank.org/application/johnny_trigger/com.time.trigger) |
| Mr Bullet – Spy Puzzles | Lion Studios | 100M+ | 126.2M | 746,866 | 4.53 | 5M on 2019-07-22 → 100M on 2020-12-02 | 0.02% | [AndroidRank](https://www.androidrank.org/application/mr_bullet/com.lionstudios.mrbullet) |
| The Archers 2: Stickman Game | BYV | 50M+ | 61.8M | 367,378 | 4.52 | 1M on 2016-10-22 → 50M on 2022-01-16 | 0.33% | [AndroidRank](https://www.androidrank.org/application/the_archers_2/com.byv.TheArchers2) |
| Archers Online: PvP (com.byril.stickmanarcher) | Byril | 10M+ | 14.1M | 1,008,738 | 4.42 | 50K on 2021-10-17 → 10M on 2024-02-03 | 0.5% | [AndroidRank](https://www.androidrank.org/application/archers_online/com.byril.stickmanarcher) |
| Stick Warfare: Blood Strike | Team Modernator Games | 10M+ | 13.6M | 110,912 | 4.69 | 5K on 2020-07-01 → 10M on 2023-07-02 | 1.32% | [AndroidRank](https://www.androidrank.org/application/stick_warfare/me.modernator.stickWarfareBloodStrike) |

- Bowmasters on iOS (Playgendary Limited): **4.5★ from 1.9M ratings**, ranked #20 in Action (Top Free) — [App Store](https://apps.apple.com/us/app/bowmasters/id1118431695)
- Other shooter titles in Play US search: Gun Fu: Stickman 2 (Dobsoft, 4.5★), Stick And Gun (RAON GAMES, 4.3★), Stickman Gun Shooter 3D (TnTn, 4.2★), Johnny Trigger – Sniper Game (SayGames, 4.5★), Mr Bullet 2 (Lion, 2.6★) — [Play search "stickman shooter gun sniper"](https://play.google.com/store/search?q=stickman%20shooter%20gun%20sniper&c=apps&hl=en_US&gl=US); [Play search "mr bullet johnny trigger stickman"](https://play.google.com/store/search?q=mr%20bullet%20johnny%20trigger%20stickman&c=apps&hl=en_US&gl=US)

*Strategy / RTS*

| Title | Developer | Play bracket | AR est. | # ratings | Avg | Milestones | 60-day growth | Source |
|---|---|---|---|---|---|---|---|---|
| Stick War: Legacy | Max Games Studios | 100M+ | 255.6M | 3,214,052 | 4.82 | 100K on 2016-02-21 → 10M on 2016-10-01 → 50M on 2019-01-01 → 100M on 2020-05-23 | 1.19% | [AndroidRank](https://www.androidrank.org/application/stick_war_legacy/com.maxgames.stickwarlegacy) |
| Stick War: Saga (pkg com.maxgames.stickwar3, formerly "Stick War 3") | Max Games Studios | 10M+ | 50M | 124,636 | 4.73 | 5M on 2024-03-06 → 10M on 2024-04-02 | **11.98%** | [AndroidRank](https://www.androidrank.org/application/stick_war_3/com.maxgames.stickwar3) |

- Stick War: Legacy rating distribution on Play: 2,953,351 five-star versus 77,418 one-star — [AndroidRank](https://www.androidrank.org/application/stick_war_legacy/com.maxgames.stickwarlegacy)
- Stick War: Legacy on iOS: 4.8★ from 86K ratings; #58 in Adventure top free — [App Store](https://apps.apple.com/us/app/stick-war-legacy/id1001780528)
- Stick War: Saga on iOS (UK store): 4.7★ from 1.7K ratings — [App Store UK](https://apps.apple.com/gb/app/stick-war-3/id1548764863)

*RPG / idle / RPG-lite*

| Title | Developer | Play bracket | AR est. | # ratings | Avg | Milestones | 60-day growth | Source |
|---|---|---|---|---|---|---|---|---|
| Epic Stickman: Idle RPG War | Fansipan Limited | 10M+ | 12.5M | 182,983 | 4.83 | 100K on 2024-08-02 → **10M on 2026-06-10** | **8.31%** | [AndroidRank](https://www.androidrank.org/application/epic_stickman/com.fansipan.epic.stickman.survival.rpg.idle.game) |
| Stickman Legends (also fits fighting above) | Putaleng | 50M+ | 51.5M | 468,665 | 4.47 | see above | 0.05% | [AndroidRank](https://www.androidrank.org/application/stickman_legends/com.zitga.ninja.stickman.legends) |

- Same-niche idle titles in Play US search (no metrics pulled): Stickman vs Monster: Idle RPG (Fansipan, 4.9★), Stickman Dungeon: Idle RPG War (Fansipan, 4.4★), Stickman War: Epic Idle RPG (Pusilung, 4.8★), Epic Shadow: Idle RPG War (Pusilung, 4.6★) — [Play search "stickman idle rpg"](https://play.google.com/store/search?q=stickman%20idle%20rpg&c=apps&hl=en_US&gl=US)

*Party / local multiplayer*

| Title | Developer | Play bracket | AR est. | # ratings | Avg | Milestones | 60-day growth | Source |
|---|---|---|---|---|---|---|---|---|
| Stickman Party 234 MiniGames (com.PlayMax.playergames) | PlayMax Game Studio | **500M+** | 533.4M | 2,885,880 | 4.59 | 500K on 2019-07-22 → **500M on 2026-04-03** | 1.87% | [AndroidRank](https://www.androidrank.org/application/stickman_party/com.PlayMax.playergames) |

- AppMagic (via Udonis): Stickman Party 234 MiniGames has **408M all-time downloads across stores**, ranking #83 all-time. "Stickman Party" had **84M downloads in 2025**, #33 globally that year. Article dated 2026-07-03 — [Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/most-downloaded-mobile-games). The all-store 408M conflicts with the Play-only 500M+ bracket — [AndroidRank](https://www.androidrank.org/application/stickman_party/com.PlayMax.playergames)

*Hyper-casual / crowd / puzzle stickman*

| Title | Developer | Play bracket | AR est. | # ratings | Avg | Milestones | 60-day growth | Source |
|---|---|---|---|---|---|---|---|---|
| Mob Control (crowd of stick figures) | VOODOO | 100M+ | 255.6M | 995,545 | 4.34 | 1M on 2021-07-03 → 100M on 2024-05-02 | 4.29% | [AndroidRank](https://www.androidrank.org/application/mob_control/com.vincentb.MobControl) |
| Count Masters: Stickman Games | Freeplay Inc | 100M+ | 192.2M | 748,440 | 4.59 | 100M on 2022-09-03 | 0.54% | [AndroidRank](https://www.androidrank.org/application/count_masters/freeplay.crowdrun.com) |
| Stick Hero | Ketchapp | 10M+ (AR estimate 50M) | 50M | 678,702 | 3.85 | 100K on 2014-11-13 → 10M on 2014-12-20 | 0.0% | [AndroidRank](https://www.androidrank.org/application/stick_hero/com.ketchapp.stickhero) |
| Draw 2 Save: Stickman Puzzle | WONDER GROUP | 10M+ | 22.8M | 80,286 | 4.42 | 10M on 2022-11-13 | 1.48% | [AndroidRank](https://www.androidrank.org/application/draw_2_save/com.miracle.drawtosave.an) |
| Painty Hide n Seek (3D stickman, 2026) | CDT Games Limited | 5M+ | 5.3M | 9,073 | **2.82** | **1M on 2026-08-02 → 5M on 2026-09-01** | 75.19% | [AndroidRank](https://www.androidrank.org/application/painty/com.cdt.mega.mechagame) |

- Mob Control downloads: 85M in 2025 (#29 globally) and 73M+ in 2024 (#41), per AppMagic data reported by Udonis — [Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/most-downloaded-mobile-games)
- The "draw to save stickman" puzzle micro-genre is crowded with clones: Draw Challenge: Save Stickman, Save Stickman: Brain Draw Line, Save The Stick, Stickman Rescue, Draw a Stickman: EPIC 2 (Hitcents, 3.7★) and more — [Play search "stickman puzzle draw save"](https://play.google.com/store/search?q=stickman%20puzzle%20draw%20save&c=apps&hl=en_US&gl=US)

### Inferences
- The all-time leaders are almost all 2013–2019 launches (Vector, Shadow Fight 2, Stick War: Legacy, Anger of Stick 5, Bowmasters, Supreme Duelist, Stickman Hook, Stickman Party). Most now grow 0–2% per 60 days, so they hold the chart through accumulated ratings and search ranking, not new growth.
- Current US weekly download leaders (20–40K/week) cluster in **simple 1–4 player duel or party** (Supreme Duelist, Stickman Party), **one-touch physics** (Stickman Hook) and **strategy** (Stick War). The top **IAP** earner is a different shape: idle RPG (Epic Stickman), with roughly 4x Stick War: Legacy's weekly US peak revenue.
- Search on Play is saturated with keyword-stuffed clone listings, for example package names like "com.stickman.warriors.stickwarriors.dragon.shadow.fight". Discoverability through the bare "stickman" keyword is very competitive.

### Gaps
- Exact Google Play "Released on" and "Updated on" dates could not be pulled; Play detail pages were truncated by the fetch tool. AndroidRank first-milestone dates are used as proxies.
- iOS ratings were only collected for Bowmasters, Stick War: Legacy and Stick War: Saga. Stickman Hook, Stickman Party and Epic Stickman iOS ratings were not collected.
- **Stick Fight: The Game Mobile** did not appear in Google Play US search results for "stick fight the game mobile", so its current availability and metrics are unknown.
- Djinnworks (Stickman Soccer and similar), Zego Studio and CrazyLabs stickman titles were not researched for lack of tool budget.
- No global (worldwide) revenue rankings for stickman titles were publicly available; Sensor Tower's public pages are per-country weekly.

---

## Q2. What are the key metrics for each top title (developer, ratings, release, updates, monetization, revenue estimates)?

### Takeaway
The strongest monetizers combine **IAP depth with optional ads**: Stick War's gems, chests and packs; Bowmasters' weekly subscription; Epic Stickman's 70/30 IAP/ad mix. Ad-led hyper-casual titles such as Stickman Hook (73% ads) earn mainly from very high volume (estimated 6.8M MAU). Third-party revenue estimates are coarse and sometimes conflict.

### Cited Findings

**Supreme Duelist (Neron's Brother SARL)**
- Released **July 16, 2018** — [AppGoblin](https://appgoblin.info/apps/com.Neurononfire.SupremeDuelist); [FPT Shop](https://fptshop.com.vn/tin-tuc/giai-tri/supreme-duelist-stickman-171494)
- AppGoblin estimates: **$500K+/month** revenue, **61% IAP / 39% ads**, **3.6M MAU**, 386M installs, 2M ratings at 4.51★. Store last updated 2026-09-18 — [AppGoblin](https://appgoblin.info/apps/com.Neurononfire.SupremeDuelist). AppGoblin's 386M installs conflicts with AndroidRank's estimate of 267M — [AndroidRank](https://www.androidrank.org/application/supreme_duelist/com.Neurononfire.SupremeDuelist)
- SDKs: mediation through AppLovin and AdMob; 9 ad network SDKs detected (Google, Facebook, AppLovin and Unity named); Firebase analytics — [AppGoblin](https://appgoblin.info/apps/com.Neurononfire.SupremeDuelist)
- US weekly IAP revenue was only ~$254 in late 2025 — [Sensor Tower](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-units-us-60326a29241bc16eb8b4f0b6). AppGoblin's $500K+/month must therefore come mainly from ads and non-US markets, or be an overestimate.
- The studio also publishes **Stickman Project**; version 2.9 shipped 2025-12-22 with new weapons, levels and an arcade mode — [RuStore](https://www.rustore.ru/catalog/app/com.Neronsbrother.StickmanProjectRebirth)
- iOS presence is fragmented. Several Neron's Brother SARL apps ("Supreme Duelist 2019/2021/2022") have small rating counts, for example 4.7★ from 318 reviews for the 2021 version. Copycat apps such as "Supreme Stickman Duelist" by It.Nox4090 Games also exist. Taken from a search summary of a third-party site — [AppPricingLab](https://apppricinglab.com/app/apple/6470292369)

**Stick War: Legacy (Max Games Studios; iOS seller 1004319 Alberta Ltd)**
- iOS release **March 10, 2016** (AppGoblin); iOS 4.74★ from 236K ratings (AppGoblin) and 4.8★ from 86K (US App Store page). AppGoblin estimates **$50K+/month** (iOS) and 413K MAU. iOS store last updated 2026-10-12 — [AppGoblin](https://appgoblin.info/apps/1001780528); [App Store](https://apps.apple.com/us/app/stick-war-legacy/id1001780528)
- AppGoblin's current page gives a **45% IAP / 55% ads** split. A February 2026 snapshot quoted in search results said 100% IAP and 626K MAU, so its estimates conflict over time — [AppGoblin](https://appgoblin.info/apps/1001780528)
- iOS IAP menu: 530 Gems $2.99; 2,100 Gems $11.99; 7,000 Gems $27.99; Infinity Fan Pack $12.99; 10 Golden Chests $19.99 or $24.99; **Disable Ads $2.99**; Chaos Pack $17.99; Starter Pack $17.99; Super Pack $33.99. The age rating flags "loot boxes" and "advertising" — [App Store](https://apps.apple.com/us/app/stick-war-legacy/id1001780528)
- Content and live-ops structure: Classic Campaign plus 6 bonus levels; **Missions Mode with new levels every Friday**; Endless Deads (zombie survival); Tournament against AI; Deathmatch; Forward Statue — [App Store](https://apps.apple.com/us/app/stick-war-legacy/id1001780528)
- The App Store describes it as "one of the most popular and highest rated web games of all time now comes to mobile". It is a port of a Flash/web IP — [App Store](https://apple.co/381hK6y)

**Stick War: Saga (Max Games Studios)**
- Real-time PvP strategy in 1v1 and 2v2, with direct unit control, battle decks, generals, replays and AI practice. The developer claims **no "Pay for Power"**. The campaign was still listed as "in development". The latest iOS build, 2026.5.7224, added Custom Match (private or offline vs. AI), matchmaking that works on networks blocking UDP, and a "Payment pending" status — [App Store UK](https://apps.apple.com/gb/app/stick-war-3/id1548764863)
- IAP (UK): 80 / 500 / 1,200 Gems at £0.99 / £4.99 / £9.99; 10 Wooden Chests £3.99; 10 Golden Chests £6.99; five general or hero unlocks at £4.99 each. Age rating flags loot boxes — [App Store UK](https://apps.apple.com/gb/app/stick-war-3/id1548764863)

**Bowmasters (Playgendary Limited)**
- iOS: 4.5★ from 1.9M ratings; 13+ with advertising; 603.7MB; latest version 11.6.3 (Sep 16); 60+ characters and 60+ weapons, ragdoll physics, "fatalities", online duels, limited-time events such as "Zombie Days" — [App Store](https://apps.apple.com/us/app/bowmasters/id1118431695)
- iOS IAP: **Premium Subscription $7.99/week after a 3-day trial, $19.99/month, $99.99/year** (unlocks 16 characters, removes ads, gives daily coins and gems); No ADS $3.99; Starter Packs $0.99 and $1.99; gem packs $1.99–$4.99; individual characters $1.99–$4.99 — [App Store](https://apps.apple.com/us/app/bowmasters/id1118431695)
- Play: only "Bowmasters: Archery Shooting" (com.playgendary.bowmasters, 4.3★) appears in US search — [Play search "bowmasters"](https://play.google.com/store/search?q=bowmasters&c=apps&hl=en_US&gl=US)
- No public 2025–2026 Bowmasters revenue or download estimates were found — [search results summary incl. gameworldobserver](https://gameworldobserver.com/2022/03/28/8-ball-pool-publisher-miniclip-surpassed-4-billion-downloads-across-its-portfolio-of-mobile-games)

**Stickman Hook (Madbox, France)**
- Released **November 2, 2018**. AppGoblin estimates **$500K+/month** with **27% IAP / 73% ads**, **6.8M MAU** and 144.7M+ installs. 20 ad network SDKs detected; mediation through AppLovin, Unity and AdMob; analytics through GameAnalytics, Firebase and Adjust. Store updated 2026-09-21 — [AppGoblin](https://appgoblin.info/apps/com.mindy.grap1)

**Epic Stickman: Idle RPG War (Fansipan Limited, Hong Kong)**
- Released **July 2, 2024**. AppGoblin estimates **$50K+/month**, **70% IAP / 30% ads**, 611K MAU, 12.2M+ installs, 183K ratings at 4.84★. 12 ad network SDKs; mediation through AppLovin, Unity and AdMob; AppsFlyer attribution. Store updated 2026-09-21 — [AppGoblin](https://appgoblin.info/apps/com.fansipan.epic.stickman.survival.rpg.idle.game)
- Sensor Tower's US weekly IAP peak of ~$68.8K in late December 2025 — [Sensor Tower](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-units-us-60326a29241bc16eb8b4f0b6) — far exceeds AppGoblin's "$50K+/month" floor. The two estimates conflict.

**Stickman Party 234 MiniGames (PlayMax Game Studio)**
- 500M+ on Play (bracket reached 2026-04-03); 2.89M ratings at 4.59★ — [AndroidRank](https://www.androidrank.org/application/stickman_party/com.PlayMax.playergames). US revenue "minimal" — [Sensor Tower US Android](https://sensortower.com/blog/2025-q4-android-top-5-stickman-games-units-us-60326a29241bc16eb8b4f0b6)
- The same developer also lists "2 3 4 Player Party MiniGames" (4.7★) — [Play search](https://play.google.com/store/search?q=stickman%20party%204%20player%20games&c=apps&hl=en_US&gl=US)

**Painty Hide n Seek (CDT Games Limited)**
- Ranked **#2 on Sensor Tower's worldwide *downloads-growth* chart for July 2026** (a growth chart, not the overall download chart). Described as hide-and-seek with paint-based camouflage "in a colorful stickman world", third-person 3D. Traction is concentrated in Indonesia, India, Vietnam, Brazil and Turkey — [Sensor Tower July 2026](https://sensortower.com/blog/top-10-worldwide-mobile-games-by-revenue-and-downloads-in-july-2026)
- Play rating is only 2.9★ (9.13K reviews) — [Play search](https://play.google.com/store/search?q=painty%20hide%20n%20seek&c=apps&hl=en_US&gl=US)

### Inferences
- Sensor Tower revenue on these pages appears to be IAP-only, which is its standard store-revenue methodology. That would explain why ad-heavy hits like Supreme Duelist and Stickman Hook show just hundreds of dollars a week in the US while AppGoblin estimates $500K+/month in total.
- If Epic Stickman's late-2025 US weekly peak of ~$68.8K held for a full year, it would equal roughly $3.5M in annual US IAP. This is a rough extrapolation from a peak, not a measured figure. Stick War: Legacy's ~$17.7K/week peak extrapolates to about $0.9M.
- Rating volume is a moat. Stick War: Legacy (3.2M Play ratings, 4.82★) and Supreme Duelist (2.0M) are very hard for new entrants to outrank on the generic "stickman" keyword.

### Gaps
- No public AppMagic or data.ai lifetime revenue figures were found for any stickman title.
- No public battle-pass evidence was found on any listing reviewed. Bowmasters uses a subscription instead, and the Stick War titles use gems and chests.
- Exact Play "Released on" dates for most titles are unavailable (see Q1).

---

## Q3. Which publishers dominate the stickman niche?

### Takeaway
The niche is **fragmented among mid-size and indie studios**, many from Vietnam, Korea and Eastern Europe judging by developer names, plus a few Western IP holders: Max Games Studios, Neron's Brother, PlayMax, Madbox, Nekki and Playgendary. Large hyper-casual publishers (Voodoo, SayGames, Lion Studios, Freeplay, Azur Games, Ketchapp) own one or two stickman-adjacent hits each rather than a stickman portfolio.

### Cited Findings
- **Max Games Studios** (Canada; iOS seller 1004319 Alberta Ltd): Stick War: Legacy (100M+ Play; 3.21M ratings) and Stick War: Saga (10M+) — [AndroidRank SWL](https://www.androidrank.org/application/stick_war_legacy/com.maxgames.stickwarlegacy); [AndroidRank Saga](https://www.androidrank.org/application/stick_war_3/com.maxgames.stickwar3); [App Store](https://apps.apple.com/us/app/stick-war-legacy/id1001780528); country "Canada" per [AppGoblin](https://appgoblin.info/apps/1001780528)
- **Neron's Brother (SARL)**: Supreme Duelist (100M+; 2.04M ratings) and Stickman Project — [AndroidRank](https://www.androidrank.org/application/supreme_duelist/com.Neurononfire.SupremeDuelist); [RuStore](https://www.rustore.ru/catalog/app/com.Neronsbrother.StickmanProjectRebirth)
- **PlayMax Game Studio**: Stickman Party 234 MiniGames (500M+) and 2 3 4 Player Party MiniGames — [AndroidRank](https://www.androidrank.org/application/stickman_party/com.PlayMax.playergames); [Play search](https://play.google.com/store/search?q=stickman%20party%204%20player%20games&c=apps&hl=en_US&gl=US)
- **Madbox** (France): Stickman Hook (100M+) and Parkour Race – FreeRun Game — [AndroidRank](https://www.androidrank.org/application/stickman_hook/com.mindy.grap1); [Play search](https://play.google.com/store/search?q=stickman%20hook%20parkour%20runner&c=apps&hl=en_US&gl=US)
- **Fansipan Limited** (Hong Kong): Epic Stickman, Stickman vs Monster and Stickman Dungeon (an idle-RPG reskin cluster). **Pusilung** runs a parallel cluster (Stickman War: Epic Idle RPG, Epic Shadow) — [Play search "stickman idle rpg"](https://play.google.com/store/search?q=stickman%20idle%20rpg&c=apps&hl=en_US&gl=US); [AppGoblin](https://appgoblin.info/apps/com.fansipan.epic.stickman.survival.rpg.idle.game)
- **NEKKI**: Shadow Fight 2 (100M+; 16.7M ratings) and Vector (100M+; 3.66M ratings), silhouette-style titles — [AndroidRank SF2](https://www.androidrank.org/application/shadow_fight_2/com.nekki.shadowfight); [AndroidRank Vector](https://www.androidrank.org/application/vector/com.nekki.vector)
- **Playgendary**: Bowmasters (iOS 1.9M ratings; Play 100M+) — [App Store](https://apps.apple.com/us/app/bowmasters/id1118431695); [AndroidRank](https://www.androidrank.org/application/bowmasters/com.playgendary.bowmasters)
- **Azur Games** (as "CASUAL AZUR GAMES"): Stickman Ragdoll Fighter: Bash (50M+) — [AndroidRank](https://www.androidrank.org/application/stickman_ragdoll_fighter/com.stickman.fighter)
- **Voodoo**: Mob Control (100M+) and Sand Jam!, which Sensor Tower tags as a stickman game in US revenue — [AndroidRank](https://www.androidrank.org/application/mob_control/com.vincentb.MobControl); [Sensor Tower](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-revenue-us-60326a29241bc16eb8b4f0b6)
- **SayGames**: Johnny Trigger (100M+), Swing Loops. **Lion Studios**: Mr Bullet (100M+). **Freeplay**: Count Masters (100M+). **Ketchapp**: Stick Hero — [AndroidRank JT](https://www.androidrank.org/application/johnny_trigger/com.time.trigger); [AndroidRank Mr Bullet](https://www.androidrank.org/application/mr_bullet/com.lionstudios.mrbullet); [AndroidRank Count Masters](https://www.androidrank.org/application/count_masters/freeplay.crowdrun.com); [AndroidRank Stick Hero](https://www.androidrank.org/application/stick_hero/com.ketchapp.stickhero)
- **Cowon Holdings (코원홀딩스) / J-PARK**: Anger of Stick 5 (100M+; 1.53M ratings) — [AndroidRank](https://www.androidrank.org/application/anger_of_stick_5/jpark.AOS5)
- Long-tail mid-size players: SkySoft Studio (Stickman Warriors 100M+), Azura Global (Stickman Dragon Fight 50M+), ViperGames (Stickman Dismounting 50M+), BYV (The Archers 2 50M+), Putaleng (Stickman Legends 50M+, package name still "com.zitga…"), StormHit (Stickman The Flash 10M+), Byril (Archers Online 10M+), Cybernate (Slapstick Fighter 10M+), Team Modernator (Stick Warfare 10M+), Landfall (TABS Pocket Edition, in the US stickman revenue top 5) — AndroidRank pages linked in Q1; [Sensor Tower](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-revenue-us-60326a29241bc16eb8b4f0b6)
- On ownership: no source was found showing Miniclip acquired Bowmasters or Ndemic. Wikipedia lists Miniclip as Android co-publisher of Ndemic's *Plague Inc.* only from 2012 to 2022 — [Wikipedia](https://en.wikipedia.org/wiki/Plague_Inc.). The legacy Android listing "com.miniclip.bowmasters" (6.03M ratings, 0% growth) is attributed to "Ndemic Creations" on AndroidRank — [AndroidRank](https://www.androidrank.org/application/bowmasters/com.miniclip.bowmasters)

### Inferences
- No single publisher dominates. The top revenue earners (Max Games, Fansipan) and top download titles (Neron's Brother, PlayMax, Madbox) are mostly **single-IP or small-portfolio studios**. That supports the idea that a small team with one strong, distinctive concept can reach the top tier.
- The Bowmasters history suggests the original Android listing was published under a Miniclip-associated account, possibly transferred along with the Ndemic/Plague Inc. account. Playgendary then relaunched under its own account in 2021, and that listing reached 100M+ by June 2024. This is an inference from listing data only.
- Vietnamese and Asian reskin studios (Fansipan, Pusilung, Azura Global, SkySoft, Putaleng and similar) mass-produce keyword-optimized clones, so originality and a recognizable art or feel are key differentiators.

### Gaps
- Djinnworks, Zego Studio, CrazyLabs, Hitcents (Draw a Stickman) and Dreamon portfolio metrics were not verified.
- No publisher-level stickman revenue shares are available publicly.
- The Bowmasters ownership chain (Playgendary ↔ Miniclip ↔ Ndemic listing) is unresolved. No press release was found.

---

## Q4. What notable stickman releases or breakouts happened in 2024–2026, and how are trends shifting?

### Takeaway
2024–2026 growth came from **(a) idle/RPG-lite stickman with deep IAP** (Epic Stickman), **(b) physics/ragdoll fighting and sandboxes** (Ragdoll Fighter: Bash reaching 50M+, Ragdoll Hit, Stick Box, Beats Playground), **(c) online PvP with fair monetization** (Stick War: Saga) and **(d) UA-driven 3D "stickman world" casual multiplayer** (Painty Hide n Seek). Market-wide, downloads are flat or declining, hyper-casual has turned hybrid with IAP meta, and action-genre revenue fell sharply in 2025.

### Cited Findings

**Stickman-specific breakouts and movers**
- **Epic Stickman: Idle RPG War** (Fansipan): launched July 2, 2024; 100K on 2024-08-02 → 10M+ on 2026-06-10; still +8.31% installs per 60 days; became the US #1 stickman game by IAP revenue in Q4 2025 — [AppGoblin](https://appgoblin.info/apps/com.fansipan.epic.stickman.survival.rpg.idle.game); [AndroidRank](https://www.androidrank.org/application/epic_stickman/com.fansipan.epic.stickman.survival.rpg.idle.game); [Sensor Tower](https://sensortower.com/blog/2025-q4-unified-top-5-stickman-games-revenue-us-60326a29241bc16eb8b4f0b6)
- **Stick War: Saga** (Max Games): 5M → 10M Play installs in under a month (2024-03-06 → 2024-04-02); still the fastest-growing large stickman title on AndroidRank (+11.98% per 60 days); 2026 updates added Custom Match and offline AI play — [AndroidRank](https://www.androidrank.org/application/stick_war_3/com.maxgames.stickwar3); [App Store UK](https://apps.apple.com/gb/app/stick-war-3/id1548764863)
- **Stickman Ragdoll Fighter: Bash** (Azur Games) reached 50M+ in June 2026 (1M in July 2021) — [AndroidRank](https://www.androidrank.org/application/stickman_ragdoll_fighter/com.stickman.fighter)
- **Ragdoll Hit** (Kids Games LLC): 100K in July 2024 → 5M in September 2026; +13.4% per 60 days — [AndroidRank](https://www.androidrank.org/application/ragdoll_hit/ragdoll.hit.stickman)
- **Stick Box Ragdoll Playground** reached 10M+ in April 2026 — [AndroidRank](https://www.androidrank.org/application/stick_box/com.stickman.killer.backflip)
- **Beats Playground** (Alphabets Games) was the #2 US Android stickman game by downloads in Q4 2025, growing ~2.6x in weekly downloads over the quarter — [Sensor Tower](https://sensortower.com/blog/2025-q4-android-top-5-stickman-games-units-us-60326a29241bc16eb8b4f0b6)
- **Stickman Dragon Fight** (Azura Global) reached 50M+ in October 2025 — [AndroidRank](https://www.androidrank.org/application/stickman_dragon_fight/com.stickman.dragon.fight.stick.warriors.stickmanwarriors)
- **Stickman Party 234** crossed 500M+ on Play (April 2026) and had 84M downloads in 2025 (AppMagic) — [AndroidRank](https://www.androidrank.org/application/stickman_party/com.PlayMax.playergames); [Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/most-downloaded-mobile-games)
- **Painty Hide n Seek** (CDT Games): 1M → 5M Play installs between 2026-08-02 and 2026-09-01; #2 on Sensor Tower's July 2026 worldwide downloads-growth chart; 2.82★ — [AndroidRank](https://www.androidrank.org/application/painty/com.cdt.mega.mechagame); [Sensor Tower](https://sensortower.com/blog/top-10-worldwide-mobile-games-by-revenue-and-downloads-in-july-2026)
- **Stickman Clash** (GIVE UP, 2023 launch) is a small pixel-duelist riser: 1M+ in July 2025, +10% per 60 days — [AndroidRank](https://www.androidrank.org/application/stickman_clash/com.Giveupgames.PixelDuelistStickman)
- Legacy hyper-casual stickman hits are flat at 0.0–0.12% growth per 60 days: Mr Bullet, Johnny Trigger, Stick Hero, Stickman Hook, Stickman Dismounting — AndroidRank pages linked in Q1

**Market-wide context**
- AppMagic, 2025: game revenue +0.2% YoY, downloads +4.6%. **Hyper-casual IAP revenue +80%** with downloads −3.7% and better retention (D1 +3%, D365 +32%). **Action revenue −24.5%**, the steepest of any genre. Arcade downloads +36.1%. **Strategy revenue +15.9% / downloads +18.2%**. Simulators revenue ~+15%. RPG −16.6%. Party −16.2%. 1.4M+ apps released in 2025, only 10% of which drew attention. **56% of top-100-revenue games' ad creatives were AI-generated.** Hyper-casual monetizes through fail-offers and small currency bundles (up to $8) — [AppMagic Mobile Market Landscape 2026 via GameDev Reports](https://gamedevreports.substack.com/p/appmagic-mobile-market-landscape)
- AppMagic H1 2025: hyper-casual revenue +111% YoY "due to deeper meta mechanics and stronger monetization". Taken from a search summary; the PDF was not read in full — [AppMagic Casual LiveOps Report H1 2025](https://appmagic.rocks/files/img-blog/Casual_LiveOps_Report_H1_2025.pdf)
- PocketGamer.biz (April 28, 2026; Eugene Tatonkin of Azur Games; Sensor Tower data): hyper-casual IAP was under $0.5B total in 2025 versus ~$22B casual and ~$31B midcore. Leading hyper-casual titles earned ~3x their prior-year monthly revenue by late 2025. ~70% of the top chart launched or began scaling in 2025. Mob Control's revenue was roughly flat. New hits need **D30 of 5–7.5%**, hybrid meta (win streaks, live events, collections) and about **500 levels at soft launch**. Short-form video and short drama now compete for player time — [PocketGamer.biz](https://www.pocketgamer.biz/what-happened-to-hypercasual-the-markets-evolution-over-the-past-year/)

### Inferences
- **Trend 1, hybrid-casual with RPG meta.** The best stickman revenue now comes from idle and RPG progression (Epic Stickman) layered on simple stickman combat, matching the industry-wide shift of hyper-casual into IAP-driven hybrid-casual.
- **Trend 2, physics sandbox and ragdoll.** Ragdoll and physics stickman titles are among the few showing sustained 2024–2026 install growth, likely helped by video-friendly, emergent and funny physics. This last point is an inference; no source measured it.
- **Trend 3, PvP and social.** Supreme Duelist, Stickman Party (local multiplayer) and Stick War: Saga (online PvP and replays) indicate durable demand for **duel and party play**. Stick War: Saga's "no pay for power" positioning is notable.
- **Trend 4, UA-led 3D "stickman world" casual.** Painty shows that stickman aesthetics travel to 3D and emerging markets, but its 2.8★ rating suggests a paid-UA spike, not organic love.
- Action-genre revenue fell 24.5% in 2025 while strategy and simulators grew. That favors **strategy, sandbox and idle hybrids** over pure action brawlers for monetization. This is a cautious inference: genre taxonomies differ between trackers.
- No evidence of AI-native gameplay (LLM characters and the like) in stickman titles was found. AI appears mainly in **ad creative production**, at 56% of top-grossing games' creatives.

### Gaps
- No source specifically covered "roguelite/survivor stickman" (Archero-likes) or measured that sub-genre's performance.
- Beats Playground's gameplay and monetization were not verified. Search engines returned no description, and only Sensor Tower's stickman tag ties it to the niche.
- No 2026 quarter-specific Sensor Tower stickman pages could be found; constructed URLs for Q2 2026 returned 404.
- "Hero Wars"-style fake-ad stickman creatives were not researched.

---

## Q5. What monetization patterns are standard, and is there ARPDAU/eCPM data for this genre?

### Takeaway
Standard stack: **free-to-play + rewarded video + interstitials (with a $2.99–$3.99 remove-ads IAP) + soft/hard currency (gems) + chests/loot boxes + starter/value packs + character/skin unlocks**. Higher-end titles add **weekly subscriptions** (Bowmasters) or **live-ops content drops** (Stick War's weekly Missions). No stickman-specific ARPDAU/eCPM was found. General US games benchmarks put rewarded video at ~$13–30 eCPM, interstitials at ~$10–23 and banners at ~$0.4–2, much lower in LATAM and South/Southeast Asia, where many stickman players are.

### Cited Findings

**Observed monetization in top stickman titles**
- **Bowmasters**: weekly/monthly/yearly subscription ($7.99/wk after a 3-day trial; $19.99/mo; $99.99/yr) bundling ad removal, 16 characters and daily currency; No Ads $3.99; $0.99–$1.99 starter packs; gem packs; paid characters; limited-time events — [App Store](https://apps.apple.com/us/app/bowmasters/id1118431695)
- **Stick War: Legacy**: gems ($2.99–$27.99), Golden Chests ($19.99/$24.99), packs ($12.99–$33.99), Disable Ads $2.99; loot boxes plus advertising; weekly Friday mission drops — [App Store](https://apps.apple.com/us/app/stick-war-legacy/id1001780528)
- **Stick War: Saga**: gems (£0.99–£9.99), wooden and golden chests, £4.99 general unlocks; marketed as "no Pay for Power"; loot boxes — [App Store UK](https://apps.apple.com/gb/app/stick-war-3/id1548764863)
- **Revenue mix estimates (AppGoblin):** Stickman Hook 27% IAP / 73% ads; Supreme Duelist 61/39; Epic Stickman 70/30; Stick War: Legacy iOS 45/55 — [AppGoblin Hook](https://appgoblin.info/apps/com.mindy.grap1); [AppGoblin Supreme Duelist](https://appgoblin.info/apps/com.Neurononfire.SupremeDuelist); [AppGoblin Epic Stickman](https://appgoblin.info/apps/com.fansipan.epic.stickman.survival.rpg.idle.game); [AppGoblin SWL](https://appgoblin.info/apps/1001780528)
- **Ad tech stack** is consistently AppLovin MAX and/or AdMob and Unity mediation, with 9–20 ad network SDKs, Firebase, and AppsFlyer/Adjust/GameAnalytics/Tenjin for analytics and attribution — same AppGoblin pages
- Hyper-casual-to-hybrid monetization relies on **fail-offers and small currency bundles up to $8** — [AppMagic via GameDev Reports](https://gamedevreports.substack.com/p/appmagic-mobile-market-landscape)

**eCPM benchmarks (general mobile games; not stickman-specific)**
- Tenjin × CAS, Q2 2024, games excluding kids: **rewarded US iOS $24.39 / Android $30.25**; interstitial US iOS $23.17 / Android $16.15; banner US iOS $0.99 / Android $1.18. Android had 63% of ad revenue. Network share on Android: AdMob 26%, AppLovin 17%, Mintegral 16%, Unity 13%. On iOS: AppLovin 35%, Mintegral 17%, AdMob 16% — [GameDev Reports (Tenjin Q2'24)](https://gamedevreports.substack.com/p/tenjin-ad-monetization-in-mobile-00b?open=false)
- Appodeal, Q4 2024 (100K+ apps): North America rewarded ~$13.6 iOS / ~$9.0 Android; interstitial ~$10.4 / ~$9.6; Europe rewarded ~$8.9 / ~$5.1; APAC ~$7.5 / ~$8.2; **LATAM ~$3.4 / ~$1.8**; Middle East ~$8.4 / ~$2.4. Overall monthly average rewarded ~$3 Android / ~$4 iOS — [Playio eCPM benchmarks 2026](https://blog.playio.co/mobile-game-ecpm-benchmarks-2026)
- Playwire, 2025: rewarded $15–30 in tier 1 and $8–18 globally; interstitial $5–8 tier 1; banner $0.5–1.5 tier 1. AdReact, May 2026: US/CA video interstitial $12–25. Q4 eCPMs run 20–40% above Q1. Tenjin Q2 2026: Android 55% / iOS 45% of game ad revenue — [Playio](https://blog.playio.co/mobile-game-ecpm-benchmarks-2026)
- Illustrative rewarded-ad ARPDAU: 3 rewarded views/day × $12 eCPM ≈ $0.036 — [Playio](https://blog.playio.co/mobile-game-ecpm-benchmarks-2026)

**ARPDAU benchmarks (weak, secondary)**
- Secondary blogs put hybrid-casual ARPDAU at roughly $0.10–$0.50, attributed to a 40–60% IAP share. These figures conflict and are unverified against primary data — [Playio ARPDAU blog](https://blog.playio.co/arpdau-benchmarks-mobile-games); [Juego Studio](https://www.juegostudio.com/blog/arpdau-benchmarks-by-game-genre)
- Appodeal's 2025 Mobile Casual Benchmarks (US Android, 10K+ titles, June 2024–January 2025) reportedly lists hybrid-casual sub-genres at **lifetime ARPU** of $11.08–$14.83. This is not ARPDAU, and it comes from a search summary — [App Developer Magazine](https://appdevelopermagazine.com/mobile-casual-benchmarks-report-2025/amp/)

### Inferences
- For a solo or small stickman developer, the proven floor is **rewarded video, interstitials gated after session N, and a $2.99–$3.99 remove-ads IAP**, with cosmetic character/weapon unlocks at $1.99–$4.99. The upside is a **currency + chest + starter-pack** economy (Stick War) or a **subscription that bundles no-ads with daily rewards** (Bowmasters).
- Many top stickman audiences are in emerging markets: Painty's top countries are Indonesia, India, Vietnam, Brazil and Turkey. LATAM rewarded eCPMs run ~$2–3, against ~$9–30 in the US. Ad-only stickman games therefore need very high volume, which is why ad-led Stickman Hook relies on ~6.8M MAU, and why IAP depth or US/tier-1 skew matters.
- A plausible stickman ad ARPDAU is a few cents in emerging markets. Hybrid titles with IAP meta likely land in the $0.10–$0.50 hybrid-casual range. This is unverified for stickman specifically.
- Loot boxes are disclosed on Stick War listings. Developers should account for regional loot-box rules and age-rating flags. This is an inference; no source on regulation was reviewed.

### Gaps
- No stickman-specific (or action/arcade-specific) ARPDAU, eCPM, retention or LTV benchmarks were found in public sources.
- Battle-pass adoption in stickman titles was not observed or verified.
- Energy and stamina systems were not confirmed in any listing reviewed.
- Primary Tenjin 2025/2026 and Appodeal 2025 reports were not read directly; figures come from secondary summaries.
