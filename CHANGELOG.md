# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
- Dialog buttons which advance clock will display seconds to be advanced.
- Ranged weapons include a full timing breakdown.
### Changed
- Updated weapon compendium for ranged weapon timings.
### Fixed
- Cleared token dependency on actor embedded items.
- Cards with overly long names no longer distort list.
- Improved attack dialog formatting.

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
