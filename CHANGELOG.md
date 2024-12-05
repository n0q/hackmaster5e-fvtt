# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
## Added
- Attack/Defend/Damage macros now remember your last used weapon.

## Changed
- Updated Thief class backstab damage to errata.

## Fixed
- Cleric spells are unprepared after casting, again.
- Beast spellcasting is hidden from players, again.

## [0.4.24] - 2024-10-28
## Added
- Can drop items directly onto tokens.

## Changed
- Cleaned up skill roll chat cards.
- Spell rolls now display volatility and save results simultaneously.

## [0.4.23] - 2024-10-14
## Fixed
- Skill rolls display dice rolled.

## [0.4.22] - 2024-10-13
## Changed
- Skill rolls now display check and opposed results simultaneously.
- Swapped Literacy and Verbal dialog button positions.

## Fixed
- Elevation Ruler displays appropriate color banding, again.
- Ranged weapons no longer offered reset to half speed.

## [0.4.21] - 2024-08-15
## Added
- Improved Elevation Ruler support.
  - Known Issue: Colors are inaccurate for heavy armor wearers.

## Changed
- Combined alerts and rolls for Beast Tenacity and Trauma checks.
- Reset Weapon Count renamed to Reset Count to Half

## Fixed
- Reset Count to Half no longer observes minimum weapon speeds.

## [0.4.20] - 2024-08-07
### Added
- Reset Weapon Count shifts actor init to half weapon speed.
- Tenacity alerts and auto-saves.

### Fixed
- Blind rolls were not always coming up blind.

## [0.4.19] - 2024-07-28
### Added
- Elevation Ruler native support.

### Fixed
- No longer possible to have a null qty of coins.
- New currency items use proper default image again.
- New armor was not instantiating under some circumstances.

### Removed
- DevMode native support.

## [0.4.18] - 2024-07-22
### Changed
- Improved spell library logic.

### Fixed
- Spell Point totals subtract while casting, again (oops).

## [0.4.17] - 2024-06-22
### Fixed
- Permanent status effect timing issues.

## [0.4.16] - 2024-06-21
### Fixed
- Spell fatigue timing issues.

## [0.4.15] - 2024-06-21
### Fixed
- Spell fatigue timing issues for v11.

## [0.4.14] - 2024-06-21 [YANKED]
### Fixed
- Spell fatigue timing issues.

## [0.4.13] - 2024-06-19
### Changed
- Extended trauma checks now specify 'Coma Check' instead of 'Comatose Check'.
- Improved trauma check chat cards.
- Automatic ToP checks now specify beast token name.

### Fixed
- Reach visiblity logic.
- Comatose results on trauma checks used KO duration formula.

## [0.4.12] - 2024-06-18
### Added
- Critical hits alert for invalid crits.

### Changed
- Critical hits specify Primary or Secondary side, rather than Right or Left.

### Fixed
- Ability checks display calling actor, again.
- Corrected damage allocation logic.

## [0.4.11] - 2024-06-15
### Added
- Foundry v12 API support.
- Ability Checks correctly declare passes, fails, crit fails, and fumbles.

### Changed
- Changed button labels on ability checks to be (even) more clear.
- Removed Drag Ruler from recommended module list until it is v12 compatible.

### Fixed
- Race items failed to validate under certain circumstances.

### Removed
- Foundry v11 API support.

## [0.4.10] - 2024-06-02
### Added
- Fatigue Factor rating to armors.
- Added fatigue factor rating to armors in basic compendium.

### Changed
- Revamped armor sheet.
- Removed shield checkbox in favor of armortype.
- Changed button labels on ability checks to (hopefully) be more clear.

### Fixed
- Ranged weapon timers summed incorrectly in weapon sheets.
- Beasts with no ToP auto-saving against trauma.

## [0.4.9] - 2024-04-20
### Fixed
- Shield issues.

## [0.4.8] - 2024-04-20
### Fixed
- Skill checks via macro.

## [0.4.7] - 2024-04-19
### Fixed
- Combats potentially broken under some circumstances.

## [0.4.6] - 2024-04-11
### Added
- Wounds can have notes, which are displayed on the wound tracker.
- Intelligence dropdown for beast Actors.
- Racial bonus to spell volatility failure checks.
- Racial BMI breakpoints for being overweight or obese.
- Spell Volatility Save autocalc.

### Changed
- "Treated" marker now only displays if a wound is untreated.
- Sex is speficied by dropdown, rather than an open string.
- Character race cards no longer display bonuses with a value of zero.

### Fixed
- Under certain circumstnaces, non-visible threat range anims viewable by users.

## [0.4.5] - 2024-03-30
### Added
- Armor damage can be specified when wounding an actor or token.
- Wounds track treatment status and projectile embeds.
- Actor tracks overall number of projectile embeds.

