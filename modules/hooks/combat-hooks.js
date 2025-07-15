import { SYSTEM_ID } from '../tables/constants.js';
import { HMSocket, SOCKET_TYPES } from '../sys/sockets.js';
import { getLastMovedDistance } from '../integrations/elevationruler.js';

export class HMCombatHooks {
    static async updateCombat(combat, _roundData, _, userId) {
        if (userId !== game.userId) return;

        const combatants = combat.turns;
        combatants.forEach((combatant) => {
            const { token } = combatant;

            // elevation ruler support
            if (foundry.utils.hasProperty(token, 'flags.elevationruler')) {
                token.prevLastMovedDistance = getLastMovedDistance(token, combat.round);
            }

            // Toggle status effects on/off based on their timers.
            const effects = combatant.actor.effects.filter((y) => y.isTemporary === true);
            effects.map(async (effect) => {
                const { remaining, startRound } = effect.duration;

                // effects without a duration have duration.remaining set to null.
                if (remaining === null) return;

                const started = startRound <= combat.round;
                if ((!started && !effect.disabled)                    // Case 1: Before effect
                    || (started && remaining && effect.disabled)      // Case 2: During effect
                    || (started && !remaining && !effect.disabled)) { // Case 3: After effect
                    await effect.update({ disabled: !effect.disabled });

                    token._object.drawReach();
                    const { tokenId } = combatant;
                    HMSocket.emit(SOCKET_TYPES.DRAW_REACH, tokenId);

                    if (effect.disabled) effect._displayScrollingStatus(false);
                }
            });
        });
    }

    static async createCombatant(combatant) {
        const token = combatant.token.object;
        token.animReachOpen();
    }

    static deleteCombatant(combatant) {
        const token = combatant.token?.object;
        if (token) token.animReachClose();
    }

    static async preDeleteCombat(combat) {
        const combatants = combat.turns;

        combatants.forEach((c) => {
            const { actor } = c;
            const effects = actor.effects.filter((fx) => fx.isTemporary);
            const effectIds = effects.map((fx) => fx.id);
            actor.deleteEmbeddedDocuments('ActiveEffect', effectIds);
        });
    }

    static deleteCombat(combat) {
        [...combat.combatants].forEach((c) => c.token.object.animReachClose());
    }

    // Track if combatant's init ever changes, for hue and cry.
    static preUpdateCombatant(combatant, delta, opts, userId) {
        if (game.userId !== userId) return;
        const acted = combatant.getFlag(SYSTEM_ID, 'acted');
        const { initiative } = combatant;
        if (!initiative || acted) return;

        if (delta.initiative && initiative !== delta.initiative) {
            combatant.setFlag(SYSTEM_ID, 'acted', true);
        }
    }

    static renderCombatTrackerConfig(config, html) {
        const formEl = $(html).find('div').has('input[type="checkbox"]');
        const { position } = config;
        position.height -= formEl.outerHeight();
        config.setPosition(position);
        formEl.remove('div');
    }

    // TODO: Optimize to do more with fewer searches.
    static renderCombatTracker(tracker, html) {
        doubleClickSetsInitiative(html);
        if (!tracker.viewed?.round) return;

        removeTurnControls(html);
        removeActiveClass(html);
        addHACControl(html);
        highlightInit(html);

        drawDivider(html);
        tracker.setPosition();

        function drawDivider(domObj) {
            const { active } = game.combats;
            let wasNPC = true;
            const combatantElements = domObj.getElementsByClassName('combatant');

            for (let i = 0; i < combatantElements.length; i++) {
                const el = combatantElements[i];
                const { isNPC } = active.combatants.get(el.getAttribute('data-combatant-id'));

                if (isNPC && !wasNPC) {
                    const divider = document.createElement('hr');
                    divider.className = 'npc-divider';
                    el.before(divider);
                    break;
                }

                wasNPC = isNPC;
            }
        }

        function removeTurnControls(domObj) {
            const nextTurnControls = domObj.querySelectorAll('[data-action="nextTurn"]');
            if (nextTurnControls.length === 0) return;
            nextTurnControls.forEach((el) => el.remove());
            domObj.querySelector('[data-action="previousTurn"]').remove();
        }

        function removeActiveClass(domObj) {
            domObj.querySelectorAll('.combatant.active').forEach((el) => {
                el.classList.remove('active');
                el.classList.add('turn-done');
            });
        }

        function doubleClickSetsInitiative(domObj) {
            domObj.querySelectorAll('.token-initiative').forEach((el) => {
                el.removeEventListener('dblclick', onInitiativeDblClick);
                el.addEventListener('dblclick', onInitiativeDblClick);
            });

            domObj.querySelectorAll('#combat-tracker li.combatant').forEach((el) => {
                if (el.classList.contains('active')) return;
                el.classList.add('turn-done');
            });
        }

        function addHACControl(domObj) {
            const controlDiv = domObj.querySelector('.control-buttons.left.flexrow');

            const hacButton = document.createElement('button');
            hacButton.setAttribute('type', 'button');
            hacButton.className = 'inline-control combat-control icon fa-solid fa-megaphone';
            hacButton.setAttribute('data-tooltip', 'COMBAT.HueAndCry');
            hacButton.setAttribute('data-action', 'doHueAndCry');

            controlDiv.prepend(hacButton);
        }

        function highlightInit(domObj) {
            const { round } = tracker.viewed;
            const initiativeRows = domObj.getElementsByClassName('initiative');

            for (let i = 0; i < initiativeRows.length; i++) {
                const row = initiativeRows[i];
                const initiativeValue = parseInt(row.textContent, 10);

                // eslint-disable-next-line no-continue
                if (initiativeValue > round) continue;

                row.classList.add('ready-to-act');

                const li = row.closest('li');
                const combatantId = li.getAttribute('data-combatant-id');
                const { combatants } = game.combats.active;
                const combatant = combatants.get(combatantId);

                // eslint-disable-next-line no-continue
                if (!combatant.isOwner || game.user.isGM) continue;

                const orange2 = '#ff6400';
                const orange1 = '#ffa660';
                game.gsap.to(row, {
                    duration: 1,
                    repeat: -1,
                    yoyo: true,
                    color: [orange1, orange2],
                    textShadow: [`0 0 7px ${orange1}`, `0 0 5px ${orange2}`],
                });
            }
        }
    }
}

function onInitiativeDblClick(event) {
    event.stopPropagation();
    event.preventDefault();
    const html = $(event.target).closest('.combatant');
    const cid = html.data('combatant-id');
    const combatant = game.combat.combatants.get(cid);
    if (!combatant.isOwner) return;

    const initiative = html.find('.token-initiative');
    const input = $(`<input type="number" class="initiative" value="${combatant.initiative}"/>`);
    initiative.off('dblclick');
    initiative.empty().append(input);
    input.focus().select();
    input.on('change', () => combatant.update({ _id: cid, initiative: input.val() }));
    input.on('focusout', () => game.combats.render());
}
