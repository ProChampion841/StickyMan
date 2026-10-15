# Design Success Factors of 2D Stickman Games (web + mobile), as of 2025–2026

Evidence-type tags used throughout: **[Data]** = measured numbers (store/analytics/report); **[Dev]** = developer/publisher statement or official listing copy; **[Critic]** = published review opinion; **[Expert]** = recognized designer's explanation (e.g., Sakurai); **[Secondary]** = blog/tutorial/aggregator (lower confidence); **[Fan wiki]** = community-maintained wiki (lowest confidence, dates can conflict).

Research caveat: Primary developer postmortems for most named stickman titles (Madbox/Stickman Hook, Max Games/Stick War: Legacy, Neron's Brother/Supreme Duelist, Playgendary/Bowmasters, Amazing Adam/Vex, Stickman Dismounting) could not be found in this pass. Many "analysis" pages about these games in search results are content-farm text and were excluded. Findings below lean on official store listings, Landfall's own materials, the Steam store pages, Poki's official listing, Wikipedia, GameAnalytics benchmark coverage, and Sakurai's game-feel writing.

---

## Q0. Which stickman titles have verifiable success, and at what scale? (Context for the design lessons)

### Takeaway
The best-documented successes split into two different models: (1) **cheap, one-mechanic, free-to-play/ad-driven games that win on web portals and mobile stores** (Stickman Hook, Shadow Fight 2, Bowmasters), and (2) **cheap premium games on Steam that win through social play or comedy** (Stick Fight: The Game, The Henry Stickmin Collection). Both models show a very small upfront scope and one strong hook.

### Cited Findings
- **Stick Fight: The Game**: 52,654 English Steam reviews, 94% positive ("Very Positive"). Released Sept 28, 2017 at $4.99 **[Data]** — [Steam store page](https://store.steampowered.com/app/674940/Stick_Fight_The_Game/)
- Stick Fight started as a **one-person game jam project** (the "No more Sweden" jam) by Wilhelm Nylund. Then a 4-person team built it over about 3 months (July–Sept 2017) on "late nights and weekends" **[Dev]** — [Landfall press kit](https://landfall.se/stick-fight-press-kit)
- Stick Fight later shipped on Switch (April 1, 2021) at $7.99 on consoles, and is listed on Windows, macOS, iOS, Android, PS4, Xbox One/Series, and Switch **[Dev]/[Data]** — [Landfall press kit](https://landfall.se/stick-fight-press-kit); [Wikipedia: Landfall Games](https://en.wikipedia.org/wiki/Landfall_Games)
- No official sales figure for Stick Fight was found. Release dates conflict across sources (Sept 27 vs Sept 28, 2017; consoles listed as 2021) **[Data]** — [co-op.gg](https://www.co-op.gg/pc/game/stick-fight-the-game); [Landfall press kit](https://landfall.se/stick-fight-press-kit)
- **The Henry Stickmin Collection** (PuffballsUnited, published by Innersloth, Aug 7, 2020, $14.99): 98% positive of 40,955 English Steam reviews ("Overwhelmingly Positive"). Recent 30-day reviews are still 98% positive (453), so the long tail is still active in late 2026 **[Data]** — [Steam store page](https://store.steampowered.com/app/1089980/The_Henry_Stickmin_Collection/)
- **Stickman Hook** (Madbox, released Dec 2018) on Poki: rating 4.4 from about 7.9M votes (about 6.7M likes, 1.2M dislikes). It was ranked #30 trending and was still being updated (latest update Sept 2025) **[Data]** — [Poki: Stickman Hook](https://poki.com/en/g/stickman-hook)
- An older review says Stickman Hook had 20M+ downloads across Google Play and the App Store, with "consistent Top 3 placement". This is likely outdated and is not an official figure **[Secondary]** — [Common Sense Gamer](https://commonsensegamer.com/stickman-hook-review-on-the-hook/)
- Madbox (Paris, founded 2018) reportedly passed "over 100 million downloads in less than a year". This is a company-wide figure, not Stickman Hook alone **[Secondary: investor portfolio]** — [Alven portfolio](https://alven.co/portfolio/madbox)
- **Shadow Fight 2** (Nekki/Banzai Games; soft launch Sept 2013, worldwide May 2014): Google Play shows 100M+ downloads **[Data]**. An aggregator claims 400M+ across platforms, which is unverified — [Google Play listing (via search)](https://play.google.com/store/apps/details?id=com.nekki.shadowfight&hl=en_US); [Grokipedia (aggregator, low confidence)](https://grokipedia.com/page/Shadow_Fight_2); dates from [Wikipedia](https://en.wikipedia.org/wiki/Shadow_Fight_2)
- **Bowmasters**: Sensor Tower estimated more than $4M gross on the App Store and Google Play in Q3 2018. That is about 25% of Playgendary's $16.5M total for the quarter **[Data: estimate]** — [Sensor Tower](https://sensortower.com/blog/playgendary-revenue-q3-2018)
- Bowmasters' publisher/ownership is **contradictory** across sources. Some list Playgendary as developer; APK/download sites list Miniclip.com as publisher, with an Aug 2016 launch. No acquisition announcement was found **[Data: conflicting]** — [Sensor Tower](https://sensortower.com/blog/playgendary-revenue-q3-2018); [tamindir listing](https://www.tamindir.com/indir/bowmasters/)
- **Alan Becker** (Animator vs. Animation) YouTube channel: passed 30M subscribers on Feb 10, 2025 and 32M on Nov 11, 2025. Fan wiki lists 34M on Aug 29, 2026 and 9B total views on Jan 2, 2026 **[Fan wiki]** — [AvA Wiki (Fandom)](https://animatorvsanimation.fandom.com/wiki/Alan_Becker_(YouTube_channel)); [AvA Wiki (Miraheze)](https://animatorvsanimation.miraheze.org/wiki/Alan_Becker_(YouTube_channel)). The companion channel "Animators VS Games" is listed at about 1.44M subscribers **[Fan wiki]** — [alanbecker.wiki](https://alanbecker.wiki/)
- **Supreme Duelist Stickman**: no reliable official install count was found. Uptodown (a third-party store) shows 1.2M downloads. A mod-APK site claims 100M+, which is not credible as an official figure **[Data: third-party only]** — [Uptodown](https://supreme-duelist.en.uptodown.com/android); [an1 (mod site, unreliable)](https://an1.com/7291-supreme-duelist-stickman-mod.html)
- On Poki, the **Fighting** category is described as the portal's largest fighting category, and stickman titles cluster there (Stickman Battle, Stick Fighter). Poki also runs dedicated "Stickman" and "Henry Stickmin" category pages **[Dev: portal copy]** — [Poki Fighting](https://poki.com/en/fighting); [Poki Stickman](https://poki.com/en/stickman); [Poki Henry Stickmin](https://poki.com/en/henry-stickmin)

### Inferences
- Steam review count is a rough proxy for sales. A common industry heuristic, not verified here, is roughly 20–60 sales per review. By that heuristic, Stick Fight (~52.6k reviews) and Henry Stickmin Collection (~41k reviews) are each plausibly in the low millions of units. Treat this as an order-of-magnitude estimate only.
- All of the successes were made by small teams or a solo creator (jam origin for Stick Fight, PuffballsUnited for Henry Stickmin). That makes them realistic models for a solo/small 2026 developer.
- Stickman Hook still gets updates and trending placement on Poki about 7 years after launch, and Henry Stickmin still gets new reviews 6 years after launch. Both point to **evergreen discoverability** for stickman games on web portals and Steam.

### Gaps
- No official install counts were retrieved for Stick War: Legacy (Max Games Studios), Supreme Duelist Stickman, Stickman Hook (Google Play package `com.mindy.grap1`), or Bowmasters. Google Play pages were truncated and AppBrain returned 403. The figures commonly quoted online (e.g., "100M+") could not be verified.
- No data was found for Vex (Amazing Adam) or Stickman Dismounting.
- No Sensor Tower/AppMagic data on the "stickman" keyword category as a whole was found.

---

## Q1. Game feel / juice: how do top stickman games make impacts feel satisfying?

### Takeaway
"Juice" is well-documented as layered, redundant feedback (flash, shake, hitstop, particles, sound, floating text) on top of a responsive input loop. Hitstop that scales with damage and screen shake are the highest-value techniques for combat. For stickman games specifically, the *physics reaction itself* (ragdoll flailing, destruction) is the juice: Landfall says physics/destruction "look inherently satisfying."

### Cited Findings
- **"Juice It or Lose It"** (Martin "Grapefrukt" Jonasson & Petri Purho, 2012) demonstrates turning a plain Breakout prototype into a satisfying one by adding flash, shake, floating text, sound, and particles. The original venue is **inconsistently reported**: one source says the Nordic Game Jam (May 2012), another says GDC **[Secondary]** — [RPG Playground research post](https://rpgplayground.com/research-making-a-juicy-game/); [eastondev blog (2026)](https://eastondev.com/blog/en/posts/dev/20260521-game-feedback-feel/)
- **"The Art of Screenshake"** (Jan Willem Nijman, Vlambeer, 2013) frames feel as many small details. Its techniques include **screen shake, player knockback, and hit-pause** **[Secondary: university lecture notes]** — [GxD 10 Game Feel (Uni Bayreuth PDF)](https://medienwissenschaft.uni-bayreuth.de/wp-content/uploads/GxD-10-Game-Feel.pdf)
- **Steve Swink's "Game Feel"** frames feel around the real-time input→perception loop between player and game **[Secondary]** — [GxD 10 Game Feel](https://medienwissenschaft.uni-bayreuth.de/wp-content/uploads/GxD-10-Game-Feel.pdf); [RPG Playground](https://rpgplayground.com/research-making-a-juicy-game/)
- **Counterpoint:** Folmer Kelly gave a GDC Europe talk pushing back on "Juice It or Lose It," arguing that heavy polish can cost immersion **[Secondary]** — [RPG Playground](https://rpgplayground.com/research-making-a-juicy-game/)
- **Hitstop (Sakurai, Famitsu col. 490):** "both parties momentarily freeze, emphasizing the power of impact." It is strongest in 2D fighters (Street Fighter, Guilty Gear) and sparse in 3D fighters and crowd brawlers (Tekken, Dynasty Warriors), where frequent freezes would slow play **[Expert]** — [Source Gaming translation](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/)
- Sakurai's specific rules **[Expert]** — [Source Gaming](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/):
  - Hitstop scales with damage ("the more damage an attack inflicts, the longer the hitstop period"), with a **maximum cap**.
  - Each attack can have its own modifier: Marth's sword tip gets more and the blade edge less; projectiles get less; electric attacks get more.
  - During the freeze the **victim shakes**: side-to-side on the ground, up-and-down in the air. Shake intensity scales with camera distance and decays over the freeze. Hurtboxes stay fixed so hit detection is unaffected.
  - In multiplayer, long shared freezes let a **third player** exploit the frozen pair, so Smash keeps hitstop shorter. This is directly relevant to 4-player stickman brawlers.
- Hitstop also aids **readability** ("gives the eyes a few frames to register" the hit) and enables mechanics such as SF2's 2-in-1 cancel **[Secondary: expert blog]** — [critpoints.net](https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/)
- Rough frame benchmarks cited for fighters: light ~9 frames, medium ~11, heavy ~13 of freeze. Street Fighter 6 data likewise gives heavier attacks longer hitstop **[Secondary]** — [Sonic Hurricane](https://sonichurricane.com/?p=1043); [SF6 Game Data (SRK wiki)](https://srk.shib.live/w/Street_Fighter_6/Game_Data)
- Tutorial guidance **[Secondary]**: a 50–100 ms freeze on heavy hits reads as "real force." Freezing only the attacker and target, rather than the whole game, is often preferable. The sources below give these points without per-source attribution — [Wayline Game Feel lesson](https://www.wayline.io/learn/game-feel/1); [Bugnet hitstop guide](https://bugnet.io/blog/how-to-fix-hitstop-or-freeze-frame-feeling-off)
- **Landfall (Stick Fight/TABS creators):** "physics and destruction look inherently satisfying on screen." This is their explanation for why their games spread **[Dev]** — [Game Developer: How TABS creator Landfall got discovery right](https://www.gamedeveloper.com/game-platforms/how-i-tabs-i-creator-landfall-got-discovery-right-)
- **Stickman Hook's feel comes from speed and momentum.** Bounce pads set up the next swing, most runs end in under 5 s, and releasing "even half a second late" drops forward speed **[Dev: Poki listing copy]** — [Poki: Stickman Hook](https://poki.com/en/g/stickman-hook)
- **Bowmasters** is described as pairing a cute look with "Mortal Kombat-styled gore" (exaggerated blood and dismemberment on kill) **[Critic]** — [GamerBraves](https://gamerbraves.com/?p=588). An Italian review criticized the duel system's lack of strategy and depth, which suggests the spectacle carries the game more than tactical depth does **[Critic]** — [Multiplayer.it](https://multiplayer.it/recensioni/173559-bowmasters-angry-bows.html)
- **Shadow Fight 2**'s animations were praised ("semi-realistic and physics-based" silhouette animation, flagged "failed verification" on Wikipedia) even when controls were criticized **[Critic]** — [Wikipedia: Shadow Fight 2](https://en.wikipedia.org/wiki/Shadow_Fight_2)
- **Henry Stickmin**'s remaster redid backgrounds and **sound effects** across the older games, and "Breaking the Bank" was reanimated from scratch. The developer chose to invest the remaster budget in animation and audio polish **[Dev]** — [Steam store page](https://store.steampowered.com/app/1089980/The_Henry_Stickmin_Collection/)

### Inferences
- **Recommended juice stack** for a stickman combat game, synthesized from the sources above:
  - Damage-scaled hitstop on attacker and victim only (~50–150 ms, capped).
  - Victim shake during the freeze.
  - Short directional screen shake, larger on kills and smaller on chip hits.
  - Ragdoll knockback that carries the hit's direction.
  - A burst of contrasting-color particles or ink splatter.
  - A layered impact sound with a low "thump" and a high "crack," pitch-randomized.
  - Optional slow-motion on the final hit or round end.
- **Keep hitstop shorter in 4-player modes** to avoid Sakurai's third-party exploit problem, and longer in 1v1.
- Stick figures carry almost no surface detail, so feedback has to come from **motion, timing, camera, color accents, and audio**. That is a reason to budget heavily for animation and SFX, as the Henry Stickmin remaster did.
- Watch out for over-juicing (the Folmer Kelly critique). Readability matters more in fast multi-character fights. Consider an accessibility toggle for screen shake and flashes.

### Gaps
- No primary developer statements were found on juice choices in Supreme Duelist Stickman, Stick War: Legacy, Vex, Stickman Dismounting, or Bowmasters. The Bowmasters fatality/slow-mo design rationale is undocumented in sources found.
- No A/B data was found linking specific juice features to retention in stickman games.

---

## Q2. Controls: what works on touch vs. keyboard/gamepad?

### Takeaway
The biggest mobile/web stickman hits use **one input or one gesture** (Stickman Hook: hold/release; Bowmasters: tap-and-swipe-back to aim). Deeper fighters (Shadow Fight 2) use a left virtual joystick plus two attack buttons and get combo depth from direction+button combinations, but they draw "imprecise controls" criticism. Desktop/console stickman brawlers (Stick Fight) lean on controllers and shared-screen local play.

### Cited Findings
- **Stickman Hook controls**: on desktop, "hold the mouse button or the spacebar to attach to a hook, and let go to launch". On mobile, tap to attach and lift to release. That gives the same one-bit input on every platform **[Dev: Poki listing]** — [Poki: Stickman Hook](https://poki.com/en/g/stickman-hook)
- A review says Stickman Hook can be learned "within seconds without needing long tutorials" and has "absolutely no story" **[Critic]** — [Common Sense Gamer](https://commonsensegamer.com/stickman-hook-review-on-the-hook/)
- **Bowmasters**: players tap and swipe backward to launch their weapon in turn-based duels (drag-to-aim, slingshot-style) **[Critic/Secondary]** — [tamindir](https://www.tamindir.com/indir/bowmasters/); [Multiplayer.it](https://multiplayer.it/recensioni/173559-bowmasters-angry-bows.html)
- **Shadow Fight 2**: a virtual joystick on the left and punch/kick buttons on the right. Combining directions with the two buttons is reported to give 50+ moves **[Secondary: aggregator]** — [Grokipedia: Shadow Fight 2](https://grokipedia.com/page/Shadow_Fight_2). Gamezebo criticized "imprecise controls" (3.5/5) **[Critic]** — [Wikipedia: Shadow Fight 2](https://en.wikipedia.org/wiki/Shadow_Fight_2). Nekki later added control customization in an update **[Dev: changelog, via search]** — [Google Play listing](https://play.google.com/store/apps/details?id=com.nekki.shadowfight&hl=en_US)
- **Stick Fight**: Steam tags include "Controller," "4 Player Local," and "Split Screen"; 2–4 players, local and online **[Data]** — [Steam store page](https://store.steampowered.com/app/674940/Stick_Fight_The_Game/)
- **Henry Stickmin** uses point-and-click choice selection with no dexterity requirement. The collection supports "Remote Play on Phone and Tablet" **[Dev]** — [Steam store page](https://store.steampowered.com/app/1089980/The_Henry_Stickmin_Collection/)
- Hitstop's freeze frames also widen input windows for cancels and combos (SF2's 2-in-1 cancel exists because of hitstop). This is a design lever for making combos easier on touch **[Secondary: expert blog]** — [critpoints.net](https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/)

### Inferences
- **The more successful the mass-market stickman title, the fewer simultaneous inputs it needs.** One-bit timing (Hook), single drag (Bowmasters), and discrete choice (Henry Stickmin) all travel across mouse, touch, and gamepad without redesign. That matters for a 2026 game targeting both web portals and mobile.
- **One-tap accessibility comes from:**
  - Zero onboarding, because the verb is obvious within seconds.
  - Very short attempts (Hook runs under 5 s), so failure is cheap.
  - Skill expressed through timing, not input complexity.
  - Physics-based outcomes that vary even with the same input.
- **For mobile fighting/combat**, follow Shadow Fight 2's left-stick + 2–3 buttons with directional modifiers, but mitigate the "imprecise controls" risk:
  - Generous input buffers and hitstop-extended cancel windows.
  - Customizable button layout from launch (Nekki added this only later).
  - Optional auto-combo or "smart attack."
- **For web keyboard**, support single-key play (space/mouse) wherever possible. Portal players skew toward instant, low-commitment sessions.

### Gaps
- No primary source was found on Supreme Duelist Stickman's control scheme (commonly described as two-button/joystick ragdoll duels) or its design rationale.
- No usability data (e.g., tutorial completion, FTUE drop-off) comparing joystick vs. tap schemes in stickman games was found.

---

## Q3. Physics & animation: procedural, keyframed, or active ragdoll?

### Takeaway
The best-documented stickman physics success, Stick Fight, uses **procedural animation on Landfall's TABS physics system** (active ragdoll). It grew from a jam prototype built by reusing that system, and its developers credit physics comedy as their main marketing asset. Keyframed animation (Henry Stickmin, Alan Becker) wins on authored comedic timing instead. Silhouette fighters (Shadow Fight 2) blend physics-informed animation with readable poses.

### Cited Findings
- Stick Fight's combat is "physics-based, with procedural animations from Totally Accurate Battle Simulator's system" **[Dev: Steam listing]** — [Steam store page](https://store.steampowered.com/app/674940/Stick_Fight_The_Game/)
- Nylund "used the TABS physics system to create couch multiplayer fighting". Stick Fight reused existing tech, which is part of why a jam project became a commercial game in about 3 months **[Dev]** — [Landfall press kit](https://landfall.se/stick-fight-press-kit)
- Landfall's lineage is a run of physics-comedy games: Clustertruck ("chaotic physics-based truckformer," commercial success) and TABS (ragdoll physics). TABS is reported at over 120,000 Steam reviews, ~97% positive (marked citation-needed) **[Secondary: Wikipedia]** — [Wikipedia: Landfall Games](https://en.wikipedia.org/wiki/Landfall_Games); Game Developer earlier reported 81,000 reviews, 98% positive [Game Developer](https://www.gamedeveloper.com/game-platforms/how-i-tabs-i-creator-landfall-got-discovery-right-)
- Landfall on why physics games spread: the fun is "watching characters and the world interact," so a short clip conveys the game. "When seeing a gif or a video of the game, you instantly get a taste of what playing the game will be like." **[Dev]** — [Game Developer](https://www.gamedeveloper.com/game-platforms/how-i-tabs-i-creator-landfall-got-discovery-right-)
- Landfall says TABS does well on YouTube because the audience feels like they take part, unlike games where enjoyment depends mainly on the player's own decisions **[Dev]** — [Game Developer](https://www.gamedeveloper.com/game-platforms/how-i-tabs-i-creator-landfall-got-discovery-right-)
- Shadow Fight 2 characters are silhouettes with "semi-realistic and physics-based" animations (Wikipedia flags this "failed verification") **[Secondary]** — [Wikipedia: Shadow Fight 2](https://en.wikipedia.org/wiki/Shadow_Fight_2)
- Ragdoll stickman remains a live web subgenre in 2025–26. Poki's stickman list includes **Ragdoll Hit** and **Ragdoll Drop** **[Data: portal listing]** — [Poki Stickman](https://poki.com/en/stickman)
- Stickman Hook uses pendulum/momentum physics with bounce pads. Precise timing changes the outcome continuously, so identical-looking inputs give different results **[Dev: Poki copy]** — [Poki: Stickman Hook](https://poki.com/en/g/stickman-hook)

### Inferences
- **Choose the animation approach by your core fantasy:**
  - *Active ragdoll/procedural*: emergent slapstick, high replayability, viral clips, cheap to author content for. The downsides are lower precision and harder netcode/determinism.
  - *Keyframed*: precise competitive readability and authored comedic timing (Henry Stickmin). Cost scales with content.
  - *Hybrid*: keyframed attacks/poses blended into ragdoll on hit or death. This is likely the best fit for a solo dev who wants both readable combat and funny deaths (inferred from Shadow Fight 2's "physics-based" silhouettes and Bowmasters' gore kills).
- Stick figures have very few limbs and joints to simulate, so a stick figure is the cheapest possible body for active ragdoll. That is a structural advantage for small teams. (Inference, consistent with the jam-to-launch Stick Fight timeline.)
- Emergent humor needs **chaotic but legible** physics. Stick Fight's "100 highly interactive levels" (Steam) suggest that level hazards and destructible props multiply physics comedy beyond the character rig itself.
- Online multiplayer with physics-heavy characters is harder (sync/determinism). Stick Fight offers both local and online, but no primary source on its netcode approach was found.

### Gaps
- No Landfall postmortem or GDC talk on Stick Fight's specific active-ragdoll implementation (balance controllers, muscle strength, weapon physics) was found. A "Unconventional Ways of Using Physics in Game Development" conference listing appeared but wasn't examined ([thisaarhus.com](https://thisaarhus.com/speaker/unconventional-ways-of-using-physics-in-game-development/)).
- No sources were gathered on Stickman Dismounting or Gang Beasts design (the Gang Beasts comparison is the requester's framing, not verified here).
- No sources were found on Supreme Duelist's ragdoll implementation.

---

## Q4. Progression and retention loops: what correlates with strong D1/D7/D30?

### Takeaway
No public genre-specific (stickman) retention data exists. Benchmarks are cross-genre: median mobile D1 ~22% (2025), D7 under 4%, D30 under 1%, with the top 1% at 64–68% D1 / 13–15% D30, and retention falling year-over-year. Observable stickman meta-structures are lightweight: Stickman Hook uses hundreds of short levels, a second mode unlocked at level 30, and 23 skins (progression- and ad-gated plus weekly limited-time). Shadow Fight 2 uses an RPG equipment ladder, chapter bosses, an energy gate, and achievements. Stick Fight has essentially no progression and retains through friends and UGC.

### Cited Findings
- **GameAnalytics 2026 benchmarks (2025 data; 16,262 mobile games ≥1,000 MAU)** **[Data]** — [GameDev Reports summary of GameAnalytics 2026](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game); [GameAnalytics report page](https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks):
  - D7: median just under 4%; top 25% 6–7%; top 10% 11–12%; top 1% >25%.
  - D1: top 25% just above 30%; top 10% ~40%; top 1% 64–68%.
  - D30: median 0.69–0.79%; top 25% ~1.6–1.8%; top 1% 13–15%.
  - Session length: top 25% ~5.2 min; top 10% ~8 min. Sessions/day: top 25% 5.3–5.7.
  - D1 retention declined in 2025 vs 2024. **No genre breakdown** is provided.
- Earlier GameAnalytics coverage (2025 report): median D1 ~22%; top-quartile D1 25–27% on Android and 31–33% on iOS; 11,600 games, 9 regions, 16 genres; retention "declined again" vs 2023 **[Data]** — [GameDev Reports: GameAnalytics 2025](https://gamedevreports.substack.com/p/gameanalytics-mobile-gaming-benchmarks)
- One explainer notes the GameAnalytics report uses D28, not D30, and is behind a lead-capture form, so D30 citations should be treated cautiously **[Secondary]** — [GameGrowthAdvisor](https://gamegrowthadvisor.com/blog/2026-03-17-mobile-game-kpis-benchmarks-2026/)
- Explainer coverage says **arcade games lead in short-term (D1) retention but struggle with long-term retention**. The genre data traces to Sensor Tower/AppsFlyer, with some figures dating from Q3 2022 **[Secondary]** — [AppAgent](https://appagent.com/blog/mobile-game-retention-benchmarks/); [GameGrowthAdvisor](https://gamegrowthadvisor.com/blog/2026-03-17-mobile-game-retention-strategies-2026/)
- **PC (3,582 games)**: D1 top 25% 15–16%, top 1% 50–60%; D30 top 10% ~2.5%, top 1% ~10%; median session 18 min **[Data]** — [GameDev Reports](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game)
- **Stickman Hook meta** **[Dev: Poki listing]** — [Poki: Stickman Hook](https://poki.com/en/g/stickman-hook):
  - "Hundreds of levels" in Classic mode. A second mode (Grapple Hook) unlocks after completing 30 Classic levels.
  - 23 skins: 9 classic (8 unlocked by level progression), 14 unlocked by **watching ads** (Burger, Cactus, Dragon, Lemon, Robot…), plus **weekly limited-time skins** rotating on the home screen.
  - Auto-save when signed in on Poki.
- **Shadow Fight 2 meta** **[Secondary: Wikipedia]** — [Wikipedia: Shadow Fight 2](https://en.wikipedia.org/wiki/Shadow_Fight_2):
  - Best-of-three matches; RPG upgrades to armor, weapons, skills, and magic.
  - 7 provinces, each with a boss.
  - **Energy gate**: 5 fights before refill, refilled by waiting, paying, or a limited number of ads.
  - Achievements are "a core part."
  - Co-op multiplayer boss fights in the "Underworld."
- **Monetization backlash risk:** CNET praised Shadow Fight 2 (8.3/10) but flagged its "in-your-face freemium model" **[Critic]** — [Wikipedia: Shadow Fight 2](https://en.wikipedia.org/wiki/Shadow_Fight_2). A paid **Special Edition** (2017) awards gems more often and adds an exclusive storyline, which serves players who reject F2P friction **[Dev]** — same source
- **Bowmasters**: about 30 characters, each with a unique weapon. The collectible roster is the progression hook **[Secondary]** — [tamindir](https://www.tamindir.com/indir/bowmasters/)
- **Stick Fight** has "NO SINGLE PLAYER MODE." There is no campaign; longevity comes from 100 maps, a level editor, and 100,000+ community-made levels **[Dev: Steam listing]** — [Steam store page](https://store.steampowered.com/app/674940/Stick_Fight_The_Game/)
- **Henry Stickmin** retains through completionism. Achievements, multiple canon endings, and fails are framed as intended fun. Fan coverage says a map in the Collection makes collecting every FAIL ending easier **[Dev]/[Fan]** — [Steam store page](https://store.steampowered.com/app/1089980/The_Henry_Stickmin_Collection/); fan coverage: [TV Tropes](https://www.tvtropes.org/pmwiki/pmwiki.php/HenryStickminSeries/TropesAToF), [Know Your Meme](https://knowyourmeme.com/memes/subcultures/the-henry-stickmin-collection) (which page made the map claim is unverified)

### Inferences
- **Three proven loop archetypes for a stickman game:**
  1. *Level ladder + cosmetic collection*. This is Hook: short levels, mode unlock at a milestone, progression-unlocked skins, rewarded-ad skins, and weekly rotating limited skins as a return trigger. It is the best fit for web portals and hyper/hybrid-casual mobile. Expect strong D1 and weak D30 (the arcade pattern above).
  2. *RPG gear ladder + bosses + energy*. This is Shadow Fight 2. It has the deepest monetization but carries a freemium-backlash risk. A paid edition is a hedge.
  3. *No progression; social + UGC*. This is Stick Fight. It works on premium PC/console, where retention is measured by friend-group sessions and community levels rather than D30.
- Weekly limited-time cosmetics are the lowest-cost "come back" trigger documented here (Hook). Daily rewards and streaks are standard in the market but were not documented for these specific titles in sources found.
- Given median D7 under 4%, a solo dev should set **realistic targets**: top-quartile benchmarks are ~30% D1 and ~6–7% D7. Hitting top-10% (~40% D1 / 11–12% D7) would be exceptional.
- A **campaign + endless/arena split** is a reasonable hybrid. A finite campaign gives D1–D7 structure, and an endless or roguelite mode plus PvP or leaderboards gives long-tail play. This is inferred from the archetypes above, not from stickman-specific data.

### Gaps
- No D1/D7/D30 figures exist publicly for any named stickman title. GameAnalytics publishes no genre-level table.
- Stick War: Legacy's progression (campaign, "Endless Deads," tournament, skins/upgrades) could not be verified from primary sources because the Google Play fetch failed.
- No Deconstructor of Fun / GameRefinery / Mobilegamer.biz analysis of a stickman title was found in this pass.
- No data was found on roguelite stickman titles (e.g., 2024–2026 releases) or PvP ladders in Supreme Duelist.

---

## Q5. Art style: why minimalism works and how standouts differentiate

### Takeaway
Primary evidence on *why* stick figures work is thin. Developers lean on nostalgia ("iconic stick figures from the early internet") and on the high motion-readability of silhouettes against colored backgrounds. Standouts differentiate through a single strong visual system: silhouette-on-vivid-background (Shadow Fight), cartoon-cute plus gore (Bowmasters), or remastered hand-animated comedy with redone backgrounds (Henry Stickmin).

### Cited Findings
- Stick Fight is pitched around "iconic stick figures from the early internet," a nostalgia and internet-culture positioning **[Dev]** — [Landfall press kit](https://landfall.se/stick-fight-press-kit); [Steam store page](https://store.steampowered.com/app/674940/Stick_Fight_The_Game/)
- Shadow Fight series: characters are dark silhouettes against vibrant backgrounds, a series signature, with Nekki noted for "fluid animations" **[Secondary]** — [Grokipedia: Shadow Fight](https://grokipedia.com/page/Shadow_Fight); [Wikipedia: Shadow Fight](https://en.wikipedia.org/wiki/Shadow_Fight)
- Shadow Fight 3 (Nov 2017) **moved to 3D characters** and dropped the 2D silhouette, adding character switching and a "Shadow Form" mechanic **[Data]** — [Wikipedia: Shadow Fight 2](https://en.wikipedia.org/wiki/Shadow_Fight_2). (Separately, the Shadow Fight 2 Switch port scored 55/100 on Metacritic, which suggests the mobile-first design did not carry over well to console reviewers **[Data]** — same source.)
- Bowmasters reviews highlight the contrast of a cute look with "Mortal Kombat-styled gore" **[Critic]** — [GamerBraves](https://gamerbraves.com/?p=588)
- Henry Stickmin Collection remastered four older games with **redone backgrounds and SFX**. Breaking the Bank was "reanimated from scratch." The new finale is "about 3x bigger than any previous game" **[Dev]** — [Steam store page](https://store.steampowered.com/app/1089980/The_Henry_Stickmin_Collection/)
- Stickman Hook's skins (Burger, Cactus, Dragon, Lemon, Robot…) show that a minimal stick body is a **blank canvas for cheap, varied cosmetics** **[Dev: Poki listing]** — [Poki: Stickman Hook](https://poki.com/en/g/stickman-hook)
- Shadow Fight 2's soundtrack is credited to Lind Erebros (citation needed on Wikipedia). Stick Fight carries the user-applied Steam tag "Great Soundtrack," and Karl Flodin (sound/music on Clustertruck) is on the Stick Fight team **[Secondary/Data]** — [Wikipedia: Shadow Fight 2](https://en.wikipedia.org/wiki/Shadow_Fight_2); [Steam store page](https://store.steampowered.com/app/674940/Stick_Fight_The_Game/); [Wikipedia: Landfall Games](https://en.wikipedia.org/wiki/Landfall_Games); [Landfall press kit](https://landfall.se/stick-fight-press-kit)

### Inferences
- **Why stick figures work** (design reasoning, not sourced data):
  - Readability: high-contrast thin lines read as pure pose and motion, so actions are legible at small mobile sizes and in busy 4-player scenes.
  - Animation cost: few parts, so procedural, ragdoll, and keyframed animation are all cheap.
  - Player projection: a generic body invites self-insertion and accepts any skin.
  - Cultural familiarity: Flash-era Newgrounds and Alan Becker give instant recognition.
- **Differentiation in 2026 should come from one strong system, not detail.** Options include:
  - Silhouette lighting (Shadow Fight).
  - Saturated **color accents** on weapons, effects, and team identity against monochrome bodies (supports readability in multiplayer).
  - Ink/sketch or notebook paper (leans into the "animator's doodle" meta of Animator vs. Animation).
  - Neon on dark (contrast for VFX/juice).
- Gore and comedic violence (Bowmasters) boost spectacle and shareability, but they affect age ratings and portal/ad-network suitability. Offer a toggle such as ink or paint splatter instead of blood.

### Gaps
- No primary developer statement explaining the choice of stick figures (cost, readability, projection) was found for any named title.
- No sources were found on Vex's visual or level design, or on "notebook/ink" stickman games as a differentiator.
- Audio design rationale (beyond credits and tags) is undocumented for all named titles.

---

## Q6. Narrative and humor: why Henry Stickmin and Animator vs. Animation resonate

### Takeaway
Henry Stickmin makes **failure itself the content**: wrong choices lead to authored, joke-laden "fail" scenes that the store copy says are "part of the fun." Combined with multiple canon endings, this produces completionism and highly clippable moments. Alan Becker's Animator vs. Animation shows the scale of the fourth-wall "creator vs. creation" stickman premise: ~34M subscribers and ~9B+ views per fan wikis.

### Cited Findings
- Henry Stickmin: each step offers choices (e.g., use a Teleporter or call in Charles). Correct ones advance; incorrect ones lead to a fail, and "failing is intended as part of the fun." It is a "6-game epic" with "multiple entirely canon, extremely different endings" **[Dev: Steam listing]** — [Steam store page](https://store.steampowered.com/app/1089980/The_Henry_Stickmin_Collection/)
- The series is best known for its "many, many hilarious fails." Fans describe the fails as central to its identity **[Fan]** — [TV Tropes](https://www.tvtropes.org/pmwiki/pmwiki.php/HenryStickminSeries/TropesAToF); [Tropedia](https://tropedia.fandom.com/wiki/Henry_Stickmin)
- In the original *Breaking the Bank*, failing just prompted a different choice. The remaster **added a proper fail screen with a message** to match later games. The developer retrofitted the fail-as-reward pattern into the earliest entry **[Fan wiki]** — [Newgrounds Wiki: Breaking the Bank](https://newgrounds.wiki.gg/wiki/Breaking_the_Bank)
- Henry Stickmin memes such as the "Distraction Dance" spread widely as standalone memes **[Fan]** — [meme.com](https://meme.com/memes/henry-stickmin); [Know Your Meme](https://knowyourmeme.com/memes/subcultures/the-henry-stickmin-collection)
- Henry Stickmin originated as Newgrounds Flash games and was published on Steam by **Innersloth**, the Among Us studio **[Dev]** — [Steam store page](https://store.steampowered.com/app/1089980/The_Henry_Stickmin_Collection/)
- Alan Becker channel scale (30M subs Feb 2025 → ~34M Aug 2026; 9B views Jan 2026) **[Fan wiki; dates conflict between wikis]** — [AvA Wiki (Fandom)](https://animatorvsanimation.fandom.com/wiki/Alan_Becker_(YouTube_channel)); [AvA Wiki (Miraheze)](https://animatorvsanimation.miraheze.org/wiki/Alan_Becker_(YouTube_channel)). A family-focused review site also covers the channel **[Secondary]** — [Plugged In](https://www.pluggedin.com/youtube-reviews/alan-becker/)

### Inferences
- **Fail-as-content** is a highly transferable pattern for a 2026 stickman game:
  - Make deaths and fails distinct, funny, and collectible (a fail gallery or map, achievements).
  - Every failure then becomes a reward and a potential short-form clip.
  - This fits ragdoll deaths too: a "death replay / dismount score" turns failure into spectacle.
- **Meta/fourth-wall premises** (the animator's cursor or pen as antagonist, the stickman escaping the canvas or the UI) carry proven audience pull from Animator vs. Animation. They also give a solo dev a cheap narrative frame that justifies minimalist art: the character *is* a drawing.
- Branching structure with "multiple canon endings" adds replay value without systemic complexity. Content cost scales with authored animation, so scope carefully. The Collection's finale was ~3× earlier games, implying heavy authored-animation workload.

### Gaps
- No interview with PuffballsUnited on fail-screen design rationale was found.
- The commonly cited total of "347 fail screens" appeared in fan material but could not be verified.
- No information was retrieved on official Alan Becker/Animator vs. Animation **games** (licensed mobile/web titles), their performance, or merch reach.

---

## Q7. Social and virality: local multiplayer, online, UGC, clip-friendly moments

### Takeaway
The strongest documented social model is Landfall's: **couch/online 2–4 player chaos + level editor/UGC + physics that sells itself in GIFs/clips + free/April-Fools launches to seed player bases**. Stick Fight shipped no single-player mode and still has 100,000+ community levels. Web portals (Poki) supply ongoing organic discovery for one-tap stickman games.

### Cited Findings
- Stick Fight: 2–4 players, local and online. The level editor has "over 100,000 community-made levels." Tags include "Funny," "4 Player Local," "Split Screen." There is "NO SINGLE PLAYER MODE" **[Dev/Data: Steam]** — [Steam store page](https://store.steampowered.com/app/674940/Stick_Fight_The_Game/)
- Landfall on marketing: "When seeing a gif or a video of the game, you instantly get a taste of what playing the game will be like." **[Dev]** — [Game Developer](https://www.gamedeveloper.com/game-platforms/how-i-tabs-i-creator-landfall-got-discovery-right-)
- Landfall on UGC: "Seeing how much creativity people put into the battles they came up with was definitely something that moved us." A free early alpha let players share battles, which pushed Landfall toward UGC (TABS has a mod.io hub) **[Dev]** — [Game Developer](https://www.gamedeveloper.com/game-platforms/how-i-tabs-i-creator-landfall-got-discovery-right-)
- **Free-launch tactics for multiplayer**: Totally Accurate Battlegrounds was free for 100 hours (~3M downloads), and Knightfall free for one day (~1M downloads, then $5.99). Landfall says this avoids launching multiplayer without enough players for matchmaking **[Dev/Data]** — [Game Developer](https://www.gamedeveloper.com/game-platforms/how-i-tabs-i-creator-landfall-got-discovery-right-); [Wikipedia: Landfall Games](https://en.wikipedia.org/wiki/Landfall_Games)
- **April Fools' as a ritual**: it started with Supertruck, a free SUPERHOT spoof marketing Clustertruck. April 1 became a fixed date when fans expect "we will do something." Stick Fight's Switch release was April 1, 2021 **[Dev]** — [Game Developer](https://www.gamedeveloper.com/game-platforms/how-i-tabs-i-creator-landfall-got-discovery-right-); [Landfall press kit](https://landfall.se/stick-fight-press-kit)
- **Landfall's 2024–2025 social-chaos follow-ups** show the model still working at scale **[Secondary: Wikipedia]** — [Wikipedia: Landfall Games](https://en.wikipedia.org/wiki/Landfall_Games):
  - *Content Warning* (2024): 6.6M Steam users claimed it free at launch; ~2.2M sales after two months.
  - *Peak* (2025, co-op climbing jam game with Aggro Crab): over 100k concurrent players in under a week.
- Shadow Fight 2's Switch version added an **exclusive local two-player mode**, and the mobile game has co-op Underworld boss fights **[Secondary: Wikipedia]** — [Wikipedia: Shadow Fight 2](https://en.wikipedia.org/wiki/Shadow_Fight_2)
- Web portal reach: Stickman Hook has about 7.9M votes on Poki and is a Poki exclusive listing (per Poki copy). Poki maintains stickman, fighting, and Henry Stickmin category hubs, giving the genre persistent organic traffic **[Data/Dev]** — [Poki: Stickman Hook](https://poki.com/en/g/stickman-hook); [Poki Stickman](https://poki.com/en/stickman); [Poki Fighting](https://poki.com/en/fighting)
- Henry Stickmin moments became standalone memes (e.g., the "Distraction Dance") **[Fan]** — [meme.com](https://meme.com/memes/henry-stickmin); [Know Your Meme](https://knowyourmeme.com/memes/subcultures/the-henry-stickmin-collection)

### Inferences
- **Design for the clip.** These features make TikTok/Shorts-ready moments likely:
  - Physics outcomes that are funny to *watch*, not just to play (Landfall's spectator point).
  - Distinct authored fails (Henry Stickmin).
  - Spectacle kills (Bowmasters).
  - Built-in instant replay or last-5-seconds capture.
  - A 9:16-friendly camera option.
  - Shareable seeds or level codes.
- **Local multiplayer** (same keyboard, split controller, or same-phone 2-player) is a cheap, high-value social hook, especially on web portals and Switch-like contexts. Online multiplayer is the costlier, riskier path for a solo dev. Landfall's free-weekend trick addresses the empty-lobby problem if you go online.
- **A level editor/UGC** turned a 100-map game into effectively unlimited content (100k+ levels). For a solo dev, it may be the highest-leverage feature for long-tail retention on PC.
- A recurring **"event date" ritual** (Landfall's April Fools) is a low-cost community-building tactic.

### Gaps
- No data was found on replay-sharing features or TikTok/YouTube Shorts performance of specific stickman titles (view counts, hashtag volumes).
- No source confirmed Supreme Duelist Stickman's local 2-player or online modes from the developer (Google Play fetch failed).
- No information on Bowmasters' online PvP/friends modes was retrieved.

---

## Q8. Synthesis: concrete, evidence-backed principles for a solo/small developer building in 2026

### Takeaway
Ship one immediately understandable verb with physics-driven or authored-comedy outcomes. Wrap it in heavy but readable juice. Use a cosmetics-first light meta with weekly rotation for web/mobile, or a friends-plus-UGC loop for PC. Design every failure and every hit to be watchable and clippable. The documented hits all came from tiny scopes (a jam prototype in about 3 months; one-tap Hook) and grew through portals, Steam, and video virality.

### Cited Findings
- Tiny-scope origin: Stick Fight went from a solo jam project to a 4-person, ~3-month build reusing existing physics tech **[Dev]** — [Landfall press kit](https://landfall.se/stick-fight-press-kit)
- One-input universality: Stickman Hook uses hold/release on mouse, spacebar, and touch **[Dev]** — [Poki: Stickman Hook](https://poki.com/en/g/stickman-hook)
- Light meta: 23 skins with progression, ad, and weekly limited-time unlocks, plus a mode unlock at level 30 **[Dev]** — [Poki: Stickman Hook](https://poki.com/en/g/stickman-hook)
- Spectator-friendly physics drives marketing **[Dev]** — [Game Developer](https://www.gamedeveloper.com/game-platforms/how-i-tabs-i-creator-landfall-got-discovery-right-)
- Fail-as-content: "failing is intended as part of the fun" **[Dev]** — [Steam: Henry Stickmin Collection](https://store.steampowered.com/app/1089980/The_Henry_Stickmin_Collection/)
- Impact rules: damage-scaled, capped hitstop with victim shake, kept shorter in multi-player **[Expert]** — [Sakurai via Source Gaming](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/)
- Retention reality: median mobile D7 under 4%; top-25% D1 ~30% **[Data]** — [GameDev Reports / GameAnalytics 2026](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game)
- Monetization caution: an "in-your-face freemium model" was criticized even in a positive review. A paid edition offered an alternative **[Critic/Dev]** — [Wikipedia: Shadow Fight 2](https://en.wikipedia.org/wiki/Shadow_Fight_2)

### Inferences
- **Principle checklist (all inferred from the cited evidence above):**
  1. *Five-second rule.* The core verb must be understood without a tutorial, and an attempt must resolve in seconds (Hook).
  2. *Juice budget ≥ art budget.* Put polish into hitstop, shake, ragdoll knockback, particles, and layered SFX rather than character detail. Add toggles for shake and flash.
  3. *Hybrid animation.* Use keyframed or procedural intent for readable attacks and ragdoll on hit or death for comedy and replay variety.
  4. *Failure is a reward.* Make funny, distinct deaths and fails, collect them, and make them replayable and shareable.
  5. *One visual signature.* Monochrome stick bodies, saturated accents for weapons, VFX, and teams, plus one distinctive frame (silhouette, ink/notebook, or neon). Consider an "it's a drawing" fourth-wall premise in the Animator vs. Animation vein.
  6. *Pick one loop archetype per platform.* Web/mobile: level ladder, cosmetic collection, weekly limited skins, and rewarded-ad unlocks. PC/console: local/online 2–4 player, level editor, and community levels.
  7. *Social from day one.* Same-device 2-player is cheap. Add online only with a plan for liquidity, such as free weekends.
  8. *Clip tooling.* Instant replay, a vertical-friendly camera, and shareable level codes.
  9. *Benchmark honestly.* Target ≥30% D1 and ≥6–7% D7 (top quartile) on mobile. Expect arcade-style games to have strong D1 and weak D30, and plan events or cosmetics to flatten that curve.

### Gaps
- No controlled evidence (A/B tests, cohort data) links any single principle above to retention or revenue in stickman games specifically. The principles are triangulated from successful titles' observable designs and general game-feel expertise.
- Market saturation and competitive density for "stickman" on app stores and Poki in 2025–2026 (number of titles, CPI, keyword competition) were not researched here.