### Changed
- Wounds auto-remove after hitting 0 HP if there is no embedded projectile.
- New wound tracker with embedded arrow tabulation.
- Replaced old wound macro with a new one (Please update your macros).

### Fixed
- Weapon speed proficiency can no longer be a positive value
- Tokens with 'secret' disposition no longer display threat/reach to non-owners.
- Fix for chrome scrollbar changes.

## [0.4.4] - 2024-01-16
### Fixed
- Spell volatility stage ramped up to Overamped 1 SP too soon.

### Changed
- Reorganized skill chat cards.

## [0.4.3] - 2024-01-16
### Added
- Blind status effect now correctly supplies a -8 malus on a token's attack and defense.
- Damage class bonus.
- Spell volatility rating, check, and max mishap tier autocalculation on spell cards.
### Changed
- Blind status effect no longer prevents user from seeing the map while token is selected.
- Innate weapon minimum speed is universally 1, ignoring weapon size.
### Fixed
- Fumble table inaccuracy.
- Modifying actor hp via token hud is no longer so janky.

## [0.4.2] - 2024-01-13
### Added
- Free caster (read: Rogues) spell fatigue duration increased from 5 to 10 seconds.
- Statblock generator macro.
- Tooltips added to Character Class items.
### Changed
- Folded Combat Macros compendium into more generalized Hackmaster Macros compendium.
- Style sheet improvements.
### Fixed
- Spell list order no longer skips around under certain circumstances.

## [0.4.1] - 2023-10-23
### Added
- Hybrid spell casting saves.
- Skill cards display mastery level.
### Changed
- Skill card formatting.
- Class card formatting.

## [0.4.0] - 2023-09-20
### Added
- Token base display.
- Token base size to race cards.
- Setting to disable token threat/reach/base display.
### Changed
- All temporary status effects are removed from combatants at conclusion of combat.
- Drag Ruler module is recommended upon system install.
- Set Halfling base token size to Small.
- Improved reach display culling.
- Increased hovered token's reach display visibility;
### Fixed
- Exceeding heavy encumbrance no longer glitches character.
- Compendium inaccuracies.
- Effect duration display showed spurious results under certain circumstances.
- Snapshots timer is accurate to the book.
- Attack cards no longer display jab speed for ranged weapons.
- Weapon reach/threat ranges were not displayed while actively dragging a token owned by another user.
- Scene crash when drawing reach for a token without an actor.

## [0.3.34] - 2023-09-13
### Changed
- Tweaked language ui.
### Fixed
- Inconsistency in class level display formatting.
- Fractional or negative coin counts.
- ToP now rounds up, instead of down.
- Jab damage auto-calculated even if a damage code was specified.
- Fractional or negative armor damage.

## [0.3.33] - 2023-07-30
### Added
- Can change Language name on character sheet.
### Changed
- Increased spacing for currency inputs via inventory tab.
### Fixed
- Scrollbars appearing for certain character tabs when they shouldn't.

## [0.3.32] - 2023-07-12
### Removed
- Foundry v10 API support.
### Changed
- Basic compendium converted to use v11 compendium folders.
- Removed hyphen from Class and Level display in header for clarity.
### Fixed
- New currency items generated errors for unprivileged users.
- Status timers were not working correctly under v11.
- Character sheet tabbed section scrolls if user's screen height cannot display the full sheet at once.

## [0.3.30] - 2023-07-07
### Fixed
- Issue with Currency Items breaking after updating the game without restarting Foundry.

## [0.3.29] - 2023-07-04
### Added
- Currency items.
- New Currency button on inventory tab.
- Carried/Total currency is displayed on inventory tab.
- Currency weight global setting.
### Changed
- Moved New Item button to upper left corner of inventory (was upper right).
- Tweaks to inventory sorting.
- Style sheet improvements.
### Fixed
- Item ids could randomize during certain container operations.

## [0.3.28] - 2023-06-12
### Changed
- Child item ids are randomized on item creation.
### Fixed
- v11: Under some circumstances, armor effects could double during combat.
- Dragruler reach levels were occasionally inaccurate.
- Reach View toggle no longer displays reach of non-visible tokens.

## [0.3.27] - 2023-06-05
### Added
- Line divides NPCs from PCs on init tracker.
- Defeated combatants have a darkened initiative color.
- Init color gentle flashes for player when they are ready to take an action.
### Fixed
- Armor damage generated errors for unpriviledged users.
- Bio tab no longer sticks.

## [0.3.26] - 2023-05-24
### Added
- Hue and Cry! button added to combat tracker.
- Foundry v11 api support.
- Combatants who are ready to act have their inits highlighted.
### Changed
- Combatants now sorted by NPC status and name, rather than initiative.
- Removed extraneous details from combat tracker config.
### Fixed
- Unintended combatant highlighting on initiative table.
- Reach animation tweaks.

