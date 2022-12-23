# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.3.6] - 2022-12-22
### Fixed
- Cleaned up ranged attack chat cards.
- Cleaned up beast ToP notification.
- No longer possible for quality armor to provide a positive defense bonus.
- Compendium inaccuracies.

## [0.3.5] - 2022-12-18
### Added
- Sort Spell Library by 'all'.
- Smart Select setting to use active character if no token is selected.
### Changed
- Combat macros default to user's active character if no token is selected.
### Fixed
- Compendium inaccuracies.
- No longer possible to add the same weapon talent twice.

## [0.3.4] - 2022-12-15
### Changed
- Resolved compat issue with a hosting provider.

## [0.3.3] - 2022-12-11
### Added
- Compendium items.
- Defense property for character classes.
- Weapon talents can be manipulated via their card.
### Changed
- Talents sorted alphabetically.
### Fixed
- Inaccuracy in charisma stat table.
- Broken will saves.
- Ability scores with 100 fractional points were parsed incorrectly.

## [0.3.2] - 2022-12-06
### Added
- Compendium items.
- Culling logic for reach display.
- Players can create new items on inventory tab (toggled by game setting).
- Improved reach for weapon talents.
### Changed
- Formatting improvements.
### Fixed
- Mage spell casting no longer advances init table (for real this time).
- Threat range display properly synchronizes across clients.

## [0.3.1] - 2022-12-03
### Added
- Weapon talents.
- Talents compendium.
### Changed
- Re-styled proficiency sheet.
### Fixed
- Threat ranges failed to display in certain circumstances.
- Ranged firing speed no longer double-dips.
- Unprivileged users no longer receive error message when token loses status effect.
- Mage spell casting no longer advances init table.
- Adjusted unarmed damage and speed. Replace unarmed innate attacks to fix existing actors.

## [0.3.0] - 2022-12-01
### Added
- Compendium items.
- Character class cards (collect them all!).
- Proficiency cards.
- Racial cards.
- Actors who lack a skill can make skill checks via macro.
### Changed
- Proficiency list is alphabetically sorted, with weapons at the front.
- Formatting improvements.
### Removed
- Invididual HP rolls no longer tracked on class sheet. Use card in setup.
### Fixed
- Regression allowed ranged weapons to have inappropriate specializations.
- Display bug causing weight to not display on character sheet in some circumstances.
- Control UI no longer toggles card visibility state.

## [0.2.36] - 2022-11-30
### Added
- Beasts compendium.
### Changed
- Innate weapons are sorted to the bottom of lists in dropdown menus.
- Redesigned character setup section.
### Fixed
- Adding a token to the map could generate error messages for players.

## [0.2.35] - 2022-11-27
### Added
- Compendium items.
- Spell item saving throw data (defaults to 'none').
- Auto-roll saving throws.
- New beast properties (reach, size, and caster level).
### Changed
- Redesigned beast setup section.
- Added spell saves to mage and clerical spell compendiums.

## [0.2.34] - 2022-11-23
### Added
- Character actors gain -1 init bonus while not wearing armor.
- Dodge bonus to defend dialogs.
### Changed
- Re-styled spell sheet.
- Chat cards declare strength damage bonus to ranged weapon damage rolls.
- Changed availability index order to match the book.
### Fixed
- Adjusted charisma modifiers were incorrectly applied to characters.

## [0.2.33] - 2022-11-21
### Fixed
- Missing dialog for ranged attacks (oops!)

## [0.2.32] - 2022-11-21
### Added
- Snapshot ranged attack.
- Component firing declarations (load/draw/aim).
### Changed
- Weapon cards close after toggling equipped status.
- Formatting fixes.
### Fixed
- Beast skills/languages omitted from sheets.
- Weapon speed displaying as NaN in rare situations.
- Other users could receive error message when character actor changes race/class.

## [0.2.31] - 2022-11-15
### Added
- BP tracked on front of character sheet.
- Maximum Luck tracked by character class items.
- Maximum EP automatically tracked.
- Compendium items.
### Changed
- Formatting fixes.
- Updated Thief for Luck points in class compendium.
- Maximum EP can no longer be input directly by user.
### Fixed
- Races with a custom size no longer default to 'Tiny' when delivering crits.

