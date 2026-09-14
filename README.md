# Cosmic Destroyer Cat 2

Play at https://yeojinsong-lgtm.github.io/Cosmic-Destroyer-Cat-2/

Move with WASD / arrow keys or the touch buttons. Space dashes; Escape pauses. Attacks automatically target the nearest enemy. Collect fish for XP and score, then select one of three powers. Defeat Titans arriving at 5, 10 and 15 minutes of active play to complete a stage. If a previous Titan is still alive, the next waits for its defeat. Losing all HP ends the run.

Cosmic plus all eight planets offer nine ascending difficulty levels. Each has a named Titan, distinct palette and silhouette; encounter attacks vary by stage and intensify by form. All stages are available immediately. Completion marks, Star Tokens and cosmetics save in browser local storage. Tokens are awarded when a run ends: one per completed minute, eight per defeated Titan, and 25 + five per planet difficulty step for victory. Leaving/restarting an unfinished run forfeits its reward.

The shop contains ten playable cosmetic cats plus ship themes and shot colors. Purchases automatically equip; owned items can be equipped for free. Cosmetic cats have identical stats. Sound can be muted in the lobby. Audio uses synthesized effects without external downloads.

## Balance

The 15 standard powers cap at rank eight. Meteor adds 24% base volley damage per rank. Twin adds a projectile and 20% base total volley damage, divided among projectiles. Rapid adds 22% base attack speed. Healing restores 30 HP, adds 12 maximum HP and improves regeneration. Butler adds 18 aura damage per second per rank and expands its range. Churu clears ordinary visible enemies and deals 6% maximum HP to visible Titans. Every enemy death uses the same 3% Churu drop chance, including Titans and burst kills.

Ten additional powers provide movement speed, pickup range, dash recharge, maximum health, orbiting bells, periodic nova pulses, slowing fields, a shooting companion, dash shockwaves and bonus XP. Three unlimited upgrades (damage, maximum health, regeneration) remain available after all standard powers reach their caps. Every level continues to offer a choice.

Each planet is visibly illustrated in its stage background: Mercury craters, Venus clouds, Earth's oceans and continents, Mars's polar cap, Jupiter's storm, Saturn's rings, Uranus's tilted rings and Neptune's dark storm. All nine stages have three separately named boss silhouettes with planet-specific details, for 27 boss appearances.

Sound resumes on keyboard/touch gestures, limits simultaneous voices and uses a stronger volume envelope. The lobby's TEST SOUND button enables audio and plays two notes.

## Rubric coverage and validation

- Correctness: browser checks cover start, retry, all nine stage bosses, all three Titan transitions, final victory and rewards paid once.
- Controls: keyboard/touch movement, dash readiness, pause, automatic pause on loss of focus, bounded movement and visible focus states.
- Rules: mission goal, power descriptions, rewards and outcome statistics are visible in game.
- Mechanics and complexity: five capped upgrade paths, regeneration, aura, pickups, telegraphed boss hazards and permanent cosmetics.
- Visuals: shared cat artwork in shop/game, fish collectibles, citrus/herb enemies, planet scenery and Titan silhouettes.
- Feel and challenge: dash invulnerability, particles, synthesized sound, stronger Titan forms and nine difficulty settings.
- Content: nine stages, ten cats, three Titans per run, cosmetic collections and saved stage clear marks.

Validation performed: JavaScript syntax and whitespace checks, desktop lobby and 27-boss gallery screenshot inspection, initial 29 headless Chrome assertions and 50 expansion assertions. Expansion checks include 3% drop boundary values for every enemy kind, boss/burst drops, unlimited level-up choices, new skill effects, a 3,000-step combat simulation, 27 distinct boss renders, eight distinct planet renders, nonzero rendered audio samples and mute behavior. Speaker output, real-time completion of all nine stages and physical touchscreen play were not manually tested; difficulty may need further playtesting.
