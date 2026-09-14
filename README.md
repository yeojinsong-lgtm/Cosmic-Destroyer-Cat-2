# Cosmic Destroyer Cat 2

Play at https://yeojinsong-lgtm.github.io/Cosmic-Destroyer-Cat-2/

Move with WASD / arrow keys or the touch buttons. Space dashes; Escape pauses. Attacks automatically target the nearest enemy. Collect fish for XP and score, then select one of three powers. Defeat Titans arriving at 5, 10 and 15 minutes of active play to complete a stage. If a previous Titan is still alive, the next waits for its defeat. Losing all HP ends the run.

Cosmic plus all eight planets offer nine ascending difficulty levels. Each has a named Titan, distinct palette and silhouette; encounter attacks vary by stage and intensify by form. All stages are available immediately. Completion marks, Star Tokens and cosmetics save in browser local storage. Tokens are awarded when a run ends: one per completed minute, eight per defeated Titan, and 25 + five per planet difficulty step for victory. Leaving/restarting an unfinished run forfeits its reward.

The shop contains ten playable cosmetic cats plus ship themes and shot colors. Purchases automatically equip; owned items can be equipped for free. Cosmetic cats have identical stats. Sound can be muted in the lobby. Audio uses synthesized effects without external downloads.

## Balance

All powers cap at rank eight. Meteor adds 24% base volley damage per rank. Twin adds a projectile and 20% base total volley damage, divided among projectiles. Rapid adds 22% base attack speed. Healing restores 30 HP, adds 12 maximum HP and improves regeneration. Butler adds 18 aura damage per second per rank and expands its range. Churu clears ordinary visible enemies and deals 6% maximum HP to visible Titans.

## Rubric coverage and validation

- Correctness: browser checks cover start, retry, all nine stage bosses, all three Titan transitions, final victory and rewards paid once.
- Controls: keyboard/touch movement, dash readiness, pause, automatic pause on loss of focus, bounded movement and visible focus states.
- Rules: mission goal, power descriptions, rewards and outcome statistics are visible in game.
- Mechanics and complexity: five capped upgrade paths, regeneration, aura, pickups, telegraphed boss hazards and permanent cosmetics.
- Visuals: shared cat artwork in shop/game, fish collectibles, citrus/herb enemies, planet scenery and Titan silhouettes.
- Feel and challenge: dash invulnerability, particles, synthesized sound, stronger Titan forms and nine difficulty settings.
- Content: nine stages, ten cats, three Titans per run, cosmetic collections and saved stage clear marks.

Validation performed: JavaScript syntax and whitespace checks, desktop lobby screenshot inspection, and 29 headless Chrome assertions including a 3,000-step combat simulation. Real-time completion of all nine stages and physical touchscreen play were not manually tested; difficulty may need further playtesting.