## [0.3.25] - 2023-05-21
### Added
- Chat card visual improvements.
- Reach/Threat display animations.
### Changed
- Armor degredation defaults to 'off'.
### Fixed
- Auto-encumbrance generated errors for unpriviledged users.
- DsN dice decay display regression.

## [0.3.24] - 2023-05-18
### Added
- Auto-encumbrance setting.
- Armor damage (Experimental).
### Fixed
- Empty quantity containers displaying a contents of 1.
- Players unable to edit encapsulated items.
- Compendium inaccuracies.
- Under v11, sending a Beast actor to the canvas could cause a crash.

## [0.3.23] - 2023-05-13
### Added
- Inventory containers.
- Quality items get a gold star!
### Changed
- Added containers to gear compendium.
- Total weight is displayed for items with qty greater than one.
### Fixed
- Weapon profiles were not generated for classless Character Actors.
- Quality ranged weapons now add to damage (previously attack) roll.
- Long item names could cause stylesheet blowout in inventory tab.
- Ranged defense using weapon's selected defense die.

## [0.3.22] - 2023-04-08
### Changed
- 'Universal Skills' header is omitted when character actor has even number of uskills.
### Fixed
- DsN displays penetration dice decay.
- Threat range correction for scenes with square grids.
- Weapon talents could fail to function under certain circumstances.
- Typos.

## [0.3.21] - 2023-04-04
### Added
- Class option for receiving half penalty for non-proficient weapon use.
- Class option for bonus HP.
### Changed
- Character Actor sheet display improvements.
### Fixed
- Under certain circumstances, talents could interact with other talents.
- Compendium inaccuracies.

## [0.3.20] - 2023-02-21
### Fixed
- Snapshot timing no longer accounts for draw time.
- Fumble/Crit QoL improvements.

## [0.3.19] - 2023-02-12
### Added
- Fumble complications due to strains/sprains.
### Changed
- Autofocus on fumble dialogs.
### Fixed
- Fumbles no longer default to innate tables.
### Removed
- Cut recursive functionality from fumble tables.

## [0.3.18] - 2023-02-08
### Added
- Fumble macro.

## [0.3.16] - 2023-01-22
### Changed
- Skill macros respect smart select.
### Fixed
- Status icon improperly rendered under Firefox.
- Beast autoToP regression.
- Race movement speed display blow-out in some situations.
- Extended character width of ability scores to 3.
- Minimum ability score is now 1/01.

## [0.3.15] - 2023-01-20
### Added
- Dishonorable characters are properly punished.
### Removed
- Fractional ability score racial modifiers.
### Fixed
- Character class card display issue.

## [0.3.14] - 2023-01-17
### Added
- Priority field for effect talents.
- Improved caster talent support.
- ToP Penetration class feature.
### Changed
- Damage cards specify ToP Penetration.
- Wound dialogs request ToP Penetration level.
- Updated Inflict Wound macro to handle ToP penetration across multiple tokens.

## [0.3.13] - 2023-01-13
### Added
- Character Class option for free mage spell casting.
- Effects tab for Character Actors.
### Fixed
- Extended trauma results for Tough as Nails.

## [0.3.12] - 2023-01-08
### Fixed
- ToP save crits fails functioning again.

## [0.3.11] - 2023-01-08
### Added
- Beast EP Value.
- Limited support for non-weapon talents (more to come).
- Compendium items.
### Changed
- New combatant initiative adjusted by current init count.
- Dodge is toggled on by default for dodge-capable actors.
### Fixed
- Damage cards listed jab speed for weapons without jab.
- Offered fleeing opponent attack to defenders.

## [0.3.10] - 2023-01-03
### Changed
- Talents store their effects when turned into weapon talents.
### Fixed
- Actor talents properly add to weapon talents.
- No longer offer backstab dmg to ranged weapons.
- Ranged weapon strength damage logic.

## [0.3.9] - 2023-01-01
### Added
- d10p defense die.
- Limited support for non-weapon talents (more to come).
- Compendium items.
- Documentation compendium.
### Changed
- Backstab-capable characters are offered backstab damage regardless of weapon type.
- Compendium inaccuracies.
### Fixed
- Error messages when adding innate weapons.
- Broken jab and (hopefully) reach display in chat logs.
- Under some circumstances, backstab damage could display in weapon stat breakdown.

## [0.3.8] - 2022-12-28
### Fixed
- Skill macro generation.

## [0.3.7] - 2022-12-27
### Changed
- Improved logic for applying strength bonus to non-mechanical ranged weapons.
### Fixed
- Innate weapons items could be misplaced in some circumstances.
- Using a ranged weapon without proficiency no longer penalizes defense or damage.

## [0.3.6] - 2022-12-22
### Added
- Compendium items.
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
