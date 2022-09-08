# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
 - Functional Spell Fatigue status effect.
 - Status effects auto apply/delete.

## [0.2.16] - 2022-09-05
### Added
- Compendium items.
### Fixed
- Character class hp reroll tracking (v10 regression)

## [0.2.15] - 2022-09-04
### Added
- Compendium items.
### Changed
- Foundry v10 API support.
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

## [0.2.6] - 2022-04-27
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