## [0.2.30] - 2022-11-12
### Added
- Critical Hit macro.
- Text animation on critical hit.
- Client setting to control reach/threat display opacity level.
### Changed
- Actor HP can be altered directly from token HUD without a macro.
### Fixed
- Non-GM users can now see arrows in init update chat cards.
- Full Parry and Set for Charge no longer show as Ranged Attacks when declared.
- Non-GM users can no longer advance initiative.
- Set text color to white for doubleclick init change on popout version of init tracker.
- No longer possible to set a weapon size to 'Custom'.

## [0.2.29] - 2022-11-07
### Added
- Incapacitated status effect.
- Compendium items.
### Changed
- Changed "die penetrated" indicator icon.
- Altered weapon damage chat cards.
- Weapon reach is brighter than before on hover.
### Fixed
- ToP correctly rounds down instead of up.
- Possible crash due to token redraws in rare circumstances.

## [0.2.28] - 2022-11-03
### Added
- Button to toggle weapon equip state from Combat tab.
### Changed
- Beast auto ToP check no longer publicly announced to table.
### Fixed
- Scrollable sections of the character sheet no longer reset position on redraw.
- Possible crash due to token redraws in rare circumstances.
- Revised Inflict Wound macro.

## [0.2.27] - 2022-11-01
### Added
- Compendium items.
### Changed
- Re-styled character class sheet.
- Character sheet style improvements.
### Fixed
- Toggle-able sections of the sheet no longer slam down on your fingers.

## [0.2.26] - 2022-10-30
### Added
- Non-mechanical ranged weapon types can do additional strength damage.
- Weapon cards have a button to indicate/select which weapon displays reach.
- Weapon cards display ranged weapon range breakdown.
### Changed
- Reach/threat ranges highlight on mouseover.
- Set mechanical state to ranged weapons in compendium.
- Altered default size of character class sheets.
### Fixed
- Threat ranges not displaying for certain player-owned actors.

## [0.2.25] - 2022-10-28
### Added
- Melee reach/threat range visual display.
- Control button to toggle reach/threat display mode.
- Ranged reach support.
### Changed
- Redesigned race item sheet.
- Weapon sheets have a place for ranged weapon ranges.
- Fixed inaccuracies in weapons compendium.

## [0.2.24] - 2022-10-22
### Changed
- Updated weapons compendium.
- Retouched character bio/beast description tab.
### Fixed
- 'Sticky' speed weapon sheet input.
- Non-combatants unable to attack while combat is active.

## [0.2.23] - 2022-10-22 [YANKED]
### Added
- Default defense die per weapon.
- Jab damage formula autocalculation.
- Min strength weapon requirement (currently for display only).
- Registered Gentium font with prosemirror editor.
### Changed
- Updated weapons compendium.
- Redesigned various item sheets.
- Item text editor uses prosemirror.

## [0.2.22] - 2022-10-19
### Added
- Compendium items.
- Encumbrance dropdown in inventory tab.
- Encumbrance effects.
### Changed
- Decreased actor sheet height.
- Adjusted actor sheet stat alignments.
- Fixed capitalization of Great Sword.
### Fixed
- Spells are sorted by level, then name.

## [0.2.21] - 2022-10-13
### Added
- Compendium items.
- Defense die choice in defense dialogs.
- Ranged defense option in defense dialog.
### Changed
- Replaced Fighter class icon.
- Defensive fighting option is only offered in combat.
### Fixed
- Attack rolls work outside of combat, again.

## [0.2.20] - 2022-10-12
### Added
- Compendium items.
- Fighting Withdrawl special move.
- Charge status effect/special move.
- Defensive Fighting status effect.
### Changed
- Improved formatting on dialog forms.

## [0.2.19] - 2022-10-09
### Added
- Compendium items.
- Set for Charge weapon capability.
- Aggressively Attacked status effect/special move.
### Changed
- Set for Charge capability set on weapons compendium.
- Status effect names are in past tense.
- Gave Ground and Scampered Back toggle off after actor makes an attack.

## [0.2.18] - 2022-09-26
### Added
- Compendium items.
- Give Ground status effect/special move.
- Scamper Back status effect/special move.
### Changed
- Magic always uses combat encounter's round for timing purposes.
- Spell chat cards are more explicit about weapon resets.

## [0.2.17] - 2022-09-09
### Added
- Compendium items.
- Spell Fatigue status effect.
- Full Parry status effect/special move.
- Status effects auto apply/delete.
### Fixed
- Weapon capabilities could bleed to other weapons under certain circumstances.

## [0.2.16] - 2022-09-05
### Added
- Compendium items.
### Fixed
- Character class hp reroll tracking (v10 regression)

