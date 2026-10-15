# Tech Stacks and Production Approaches for a 2D Stickman Game (Web + Mobile, Solo/Small Team, 2025–2026)

Research date: 2026-10-15. Version and pricing facts reflect sources found on that date. Many 2026 engine-release details come from a secondary news aggregator (app.cinevva.com), and these are flagged inline. Vendor-authored benchmarks are also flagged.

---

## 1. Engines/frameworks: Phaser 3/4, PixiJS v8, Godot 4.x, Unity 6, Defold, Cocos, Construct 3, GameMaker. Compared on web build size and load speed, mobile, physics, learning curve, cost, and known stickman/physics games

### Takeaway
For a web-portal-first stickman game, the lightest and cheapest options are Phaser 4 (JS, MIT, stable since April 2026) and Defold (free, ~1 MB empty HTML5 build, one-click Poki publishing, native mobile). Godot 4.x with GDScript is a solid middle ground: about 5–7 MB empty web build, free, and a good editor, but C# still cannot export to web as of Godot 4.7. Unity 6 is the strongest pick for mobile-first, ad-SDK-heavy work. It is free under $200k revenue and has no Runtime Fee, but its web builds are the heaviest, and CrazyGames disables Unity games on iOS by default.

### Cited Findings

**Phaser (3 → 4)**
- Phaser 4 launched in April 2026, and Phaser calls it the biggest release in the framework's history. Phaser 4 is a ground-up rebuild of the WebGL renderer ("RenderNode" architecture, each node does one job) that keeps the familiar API. It also restores lost WebGL contexts automatically — [Phaser news, Apr 2026](https://phaser.io/news/2026/04/phaser-4-renderer-faster-cleaner-and-built-for-modern-games); [Phaser v4.0.0 GitHub discussion](https://github.com/phaserjs/phaser/discussions/7274); [GameDev.net](https://gamedev.net/news/2759-phaser-4-released/)
- Phaser's own comparison (13 May 2026) says "there's no reason to start on Phaser 3" for new projects. It expects sprites, text, groups, cameras, input, scenes, audio and tweens to be "likely unchanged". Custom WebGL pipelines, some FX (Bloom, Shine), BitmapMask, `setTintFill()`, and the Mesh and Plane objects need updating or were removed. "Most games using the standard Phaser API are looking at a few hours of work." Arcade and Matter physics are "likely unchanged". The article gives no FPS benchmarks and no bundle-size figures — [Phaser 3 vs Phaser 4](https://phaser.io/news/2026/05/phaser-3-vs-phaser-4)
- Phaser 4 introduces PCT atlas files, "typically 90-95% smaller" than JSON atlases (helps mobile load), plus SpriteGPULayer, which renders many objects in one draw call — [Phaser 3 vs Phaser 4](https://phaser.io/news/2026/05/phaser-3-vs-phaser-4)
- Phaser 4.2.x builds were on npm/jsDelivr by mid-2026 — [jsDelivr phaser@4.2.0 docs](https://cdn.jsdelivr.net/npm/phaser@4.2.0/docs/Phaser%204%20Rendering%20Concepts/Phaser%204%20Rendering%20Concepts.md)
- Phaser Studio released **Phaser Box2D** (Dec 2024) as an MIT-licensed JavaScript port of the Box2D v3.0 C API. It is roughly 65–70 KB, comes with 50+ examples, and keeps C API names, so the official Box2D docs apply. Phaser claims it is the only v3 port for the web (a vendor claim) — [Phaser announcement](https://phaser.io/news/2024/12/announcing-phaser-box2d); [Phaser Box2D page](https://editor.phaser.io/box2d)
- Phaser has an official tutorial for wrapping a game for iOS and Android with Capacitor (requires Node, Android Studio, and Xcode on a Mac) — [Phaser tutorial](https://phaser.io/tutorials/bring-your-phaser-game-to-ios-and-android-with-capacitor)

**PixiJS v8**
- PixiJS v8 (launched 2024) builds WebGPU into its core and automatically chooses WebGL or WebGPU. Initialization is async (`await app.init()`) — [PixiJS v8 launch](https://pixijs.com/blog/pixi-v8-launches)
- v8.20.0 (around Aug 2026) is a WebGPU-focused point release that adds WGSL shader overrides, render bundles, and a Safari WGSL fallback. It contains a silent breaking change (`isUniform` → `accessMode`) — [GameDev.net](https://gamedev.net/news/5221-pixijs-v8200-released/)
- Note: PixiJS is a renderer only. It has no built-in physics, scenes, audio or input, so you pair it with Matter, Planck, Rapier or Box2D yourself (inference from its scope; see the v8 launch post above).

**Godot 4.x**
- **Web export:** single-threaded export has existed since 4.3 and is "now the preferred default" for web. It is less performant than multithreaded export but "more compatible overall with stores like itch.io or Web publishers like Poki or CrazyGames". Multithreaded export needs COOP/COEP cross-origin isolation headers — [Godot 4.5 docs: Exporting for the Web](https://docs.godotengine.org/de/4.5/tutorials/export/exporting_for_web.html)
- **C# on web is still unsupported.** The Godot 4.7 docs still say C# projects "currently cannot be exported to the web" and recommend Godot 3 for C# web — [Godot 4.7 docs](https://docs.godotengine.org/en/4.7/tutorials/export/exporting_for_web.html). Forum users expected C# web to arrive no sooner than 4.8 (speculation) — [Godot forum thread](https://forum.godotengine.org/t/is-there-an-update-on-exporting-c-projects-to-web/128821). A GodotCon May 2025 prototype had no committed release date as of Sep 2026 — [Cinevva Godot vs Unity guide](https://app.cinevva.com/guides/godot-vs-unity-web-games)
- **Release timeline (secondary source):** 4.5 shipped 18 Sep 2025, reportedly with WASM SIMD on by default — [Cinevva](https://app.cinevva.com/news/2025-09-18-godot-4-5-release). 4.6 shipped in early 2026 with Jolt as the default *3D* physics engine. The article says "January 27" but its URL is dated 2026-02-27, so the date is unconfirmed — [Cinevva](https://app.cinevva.com/news/2026-02-27-godot-4-6-released). 4.7 shipped around 19 Jun 2026 and reportedly adds wasm64 web export (removing the 4 GB memory limit). Web still uses WebGL 2 with the Compatibility renderer and has no WebGPU — [Cinevva](https://app.cinevva.com/de/news/2026-06-19-godot-4-7-released). Not cross-checked against godotengine.org release notes.
- **Empty web build size:** "~5 MB Brotli, ~9 MB gzipped" (approximate, method not described) — [Cinevva guide, updated Sep 2026](https://app.cinevva.com/guides/godot-vs-unity-web-games). Defold's vendor chart lists Godot at 6.68 MB — [Defold Gamescom 2025](https://www.defold.com/gamescom2025/). The Godot docs say a custom export template with unused features disabled "can reduce the size of the WebAssembly payload significantly" — [Godot docs](https://docs.godotengine.org/de/4.5/tutorials/export/exporting_for_web.html)
- Cinevva reports that single-threaded export "also fixed the long-standing iOS and Safari playback problems" — [Cinevva guide](https://app.cinevva.com/guides/godot-vs-unity-web-games). Older Godot docs (4.2) warned about Safari WebGL 2 issues — [Godot 4.2 docs](https://docs.godotengine.org/en/4.2/tutorials/export/exporting_for_web.html)
- **2D physics:** in a vendor benchmark (Godot Rapier maintainers, Aug 2026), built-in Godot Physics 2D (v4.7) was 4.8–12.6x slower than Rapier2D or Box2D in every scene, and in the joint-grid scene it was "unstable, never finishes" (>60 s) — [godot.rapier.rs v0.35](https://godot.rapier.rs/blog/v0-35-0)

**Unity 6**
- **Licensing:** the Runtime Fee was cancelled on 12 Sep 2024, and the Personal tier ceiling was raised to $200k revenue and funding — [Unity blog](https://unity.com/en/blog/unity-is-canceling-the-runtime-fee). The 2026 pricing page shows Personal free up to $200k, Pro at $2,310/seat/yr prepaid (or $210/mo) above $200k, and Enterprise required above $25M. Havok Physics is no longer included in Pro from 6.3 — [Unity pricing updates](https://unity.com/pricing-updates)
- **Web:** Unity 6.1 (Apr 2025) added a WebGPU backend — [Unity web runtime blog](https://unity.com/blog/engine-platform/web-runtime-updates-enhance-browser-experience). As of Unity 6.6 (Sep 2026), WebGPU is "no longer experimental" but not the default; WebGL 2 remains the default (secondary) — [Cinevva](https://app.cinevva.com/news/2026-09-01-unity-6-6-webgpu-production). Unity supports mobile web from Unity 6 onward — [Cinevva guide](https://app.cinevva.com/guides/godot-vs-unity-web-games)
- **Empty web build (Brotli):** about 7.7 MB for 2D built-in pipeline and 10.7 MB for a 3D URP template, with roughly 2 MB possible with aggressive stripping — [Cinevva guide](https://app.cinevva.com/guides/godot-vs-unity-web-games). Defold's vendor chart lists Unity at 11.73 MB — [Defold Gamescom 2025](https://www.defold.com/gamescom2025/). Unity's docs: smaller build means less to download during initialization and faster loads — [Unity 6.1 web optimization](https://docs.unity3d.com/6000.1/Documentation/Manual/web-optimization.html)
- **Portal friction:** CrazyGames says "Unity games are disabled on iOS by default due to memory crashes" and forces DPR 1 on iOS and low-memory Android — [CrazyGames technical requirements](https://docs.crazygames.com/requirements/technical). Poki requires Unity games to follow its separate optimization guidelines — [Poki requirements](https://developers.poki.com/guide/requirements-quality)
- **2D physics:** Unity 6.3 LTS added a new low-level 2D physics API (`UnityEngine.LowLevelPhysics2D`) built on Box2D v3. It is separate from Rigidbody2D/Collider2D (the two do not interact). Unity cites multithreaded performance, "enhanced determinism", and job-friendly struct APIs. The forum calls it beta while the release notes present it as shipped — [Unity manual](https://docs.unity3d.com/Manual/2d-physics-api/2d-physics-api-introduction.html); [Unity discussions](https://discussions.unity.com/t/low-level-2d-physics-in-unity-6-3/1683247); [AlternativeTo news, Dec 2025](https://alternativeto.net/news/2025/12/unity-6-3-lts-arrives-with-hybrid-2d-3d-scenes-box2d-v3-and-cross-platform-toolkit)
- **Known stickman game:** *Stick Fight: The Game* (Landfall, 2017) was built on Unity 2017 — [Dexerto game DB](https://www.dexerto.com/gaming/db/game/stick-fight-the-game/)

**Defold**
- Vendor chart (Gamescom 2025): an empty HTML5 Wasm build is 0.83 MB for Defold vs 6.68 MB for Godot and 11.73 MB for Unity. Defold says Defold titles on Poki generated €3M and 600M+ plays in 2024 — [Defold Gamescom 2025](https://www.defold.com/gamescom2025/)
- A community measurement (Defold 1.4.6) found an empty bundle of about 808–975 KB compressed. The uncompressed folder is 6–7 MB because both asm.js and wasm are included — [Defold forum](https://forum.defold.com/t/html5-bundle-size/73431)
- Orenji Spark rebuilt *Jane's Fashion Studio* from Unity to Defold for Poki. The team reports about 65% smaller builds, faster loading, and better engagement — [GameDev.net](https://gamedev.net/news/2581-from-unity-to-defold-how-orenji-spark-rebuilt-janes-fashion-studio-for-poki/)
- Defold's June 2026 web best-practices post sets a "total build under 20MB" target — [GameDev.net / Defold](https://gamedev.net/news/3701-best-practices-when-building-for-the-web/)
- In 2025 Defold added one-click Poki publishing from the editor and an official Poki SDK template, plus an experimental WebGPU backend. Box2D v3 is opt-in via app manifest (not yet default). Extensions include Photon Realtime, Spine and Rive. 2026 plans include "engine size optimisations and further modularization" — [Defold 2025 Retrospective](https://defold.com/2026/01/02/Defold-2025-Retrospective/)
- Defold 1.10.0 (Apr 2025) shipped Box2D v3 as optional; it is "more or less a full rewrite", so behaviour can differ — [Defold 1.10.0 blog](https://defold.com/2025/04/14/Defold-1-10-0/); [Defold forum](https://forum.defold.com/t/defold-1-10-0-has-been-released/80264). Defold 1.13.0 (Jun 2026) expanded the Box2D scripting API with joint support for both v2 and v3 — [Defold 1.13.0](https://defold.com/2026/06/22/Defold-1-13-0/)

**Cocos**
- Cocos 4 was announced in January 2026 as fully open source under MIT. The engine and editor are split: "COCOS" now means the engine, and the editor successor "PinK" adds built-in AI agents. It is described as an evolution of Cocos Creator 3.x with forward compatibility, and mini-game platform support is "rolling out gradually" — [Kyodo News PR Wire](https://kyodonewsprwire.jp/release/202601051953); [TechNode Global](https://technode.global/prnasia/cocos-4-is-here-fully-open-source/)
- Poki maintains a Cocos SDK page — [sdk.poki.com/cocos](https://sdk.poki.com/cocos)

**Construct 3**
- The official store lists Personal at $129.99/yr or $15.99/mo. Aggregator prices conflict and should be ignored — [Construct store](https://www.construct.net/make-games/buy-construct-3)
- Its Physics behaviour is Box2D compiled to WebAssembly (about 10% faster than asm.js), with a fixed 50 MB memory cap — [Construct blog](https://www.construct.net/en/blogs/construct-official-blog-1/behavior-improvements-910)

**GameMaker**
- The free tier covers non-commercial use and includes Web, Desktop and Mobile exports. Professional is a one-time $99.99 for commercial sales (HTML5, Android, iOS included). Consoles need the Enterprise subscription — [GameMaker get](https://gamemaker.io/get); [GameMaker licence help, Apr 2026](https://gamemaker.io/help/articles/how-to-upgrade-your-gamemaker-licence)

### Inferences
- **Web size ranking (empty builds, compressed):** Phaser 4 / PixiJS (JS-only, typically ≪1–2 MB including physics) < Defold (~0.8–1 MB) < Godot (~5–7 MB) ≈ stripped Unity (2–8 MB) < default Unity (8–12 MB). Every option fits CrazyGames' 20 MB mobile-homepage limit when empty, but only the JS frameworks and Defold leave lots of room for assets. That matters because Poki stresses "small file size" and a 10-second load ceiling.
- **Learning curve for a solo dev:** Phaser or Pixi (if you already know JS/TS) ≈ Construct/GameMaker (visual/GML) < Godot (GDScript, very approachable) < Defold (Lua, message passing, unusual architecture) < Unity (large surface area, heavy editor). Cocos 4's editor/engine split makes it a moving target in 2026, so I would avoid it unless targeting Chinese mini-game platforms.
- **Cost:** all of Phaser, PixiJS, Godot, Defold and Cocos 4 cost $0. Unity Personal is $0 below $200k. GameMaker is $99.99 one-time to sell. Construct is about $130/yr.
- **Physics fit:** Godot's built-in 2D physics looks weak for joint-heavy ragdolls (vendor benchmark), so a Godot ragdoll game should plan to use the Rapier or Box2D v3 GDExtension.
- **Godot + C#** is a trap for a web-first project. Use GDScript if the web matters.

### Gaps
- No independent, like-for-like benchmark (same device, same scene) of mobile-browser frame rates across Phaser 4, Pixi v8, Godot, Unity and Defold was found. Load-time figures in seconds were not found for any engine.
- Phaser 4 bundle size (minified/gzipped) was not stated in sources found.
- Specific engines behind top mobile stickman hits (*Stickman Hook*, *Supreme Duelist Stickman*, *Stick War: Legacy*) could not be confirmed. No source named their engines.
- Godot 4.6/4.7 details come from a secondary aggregator, not godotengine.org release notes.
- Cocos 4 web/HTML5 export status in 2026 was not found.

---

## 2. Physics: Box2D v3, Matter.js, Planck.js, Rapier (WASM), Godot built-in vs Rapier plugin, Unity 2D. Ragdolls, joints, many bodies on mobile web, and determinism for multiplayer/rollback

### Takeaway
Box2D v3 (C, with Phaser's JS port and Unity 6.3/Defold integrations) and Rapier2D (Rust→WASM, with a separate cross-platform-deterministic npm build) are the two serious options in 2026. Both are much faster than Godot's built-in 2D physics and better suited to ragdolls than Matter.js. For networked ragdoll fighters, Rapier's `-deterministic` package and Box2D 3.1's claimed "cross-platform determinism" are the only paths here toward rollback-safe physics, and both still need your own testing.

### Cited Findings
- **Box2D 3.0 (Aug 2024):** hybrid speculative + time-of-impact continuous collision, with bullet support. Joints include revolute, prismatic, distance, mouse, weld and wheel — [Box2D 3.0 release post](https://box2d.org/posts/2024/08/releasing-box2d-3.0)
- **Box2D 3.1 (Apr 2025):** release notes list "Cross-platform determinism" plus a new filter joint (disable collision between specific bodies, useful for ragdoll limb self-collision). Continuous collision is about 2x faster, GJK 20% faster, and SIMD was reworked (SSE2 default, Neon for Apple Silicon). Contact events are disabled by default — [Box2D 3.1.0 release notes](https://box2d.org/documentation/md_release__notes__v310.html); [Box2D 3.1 blog](https://box2d.org/posts/2025/04/box2d-3.1). The blog post does not explain how determinism was tested — [Box2D 3.1 blog](https://box2d.org/posts/2025/04/box2d-3.1)
- **Box2D v3 on the web:** Phaser Box2D is an MIT JS port of the v3.0 API (~65–70 KB) — [Phaser](https://phaser.io/news/2024/12/announcing-phaser-box2d). Unity 6.3 has a low-level 2D API on Box2D v3 — [Unity manual](https://docs.unity3d.com/Manual/2d-physics-api/2d-physics-api-introduction.html). Defold has Box2D v3 opt-in — [Defold retrospective](https://defold.com/2026/01/02/Defold-2025-Retrospective/). Construct uses Box2D (older, WASM) — [Construct blog](https://www.construct.net/en/blogs/construct-official-blog-1/behavior-improvements-910)
- **Rapier JS:** the standard `@dimforge/rapier2d` is only locally deterministic (same machine). `@dimforge/rapier2d-deterministic` is a slower build intended for cross-platform deterministic execution. Since 0.17.1, the default packages are built without enhanced determinism. `-compat` builds embed the WASM for bundler compatibility — [@dimforge/rapier2d on Yarn](https://classic.yarnpkg.com/en/package/@dimforge/rapier2d); [rapier3d-deterministic README](https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-deterministic@0.19.3/README.md)
- Rapier's enhanced determinism covers platforms that strictly implement IEEE 754-2008, including WASM, and can't be combined with `simd8` — [Rapier docs](https://rapier.rs/docs/user_guides/rust/getting_started/)
- **Rapier vs Box2D vs Godot (vendor benchmark, Aug 2026, Godot Rapier maintainers)**, 2D times in ms:

  | Scene | Rapier2D v0.35 | Box2D v3.1 | Godot Physics 2D (4.7) |
  |---|---|---|---|
  | Pyramid | 20.0 | 21.3 (unstable) | 147 |
  | Smash | 11.9 | 11.6 | 55.1 |
  | Mixed pile | 9.3 | 6.7 | 71.1 |
  | Query storm | 6.2 | 4.6 | 57.2 |
  | Joint grid | 10.2 | 4.9 (unstable) | never finishes |

  "Rapier is the only engine that keeps every scene stable." Box2D "explodes" in the joint grid (via the godot-box2d-v3 integration). Godot Rapier now always enables a parallel SIMD solver plus cross-platform determinism — [godot.rapier.rs v0.35](https://godot.rapier.rs/blog/v0-35-0). It claims 1:1 compatibility with Godot Physics nodes including joints — [godot-rapier-physics GitHub](https://github.com/appsinacup/godot-rapier-physics)
- Older Godot Rapier asset builds came in "Faster (SIMD)" and "Slower (Enhanced Determinism)" variants — [Godot Asset Library](https://Godotengine.org/asset-library/asset/2815)
- **Matter.js:** pure-JS, 2D only. A third-party guide says it slows at around 500+ moving bodies (unverified, not ragdoll-specific). **Planck.js:** a JS rewrite of Box2D (v2-era API) with the full Box2D joint set, recommended for ragdolls. **Rapier:** generally rated fastest of the three. These are low-quality comparison sources with no real ragdoll benchmarks — [learnwithhasan comparison](https://learnwithhasan.com/js-libraries/compare/matter-js-vs-planck-js/); [Rapier vs Matter](https://learnwithhasan.com/js-libraries/compare/rapier-vs-matter-js/)
- Construct (Box2D) on mobile: an old C2-era anecdote reports 30–55 FPS at about 85 bodies on Android. A claim that mobile uses fewer solver iterations, which breaks revolute limits, comes from an unverified SEO-style page — [Construct forum](https://construct.net/en/users/68718/rafaelmatos/forum-posts/page-53); [bugnet.io (low reliability)](https://bugnet.io/blog/fix-construct3-physics-joint-revolute-limits-ignored-mobile)
- **Rollback + physics in practice:** NetplayJS docs say its `LockstepWrapper` suits "games that can't be easily rewound like physics engines", while `RollbackWrapper` needs rewindable state — [NetplayJS wrappers README](https://cdn.jsdelivr.net/npm/netplayjs@0.4.1/src/wrappers/README.md). A Bevy demo combines GGRS rollback with deterministic Rapier on WASM (the author says "allegedly" deterministic) — [bevy_ggrs_rapier_example](https://github.com/cscorley/bevy_ggrs_rapier_example)
- Photon Quantum ships its own deterministic 2D/3D physics and claims to be "100% deterministic" — [Photon Quantum](https://www.photonengine.com/quantum)

### Inferences
- **Ragdolls on mobile web:** a stickman ragdoll is about 10–15 bodies and 9–14 revolute joints, which is a small load for Box2D v3 or Rapier even on mid-range phones. "Many bodies" only becomes a problem with dozens of simultaneous ragdolls or lots of debris. Matter.js is the weakest choice: its joints are constraint-based (no true revolute motors or limits in the same sense), so ragdolls tend to look rubbery. Planck.js is mature but v2-era. Phaser Box2D (v3) or Rapier is preferred.
- **Determinism ranking for rollback:** Photon Quantum (purpose-built, Unity) > Rapier `-deterministic` (WASM, explicit cross-platform build) ≈ Box2D 3.1 (claims cross-platform determinism; JS ports may not keep the hand-rolled trig) > Planck/Matter (no guarantees; JS float math is IEEE-consistent, but nobody documents it as cross-platform deterministic). Rollback also needs cheap world snapshot/restore, so test serialization cost per frame for your chosen engine.
- For Godot ragdoll games, swapping to the Rapier GDExtension looks close to mandatory given the joint-grid result, but confirm that the plugin's web (WASM) build works, because the v0.35 post doesn't mention web.

### Gaps
- No independent (non-vendor) mobile-browser benchmark of ragdoll scenes across Matter, Planck, Phaser Box2D and Rapier was found.
- Whether Phaser Box2D (JS) keeps Box2D 3.1's cross-platform determinism was not documented. It ports v3.0, which predates 3.1's determinism work.
- Whether Godot Rapier works in web exports, and at what size cost, was not confirmed.
- Matter.js maintenance status in 2025–26 was not checked.

---

## 3. Animation for stick figures: skeletal (Spine, DragonBones, Godot Skeleton2D/IK, Unity 2D Animation), procedural/IK, active ragdolls, vector vs sprites, procedural line rendering

### Takeaway
For stick figures, the cheapest and most flexible approach is to draw limbs procedurally as lines or capsules between joint positions, which are driven by keyframed joint angles, IK, or physics bodies. That is resolution-independent and costs almost nothing in build size. Spine is worth $69–$369 only if you want polished, designer-authored animation reused across engines. Active ragdolls (Stick Fight style) are built from per-limb rigid bodies, revolute joints, and torque/PD controllers that pull each joint toward an animated target pose, plus an upright torque on the torso.

### Cited Findings
- **Spine pricing:** Essential is $69 and Professional $369 (one-time; struck-through list prices $99/$439). Essential lacks meshes and advanced features. Enterprise ($2,499 base, yearly) is required at ≥$500k annual revenue. Spine "does not typically offer discounts" — [Spine purchase](https://esotericsoftware.com/spine-purchase)
- Defold maintains a Spine extension and an updated Rive renderer extension — [Defold 2025 Retrospective](https://defold.com/2026/01/02/Defold-2025-Retrospective/)
- **DragonBones:** the editor is free and the runtimes are open source, but the editor itself is not truly open source. It includes meshes, IK and FFD for free (features that need Spine Pro). It has fewer runtimes than Spine. Sources are old, and no 2025 maintenance evidence was found — [HaxeFlixel blog](https://haxeflixel.com/blog/13-HaxeFlixel-DragonBones-Support/); [Tuts+ review](https://webdesign.tutsplus.com/adobe-alternatives-animation-software--cms-28910a). AlternativeTo lists Synfig Studio (free, open source) as the top alternative — [AlternativeTo](https://alternativeto.net/software/dragonbones)
- **Godot 2D skeleton/IK:** `SkeletonModification2DFABRIK` solves bone chains toward a target and supports angle constraints. It often looks more natural than CCDIK, but is labelled experimental in 4.3 docs — [Godot docs FABRIK](https://docs.godotengine.org/en/4.2/classes/class_skeletonmodification2dfabrik.html); [Godot 4.3 docs](https://docs.godotengine.org/de/4.3/classes/class_skeletonmodification2dfabrik.html)
- **Godot ragdolls:** `PhysicalBone2D` (a RigidBody2D) makes Bone2Ds react to physics. It needs a `SkeletonModification2DPhysicalBones` modifier, and joints aren't auto-created (add a PinJoint2D). `simulate_physics` toggles between animation and physics control — [Godot docs PhysicalBone2D](https://docs.godotengine.org/en/4.2/classes/class_physicalbone2d.html). The community MIT addon "Souperior 2D Skeleton Modifications" adds LookAt, two-bone IK, FABRIK and constraints for 4.2+ — [Godot Asset Library](https://godotengine.org/asset-library/asset/edit/10883)
- **Active ragdoll technique (2D):**
  - Unity forum thread on balancing a stickman "like in Stick Fight": separate Rigidbody2D per limb, HingeJoint2D with limits — [Unity discussions](https://discussions.unity.com/t/active-ragdoll-2d/770915)
  - The standard pattern gives each joint angular drives and a target rotation taken from a hidden, separately animated copy of the character — [sergioabreu-g/active-ragdolls](https://github.com/sergioabreu-g/active-ragdolls)
  - Joint torques act "like a spring" toward the desired pose while still reacting to hits — [jMonkeyEngine forum](https://hub.jmonkeyengine.org/t/apply-torque-to-ragdoll-joints/22643)
  - A PD-style controller computes target joint positions, then forces, then per-joint torques — [Panda3D forum](https://discourse.panda3d.org/t/controlled-ode-based-bipeds-ragdolls/5682)
  - 2D active ragdoll resources are scarce compared with 3D, so expect custom scripting — [Godot forum](https://forum.godotengine.org/t/active-ragdolls-in-2d/140330)
  - A motor joint to an invisible fixed-rotation body works to hold a limb angle — [GDevelop forum](https://forum.gdevelop.io/t/how-to-make-a-2d-active-ragdoll/49083)
  - A torque-driven Godot active ragdoll asset exists — [Godot Asset Library](https://godotengine.org/asset-library/asset/edit/5123)
- *Stick Fight: The Game* is described as a "physics-driven combat system" built in Unity 2017 — [Dexerto](https://www.dexerto.com/gaming/db/game/stick-fight-the-game/)

### Inferences
- **Recommended stick figure pipeline:**
  1. Define the skeleton as about 10 joints (head, neck, pelvis, 2×shoulder/elbow/hand, 2×hip/knee/foot).
  2. Author poses as joint-angle keyframes (in-engine, or extracted from video, see §7).
  3. Render each bone with the engine's vector API (Phaser Graphics, Pixi v8 Graphics, Godot `draw_line`/Line2D, Defold mesh or sprite-stretched segments), using round caps plus a circle head.
  4. Blend between keyframed animation, IK (foot planting, aiming arms), and physics (ragdoll on death or knockback, or a continuous active ragdoll).

  Benefits: near-zero art cost, perfect scaling on any DPR, trivial recolouring and skins, and small builds that fit the Poki/CrazyGames size pressure.
- **Active ragdoll controller sketch:** per joint, `torque = kp*(θ_target − θ) − kd*ω`, clamped to a max torque. Add an upright controller on the torso (`torque = kp*(0 − torsoAngle) − kd*torsoω`), and optionally a small upward force on the head or pelvis to fake muscle tone. Lower kp when "stunned" for a floppy look. Use Box2D v3 revolute motors (`enableMotor`, `maxMotorTorque`, `motorSpeed = k*(θ_target − θ)`) or direct `applyTorque`. Box2D 3.1's filter joint prevents neighbouring-limb collisions.
- **Sprites vs vectors:** sprite sheets only make sense for stylised, inked stick figures. Skeletal tools (Spine/DragonBones/Godot Skeleton2D/Unity 2D Animation) add value when limbs are textured images, not plain lines.
- Unity 2D Animation/IK is a free Unity package. Its 2026 state wasn't researched here (see Gaps).

### Gaps
- No primary technical breakdown of how Stick Fight's (or any commercial 2D stickman game's) active ragdoll is implemented was found.
- Unity 2D Animation / 2D IK package status in Unity 6.x was not researched.
- DragonBones' 2025–26 maintenance status is unknown. The sources are years old.
- No benchmark compared procedural line rendering with sprites on mobile web. The inference above rests on general engine knowledge.

---

## 4. Multiplayer: Colyseus, Nakama, Photon (Fusion/Quantum), PlayroomKit, Rune, Hathora, WebRTC P2P, rollback libraries, and costs

### Takeaway
For a web+mobile 2D action game in 2026:
- Colyseus (open source, Node.js; Colyseus Cloud from $15/mo) is the most practical authoritative-server option for JS stacks.
- PlayroomKit is the fastest path to casual web multiplayer, but it is host-authoritative and its pricing is unverified.
- Photon Fusion/Quantum is best for Unity: a free 100 CCU launch tier, and Quantum is deterministic rollback with 2D physics.
- Nakama is strong but its managed tier is expensive.

Hathora's game hosting shut down on 5 May 2026, so do not build on it. Mature browser rollback libraries are thin: NetplayJS is lightly maintained, so true rollback with physics in JS is effectively DIY.

### Cited Findings
- **Colyseus:** Colyseus Cloud starts at $15/mo with managed SSL, "no CCU/DAU/MAU limits", unlimited bandwidth and email support. There is no free tier and no auto-scaling yet (upgrade instance resources manually) — [Colyseus pricing](https://www.colyseus.io/pricing); [Colyseus Cloud billing docs](https://docs.colyseus.io/cloud/pricing-billing). Colyseus says 1 in 7 multiplayer games in Vibe Jam 2026 shipped with it (vendor stat) — [Colyseus blog](https://colyseus.io/blog/vibe-jam-2026/)
- **Nakama/Heroic Cloud:** Nakama managed pricing is not shown publicly (template placeholder / contact sales). Plans are priced by dedicated CPU cores, with no DAU/MAU/CCU limits. Satori (liveops) starts at $1,800/mo — [Heroic Labs pricing](https://heroiclabs.com/pricing); [APIs.io profile](https://apis.io/providers/heroiclabs/). A third-party guide compares Nakama self-hosted vs Heroic Cloud — [Crux guide](https://crux.supercraft.host/blog/nakama-open-source-vs-managed-backend/)
- **Photon Fusion pricing:**
  - Free dev tier: 20 CCU
  - Free launch tier: 100 CCU for one app (0.3 TB/mo, about 40k MAU)
  - 100 CCU one-time pack: $95/12 months, stacks to 200 CCU
  - 500 CCU: $125/mo
  - 1,000 CCU: $250/mo
  - 2,000 CCU: $500/mo
  - Extra traffic: $0.05–$0.10/GB

  WebGL support is not mentioned on the pricing page — [Photon Fusion pricing](https://www.photonengine.com/fusion/pricing); [Photon blog](https://blog.photonengine.com/?p=5965)
- **Photon Quantum:** deterministic predict/rollback where only inputs are exchanged. It has built-in 2D and 3D physics, is free for development, and its simulation has no Unity dependency but is Unity-centred. Example: Stumble Guys with 32 players/race and "25M daily players". Typical tick rates are 30 Hz on mobile and 60+ on PC. Web/WebGL support is not mentioned — [Photon Quantum](https://www.photonengine.com/quantum)
- **PlayroomKit:**
  - A single JS/TS SDK with synced global and per-player state, a host-elected model, RPCs, lobbies/matchmaking, on-screen joysticks, bots and persistent storage. It has wrappers for Unity and Godot and works with Phaser and React Three Fiber — [API Evangelist profile](https://providers.apievangelist.com/providers/playroom/)
  - The Unity SDK supports only WebGL exports and is beta — [playroom-unity GitHub](https://github.com/asadm/playroom-unity)
  - Pricing: "Free tier included… From $10/mo" according to a third-party directory (unverified; the official pricing page did not render) — [aitoolscoop](https://aitoolscoop.com/tool/playroom/)
- **Rune:** you write logic in JS/TS and Rune runs it with a custom predict-rollback framework on all clients plus the server, with server conflict resolution. Rendering can be any HTML5 framework or Unity/Godot/Defold. The docs footer is © 2026 and no shutdown announcement was found — [Rune docs](https://developers.rune.ai/docs/how-it-works/philosophy). Games run inside the Rune iOS/Android app, and launching is free — [rune-games-sdk GitHub](https://github.com/rune/rune-games-sdk). Older coverage describes a pivot to mobile games with voice chat, an $8M raise, and cross-play across browser, iOS and Android (date unclear) — [Pocket Gamer](https://www.pocketgamer.com/dusk/mobile-multiplayer-app)
- **Hathora (dead):** it announced on 4 Mar 2026 that game-server hosting would close on 5 May 2026, as the team joined Fireworks AI after pivoting to AI inference in Nov 2025. Hathora pointed customers to GameFabric (Nitrado), and Edgegap and Gameye ran migration offers. Stormgate lost online modes — [Supercraft/Crux](https://crux.supercraft.host/blog/hathora-shut-down-where-to-go-after-may-2026/); [TechSpot](https://www.techspot.com/news/111969-stormgate-servers-go-dark-following-ai-focused-hosting.html); [Edgegap migration docs](https://docs.edgegap.com/docs/tools-and-integrations/switch-from-hathora); [Gameye 2026 shake-up](https://gameye.com/blog/game-server-shake-up-2026)
- **NetplayJS:** P2P rollback netcode over WebRTC with a small matchmaking/signalling server (self-host or public). Version 0.4.1; last push Oct 2024, so lightly maintained — [npm netplayjs](https://www.npmjs.com/package/netplayjs); [ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Frameshvarun%2Fnetplayjs)
- **Godot rollback:**
  - **netfox:** fixed-tick clock, interpolation, a RollbackSynchronizer for client prediction; netfox.noray handles NAT punchthrough/relay — [netfox docs](https://docsearch.algolia.com/mcp/docs/repo/foxssake/netfox)
  - **Delta Rollback:** Godot 4.2+, MIT, active version bumps to 0.7 — [Godot Asset Library](https://godotengine.org/asset-library/asset/edit/17745)
  - **Snopek's Godot Rollback Netcode:** a Godot 3 alpha, last updated May 2024 — [Godot Asset Library](https://godotengine.org/asset-library/asset/1165)
- Defold ships a Photon Realtime extension — [Defold 2025 Retrospective](https://defold.com/2026/01/02/Defold-2025-Retrospective/)
- Poki requires strict profanity filtering on username input for multiplayer games — [Poki requirements](https://developers.poki.com/guide/requirements-quality)

### Inferences
- **For a 1v1–4-player ragdoll brawler on web+mobile, the realistic choices are:**
  - (i) Server-authoritative Colyseus running the same physics (Rapier or Planck/Box2D-JS) in Node at 20–30 Hz, with client interpolation and light prediction for the local player. This is the simplest robust option and costs about $15–$50/mo early.
  - (ii) Deterministic input-sync (lockstep or rollback) with `rapier2d-deterministic` over WebRTC/WebSocket relay. Lower server cost, but much harder, and snapshot/restore of ragdoll state every frame is expensive.
  - (iii) Unity + Photon Quantum if mobile-native first. Purpose-built, free to 100 CCU, but web support is unconfirmed.
- Ragdoll fighters tolerate approximate sync well, because players accept physics chaos. Most solo devs should therefore prefer authoritative-server snapshots (Colyseus) over full rollback.
- PlayroomKit and Rune are attractive for quick party-game prototypes, but they lock you into their platforms. Avoid them for anything needing authoritative anti-cheat.
- Rough cost at small scale: Photon free to 100 CCU (about 40k MAU per Photon's estimate). Colyseus Cloud $15+/mo. A self-hosted Colyseus or Nakama on a small VPS is likely $5–$20/mo (VPS cost not verified here).

### Gaps
- Official PlayroomKit pricing could not be retrieved (page didn't render).
- Rune's current 2026 operating status and developer revenue terms are not confirmed.
- Photon Quantum pricing tiers beyond "free for development" were not retrieved. Photon WebGL support for Fusion/Quantum was not confirmed.
- Nakama Heroic Cloud dollar pricing is not public.
- No maintained, production-proven JS rollback library with physics was found besides NetplayJS (lightly maintained).
- Edgegap/GameFabric pricing for dedicated servers was not researched.

---

## 5. Deployment and SDKs: Poki/CrazyGames requirements, Capacitor/Cordova wrapping, mobile ad SDKs (AdMob, AppLovin MAX, Unity Ads/LevelPlay), IAP

### Takeaway
Web portals reward tiny, fast-loading builds and forbid outside ads and IAP:
- **Poki:** "small file size", players leave after about 10 seconds, Poki SDK is the only ad system, no IAP.
- **CrazyGames:** ≤50 MB initial download, ≤20 MB for the mobile homepage, Unity disabled on iOS by default.

For mobile stores, an HTML5 game can be wrapped with Capacitor and monetised with AdMob or AppLovin MAX plus RevenueCat IAP. Unity-native gets first-class LevelPlay/MAX/AdMob SDKs.

### Cited Findings
**Poki** — [Poki requirements & quality guide](https://developers.poki.com/guide/requirements-quality)
- "Players tend to move to another game if loading takes more than 10 seconds." The current guide asks for "small file size" with no number and recommends progressive loading. An older Poki SDK page (Unity) cited a target initial download under 8 MB — [sdk.poki.com/unity](https://sdk.poki.com/unity). This conflicts with or is older than the current guide.
- Must support desktop, mobile and tablet, and cover the full screen on mobile. 16:9 scaling targets are 640×360, 836×470 and 1031×580.
- Ads:
  - `commercialBreak()` only when exiting pause and going back into gameplay.
  - No custom ad timers (Poki controls frequency); audio is muted during ads.
  - Poki SDK is the only permitted ad system.
  - Rewarded ads: tell the player beforehand, no multi-video rewards, no double rewards.
  - A normal continue button must be shown that is at least as large as the rewarded button. Rewarded buttons can't be green and must show a 🎬 icon.
  - No rewards when an ad blocker is detected, and the game must stay fully playable with ad blockers.
- Not allowed: IAP, buy-currency or remove-ads UI, and reward-walling core gameplay.
- External requests are blocked by default (bundle all assets and fonts). Use `PokiSDK.openExternalLink` for links. No splash screens or outgoing links (a studio logo on the loader is OK).
- Other requirements:
  - `gameplayStart()` fires on the first input; `gameplayStop()` on any interruption.
  - ESC/space pauses.
  - Wrap localStorage in try/catch for incognito.
  - Skippable cutscenes.
  - Static and animated thumbnails.
  - Profanity filter for multiplayer usernames.

**CrazyGames** — [CrazyGames technical requirements](https://docs.crazygames.com/requirements/technical)
- Initial download ≤50 MB (≤20 MB for mobile-homepage eligibility). With the SDK, this is measured until the first `Gameplay start` event. Total size ≤250 MB (50 MB without SDK), with ≤1,500 files. Externally loaded content must reach gameplay in ≤20 s.
- Targets Chrome and Edge, and games are disabled on Safari if they don't work well there. Chromium OS requires smooth play on 4 GB RAM.
- Unity games are disabled on iOS by default (memory crashes), with DPR 1 forced on iOS and low-memory Android.
- iOS audio: resume the AudioContext inside a user gesture (touchend/click).
- "Basic Launch": ads not allowed. "Full integration": Gameplay start/stop events plus Data and User modules.

**Mobile wrapping**
- Capacitor's official games guide says it supports "WebGL and canvas rendering" well enough for "high-performance game experiences on modern mobile devices", and points to Phaser — [Capacitor games guide (v7)](https://capacitorjs.com/docs/v7/guides/games). Phaser's Capacitor tutorial covers touch controls and resizing — [Phaser tutorial](https://phaser.io/tutorials/bring-your-phaser-game-to-ios-and-android-with-capacitor). WKWebView performance issues for Phaser "don't seem to be a problem now" (older, anecdotal) — [Josh Morony](https://www.joshmorony.com/create-native-html5-games-with-phaser-and-capacitor/)
- IAP in Capacitor:
  - the official `@revenuecat/purchases-capacitor` plugin — [RevenueCat Capacitor docs](https://www.revenuecat.com/docs/getting-started/installation/capacitor.md)
  - or `@capgo/native-purchases` (StoreKit + Google Play Billing directly, no RevenueCat) — [Capgo blog](https://capgo.app/blog/in-app-purchases-capacitor/)

**Mobile ad mediation**
- AppLovin MAX and Unity Ads "tend to outperform AdMob on rewarded video and interstitials in Tier-1 markets". AdMob offers fast setup and strong Google demand, ideal for banners. MAX's ML benefits show up mainly at "100K+ daily active users". Payout terms: AdMob Net 21, MAX Net 15. Sources include vendor-adjacent blogs (CAS.AI sells competing mediation) — [Segwise 2026 AppLovin guide](https://segwise.ai/blog/applovin-publisher-monetization-guide); [CAS.AI ad networks](https://cas.ai/blog/the-best-mobile-ad-networks/)
- ironSource is now part of Unity. Its mediation is **Unity LevelPlay**, installable from the Unity Package Manager, with 17 networks and required GDPR/COPPA/CCPA/Families-policy handling — [Unity LevelPlay blog](https://unity.com/en/blog/introducing-all-new-unity-levelplay); [LevelPlay mediation networks docs](https://docs.unity.com/ja-jp/grow/levelplay/sdk/unity/mediation-networks); [ironSource getting started](https://developers.ironsrc.com/ironsource-mobile/unity/levelplay-starter-kit/)
- Case study: *Stickman Hook* (Madbox) reached #1 on the iOS App Store in 14 countries and top 10 in 59, with AppLovin's help (mediation waterfall tuning plus UA). This is a vendor case study — [AppLovin success story](https://www.applovin.com/success-stories/madbox/). *Stickman Hook* is also on Poki — [Poki](https://poki.com/kr/g/stickman-hook)

### Inferences
- **Size budget:** design for under about 5–8 MB initial download (Poki's older 8 MB target plus the 10 s load expectation) and lazy-load the rest. That keeps you comfortably inside CrazyGames' 20 MB mobile limit. This strongly favours Phaser/Pixi/Defold and procedural stick figures over Unity.
- **Build variants:** you need separate builds per channel.
  - Portal builds: Poki SDK or CrazyGames SDK ads only, no IAP, no external links.
  - Store builds: Capacitor + AdMob/MAX + RevenueCat IAP and a remove-ads purchase.

  Abstract ads and IAP behind a single interface from day one.
- For a solo dev at launch scale, AdMob (simple) or AppLovin MAX with AdMob as a network is reasonable. MAX's advantage grows with DAU.

### Gaps
- Poki and CrazyGames revenue-share percentages were not researched (likely covered by the market researcher).
- The current Capacitor AdMob plugin (package name/maintenance) was not verified.
- Apple App Store review risk for wrapped HTML5 games (Guideline 4.2 "minimum functionality") was not researched.
- Cordova's 2025–26 status vs Capacitor was not checked.
- Not verified this session: Apple Developer Program ($99/yr) and Google Play registration ($25 one-time) fees. These are commonly cited figures.

---

## 6. Recommended stacks: (a) web-first then mobile, (b) mobile-first, (c) physics-heavy ragdoll fighter with online multiplayer, with cost estimates

### Takeaway
- **(a) Web-first:** Phaser 4 + Phaser Box2D (v3) or Rapier2D, with procedural line-rendered stickmen, then Capacitor for stores. Alternative: Defold.
- **(b) Mobile-first:** Unity 6 (Personal) + Box2D-based 2D physics + LevelPlay/MAX, or Godot 4 (GDScript) + Rapier if you want $0 and still care about web.
- **(c) Online ragdoll fighter:** Godot + Rapier (deterministic) + netfox, or a TypeScript stack with Rapier-deterministic + Colyseus server-authoritative. Use Unity + Photon Quantum only if you skip web.

Software licences can be $0 in all three. Running costs are dominated by servers ($15–$250/mo at indie scale) and store fees.

### Cited Findings (inputs to the recommendations)
- Phaser 4 is stable (Apr 2026) and recommended for new projects — [Phaser](https://phaser.io/news/2026/05/phaser-3-vs-phaser-4). Phaser Box2D is MIT, ~70 KB — [Phaser](https://phaser.io/news/2024/12/announcing-phaser-box2d). Capacitor path is official — [Phaser tutorial](https://phaser.io/tutorials/bring-your-phaser-game-to-ios-and-android-with-capacitor)
- Defold: ~0.8 MB empty web build, one-click Poki publishing, €3M Poki revenue for Defold titles in 2024, free — [Defold Gamescom 2025](https://www.defold.com/gamescom2025/); [Defold retrospective](https://defold.com/2026/01/02/Defold-2025-Retrospective/)
- Unity Personal is free to $200k with no Runtime Fee. Pro is $2,310/seat/yr — [Unity pricing](https://unity.com/pricing-updates). The new Box2D v3 low-level 2D API is in 6.3 — [Unity manual](https://docs.unity3d.com/Manual/2d-physics-api/2d-physics-api-introduction.html). CrazyGames disables Unity on iOS by default — [CrazyGames](https://docs.crazygames.com/requirements/technical)
- Godot Rapier: stable joints, cross-platform determinism always on — [godot.rapier.rs](https://godot.rapier.rs/blog/v0-35-0). netfox rollback — [netfox](https://docsearch.algolia.com/mcp/docs/repo/foxssake/netfox). Godot C# not on web — [Godot 4.7 docs](https://docs.godotengine.org/en/4.7/tutorials/export/exporting_for_web.html)
- `@dimforge/rapier2d-deterministic` exists for cross-platform deterministic JS/WASM — [Rapier npm](https://classic.yarnpkg.com/en/package/@dimforge/rapier2d)
- Colyseus Cloud from $15/mo — [Colyseus](https://www.colyseus.io/pricing). Photon Fusion free 100 CCU; 500 CCU $125/mo — [Photon](https://www.photonengine.com/fusion/pricing). Quantum is deterministic with 2D physics and free for dev — [Photon Quantum](https://www.photonengine.com/quantum)
- Spine $69/$369 one-time — [Spine](https://esotericsoftware.com/spine-purchase)

### Inferences (recommended stacks)

**(a) Web-first (Poki/CrazyGames/itch) then mobile**
- **Primary:** TypeScript + Vite + **Phaser 4**.
  - Physics: **Phaser Box2D** (v3 API, revolute motors for active ragdolls) or **Rapier2D** if determinism or online play is planned.
  - Rendering: stickmen drawn procedurally with Phaser Graphics (lines and circles), with joint-angle keyframes, IK and ragdoll blending.
  - Portals: Poki SDK and CrazyGames SDK behind an ads interface.
  - Stores: **Capacitor** wrap for iOS/Android with AdMob or AppLovin MAX plus RevenueCat.
- **Alternative:** **Defold** (Lua) for the smallest builds, native iOS/Android binaries instead of a WebView, a built-in Poki pipeline, and Box2D v3 opt-in with joint APIs in 1.13.
- **Alternative for editor lovers:** Godot 4.7 with GDScript (never C# for web) plus the Rapier plugin. Accept a ~5–7 MB engine baseline.
- **Licence costs:** $0 engine; $0 (procedural) or $69–$369 for Spine.
- **Fixed costs (unverified figures):** Apple $99/yr; Google $25 once.
- **Servers:** $0 if single-player.

**(b) Mobile-first**
- **Primary:** **Unity 6.x LTS (Personal, $0 until $200k)**.
  - Physics: Rigidbody2D/HingeJoint2D (Box2D-based), or the new LowLevelPhysics2D (Box2D v3) API for performance and determinism.
  - Animation: Unity 2D Animation/IK or Spine runtime, or procedural LineRenderer stickmen.
  - Monetisation: LevelPlay or AppLovin MAX (AdMob as a network); Unity IAP or RevenueCat.
  - Web: a stripped WebGL/WebGPU build for CrazyGames and itch is possible (~2–8 MB with heavy stripping). Expect Poki to require extra optimisation, and expect iOS-web exclusion on CrazyGames.
- **$0-licence alternative:** **Godot 4 (GDScript)**, which keeps a viable web build. Or **Defold**, which is the best of both if you can accept Lua.
- **Costs:** $0 licence below $200k revenue, then $2,310/seat/yr for Unity Pro. Ads/IAP SDKs are free (revenue share is taken by networks and stores).

**(c) Physics-heavy ragdoll fighter with online multiplayer**
- **Option C1 (web + mobile, open source):** **Godot 4.7 + Godot Rapier 2D** (cross-platform deterministic, stable joints) **+ netfox** (rollback/prediction, noray NAT relay) or Delta Rollback. Verify the Rapier plugin's web build first.
- **Option C2 (TypeScript, web-native):** Phaser 4 or PixiJS v8 rendering + **`@dimforge/rapier2d-deterministic`**.
  - Networking: **Colyseus** server-authoritative (the same Rapier sim in Node), with the client predicting only its own fighter and interpolating others. Upgrade later to input-based rollback if needed.
  - P2P prototype: NetplayJS LockstepWrapper.
  - Costs: Colyseus Cloud $15+/mo, or a self-hosted VPS.
- **Option C3 (mobile/PC native, skip web):** **Unity 6 + Photon Quantum**, which has deterministic 2D physics and rollback built in. Free for dev and 100 CCU, with paid Photon tiers ($125/mo for 500 CCU on Fusion; Quantum pricing unverified).
- **Avoid:** Hathora (shut down May 2026), Matter.js for ragdolls, and Godot's built-in 2D physics for joint-heavy scenes.
- **Indicative monthly server cost at indie scale:** $0 (Photon free 100 CCU) to $15–$50 (Colyseus Cloud, small instance) up to about $125–$250 (Photon 500–1,000 CCU).

### Gaps
- No real-world postmortem of a shipped *web+mobile online ragdoll fighter* using any of these stacks was found to validate the recommendations.
- Compute cost per Colyseus room running Rapier physics (rooms per vCPU) was not found.
- Quantum's paid pricing and web support are unconfirmed.

---

## 7. AI-assisted asset/animation tools (2026) for stickman animation: AI mocap from video, Cascadeur, etc.

### Takeaway
Stick figures are the ideal target for video-to-pose AI, because you only need about 10–15 2D joint angles per frame. The cheapest route is **MediaPipe Pose Landmarker** (free, runs in the browser, 33 landmarks), converting landmarks to 2D joint angles that become your keyframes. Commercial video-mocap (DeepMotion, Rokoko Video, Move AI) outputs 3D FBX/BVH that you would project to 2D. Cascadeur ($8–$19/mo indie) is a physics-aware keyframing and cleanup tool rather than a video-mocap tool.

### Cited Findings
- **MediaPipe Pose Landmarker (web):** detects body landmarks in images or video and returns image and 3D world coordinates. It is available via the `@mediapipe/tasks-vision` npm package or a CDN and runs in the browser — [Google AI Edge docs](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/web_js). It detects 33 landmarks in real time, with DrawingUtils for 2D canvas drawing — [DEV Community walkthrough](https://dev.to/yoshan0921/fitness-app-development-with-real-time-posture-detection-using-mediapipe-38do)
- **Cascadeur:** Indie is about $8/mo billed annually (or $19 monthly) for under $100k revenue. Pro is about $49/mo. The free tier is non-commercial with `.casc` export only. Its key feature for mocap is "animation unbaking" (turning every-frame mocap curves into editable keys). It is not a video-to-mocap tool. Prices vary by source — [aisotools review 2026](https://aisotools.com/blog/cascadeur-review-2026); [Capterra (€12/user/mo)](https://www.capterra.com/p/10015822/Cascadeur/)
- **DeepMotion:** phone-video mocap. Pricing claims conflict: "plans start at $9/month with a free tier" — [aisotools](https://aisotools.com/blog/cascadeur-review-2026); "Free; paid from $17/mo" — [BityClips](https://bityclips.com/tool/deepmotion/pricing); "no permanent free plan" — [Toolradar](https://toolradar.com/tools/deepmotion/pricing); "Free to $83/mo, 60 s/month free" — [fast.io roundup](https://fast.io/resources/best-ai-animation-tools-2026/)
- **Rokoko:** "Free to $50/mo" software including AI video capture — [fast.io](https://fast.io/resources/best-ai-animation-tools-2026/); [aiindigo review](https://aiindigo.com/blog/rokoko-video-review-2026-high-fidelity-motion-capture-without-the-suit). **Move AI:** free start, paid pricing not disclosed — [neuronfeed](https://neuronfeed.com/compare/move-ai-vs-deepmotion)
- **Meta Animated Drawings** (open source, Apr 2023): detects a humanoid drawing, segments it, estimates skeletal joints, and retargets BVH motion clips. Python code plus about 180k drawings dataset — [SiliconANGLE](https://siliconangle.com/2023/04/13/meta-platforms-open-sources-ai-powered-animation-tool-doodles/); [InfoQ](https://www.infoq.com/news/2023/04/meta-animated-drawings/)

### Inferences
- **Suggested low-cost pipeline:**
  1. Film yourself (or use stock or licensed clips) performing moves: punches, kicks, flips, idle, hit reactions.
  2. Run MediaPipe Pose in a small browser tool.
  3. Map landmarks (shoulders, elbows, wrists, hips, knees, ankles, nose) to your stickman's joints, compute 2D angles relative to the parent bone, and smooth them (e.g., a One-Euro filter).
  4. Reduce to keyframes (by hand, or via Cascadeur-style unbaking).
  5. Export JSON that your runtime plays back. The same angles can serve as PD targets for an active ragdoll.

  Cost: $0. This is much cheaper than DeepMotion or Rokoko for a stickman, and avoids 3D→2D retargeting.
- Use Cascadeur when you want physically plausible hand-keyed acrobatics (flips, jumps) with its AutoPhysics/AutoPosing. Export from 3D and project to 2D.
- Meta Animated Drawings is better suited to user-generated content features (e.g., "draw your own fighter") than to production animation.

### Gaps
- No official 2026 pricing pages for DeepMotion, Rokoko Video or Move AI were retrieved, and third-party figures conflict.
- No source specifically documents a 2D stickman pipeline built on MediaPipe or AI mocap, so the pipeline above is an inference.
- Licensing for using pose-extracted motion from third-party video was not researched.
- Cascadeur AutoPhysics feature details for 2026 were not verified from Cascadeur's own site.