## [0.2.15] - 2022-09-04 [YANKED]
### Added
- Compendium items.
- Foundry v10 API support.
### Removed
- Foundry v9 API support.
### Changed
- Changed default item icon.
### Fixed
- Auto ToP checks were not using beast trauma saves.

## [0.2.14] - 2022-06-05
### Added
- Compendium items.
### Changed
- Movement speed setup for beasts field size increase.
### Fixed
- Spurious speed results in spell cards when not in combat.
- Broken scrollbars and ugly priors under mozilla.

## [0.2.13] - 2022-05-24
### Added
- Casting gives an option to hide spell chat cards (defaults to 'on' for NPCs).
### Changed
- Time cards for non-visible actors are no longer sent to the entire table.
### Fixed
- Beast auto-trauma was not completing correctly.
- Overflow on spell dialog for certain strings.

## [0.2.12] - 2022-05-20
### Added
- Spellcasting advances actor clocks.
- Fatigue duration bonus modifier.
### Fixed
- Race movement speed wasn't filtering properly to character actors.
- Spell sort now prioritizes level over name.
- No longer able to spend spell points into the negative.

## [0.2.11] - 2022-05-16
### Added
- Racial move speed modifiers.
- Beast move speeds.
- Armor move speed modifiers (jog+ movement rates).
- Native Drag Ruler support.
### Changed
- Updated race compendium for movement speeds.
- Updated armor compendium for movement speeds.
### Fixed
- New characters were built incorrectly while more than one GM was present.
- Ability scores added incorrectly in certain cases.
 
## [0.2.10] - 2022-05-13
### Added
- Dialog buttons which advance clock will display seconds to be advanced.
- Ranged weapons include a full timing breakdown.
- Compendium items.
### Changed
- Updated weapon compendium for ranged weapon timings.
- Improved attack dialog formatting.
### Fixed
- Cleared token dependency on actor embedded items.
- Items with overly long names no longer distort their cards.

## [0.2.9] - 2022-05-08
### Added
- Chat is alerted to initiative auto-updates.
- Ability checks can critically fail.
- Class/Weapon support for backstabs and fleeing opponents specials.
- Attack chat cards report special moves like the damage cards.
- Compendium items.
### Changed
- Updated class sheets.
### Fixed
- Attack cards display jab speed for weapons which can jab.

## [0.2.8] - 2022-05-05
### Added
- Honor category autoselect.
- Fame category autoselect.
- Jab combat maneuvers.
- Compendium items.
### Changed
- Weapon quality is now part of base vector.
- Character sheet ui enhancements.
- Updated attack macro for jab support.
- Updated weapons compendium for jab support.
### Fixed
- Actors without a trauma save no longer trigger trauma alerts/saves.

## [0.2.7] - 2022-04-28
### Fixed
- Spellcast ui regression.

## [0.2.6] - 2022-04-27 [YANKED]
### Added
- Can specify skill check difficulty.
- Language hotbar macros.
- Compendium items.
### Changed
- Attack dialogs now specify weapon speed and only offer range mods for ranged weapons.
- Minimum weapon speed by size category is respected.

## [0.2.5] - 2022-04-22
### Added
- Skills and inventory now scroll.
- Added results to trauma save.
- rollMode query in save dialogs.
- Compendium items.
- Combat tracker will allow you to choose an init of 1 instead of rolling.
- Attacks can auto-advance init table.
### Changed
- Removed button property from innate weapons on inventory list.
### Fixed
- Beasts receive poison save from trauma save.
- Non-token actors are able to attack, again.
- system.json wrong media type.

## [0.2.3] - 2022-04-18
### Added
- Alert when new wound damage exceeds ToP.
- Automatic (private) trauma rolls for beast actors.
- Compendium items.
### Changed
- Defense results on a nat 1 were misleading.
### Fixed
- Beasts no longer break if they have a language object.
- Beasts receive bonus spellpoints as they should.
- Attack macro offers range args if attacker has any ranged weapons.
- Smarter inventory and spell sorting.

## [0.2.2] - 2022-04-15
### Added
- Skill macros.
- rollMode query in skill dialogs.
- Compendium items.
### Changed
- Switched canvas font to Gentium Book.
- Added scroll bar to wound list.
- Removed skill mods in favor of skill bonuses. Positive is good, regardless of the type of roll.

## [0.2.1] - 2022-04-13
### Fixed
- Beast sheet formatting.
### Added
- Functional biography section.

## [0.2.0] - 2022-04-12
### Added
- Initial release.
