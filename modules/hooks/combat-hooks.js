import { SYSTEM_ID } from '../tables/constants.js';
import { HMSocket, SOCKET_TYPES } from '../sys/sockets.js';

export class HMCombatHooks {
    static async updateCombat(combat, _roundData, _, userId) {
        if (userId !== game.userId) return;

        const combatants = combat.turns;
        combatants.forEach((combatant) => {
            // Toggle status effects on/off based on their timers.
            const effects = combatant.actor.effects.filter((y) => y.isTemporary === true);
            effects.map(async (effect) => {
                const {remaining, startRound} = effect.duration;
                const started = startRound <= combat.round;
                if ((!started &&               !effect.disabled)        // Case 1: Before effect
                  || (started &&  remaining &&  effect.disabled)        // Case 2: During effect
                  || (started && !remaining && !effect.disabled)) {     // Case 3: After effect
                    await effect.update({disabled: !effect.disabled});
                    combatant.token._object.drawReach();
                    const {tokenId} = combatant;
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
        const token = combatant.token.object;
        token.animReachClose();
    }

    static async preDeleteCombat(combat) {
        const combatants = combat.turns;

        combatants.forEach((x) => {
            const effects = x.actor.effects.filter((y) => y.isTemporary
                                                       && y.disabled);
                                                    // && y.duration.combat.id === combat.id);
            effects.forEach((effect) => x.actor.deleteEmbeddedDocuments('ActiveEffect', [effect.id]));
        });
    }

    static deleteCombat(combat) {
        [...combat.combatants].forEach((c) => c.token.object.animReachClose());
    }

    // Track if combatant's init ever changes, for hue and cry.
    static preUpdateCombatant(combatant, delta, opts, userId) {
        if (game.userId !== userId) return;
        const acted = combatant.getFlag(SYSTEM_ID, 'acted');
        const {initiative} = combatant;
        if (!initiative || acted) return;

        if (delta.initiative && initiative !== delta.initiative) {
            combatant.setFlag(SYSTEM_ID, 'acted', true);
        }
    }

    static renderCombatTrackerConfig(config, html) {
        const formEl = $(html).find('div').has('input[type="checkbox"]');
        const {position} = config;
        position.height -= formEl.outerHeight();
        config.setPosition(position);
        formEl.remove('div');
    }

    // TODO: Optimize to do more with fewer searches.
    static renderCombatTracker(tracker, html) {
        const rootEl = html.get(0);
        doubleClickSetsInitiative(rootEl);
        if (!tracker.viewed?.round) return;
        removeTurnControls(rootEl);
        removeActiveClass(rootEl);
        addHACControl(rootEl);
        highlightInit(rootEl);
        drawDivider(rootEl);

        function drawDivider(domObj) {
            const {active} = game.combats;

            let wasNPC = true;
            const firstNPC = Array.from(domObj.querySelectorAll('.combatant')).find((el) => {
                const cId = el.getAttribute('data-combatant-id');
                const {isNPC} = active.combatants.get(cId);
                if (isNPC && !wasNPC) return true;
                wasNPC = isNPC;
                return false;
            });

            if (firstNPC) {
                const divider = document.createElement('hr');
                divider.className = 'npc-divider';
                firstNPC.before(divider);
            }
        }

        function removeTurnControls(domObj) {
            domObj.querySelectorAll('[data-control="nextTurn"]').forEach((el) => el.remove());
            domObj.querySelector('[data-control="previousTurn"]').remove();
            domObj.querySelector('.active').classList.remove('active');
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
            const title = domObj.querySelector('h3.encounter-title');
            title.style.marginLeft = '0';

            const hacButton = document.createElement('a');
            hacButton.className = 'combat-button combat-control';
            hacButton.setAttribute('data-tooltip', 'COMBAT.HueAndCry');
            hacButton.setAttribute('data-control', 'doHueAndCry');
            hacButton.innerHTML = '<i class="fas fa-megaphone"></i>';

            title.parentNode.insertBefore(hacButton, title);

            const combatControls = domObj.querySelectorAll('.combat-control');
            combatControls.forEach((button) => {
                button.addEventListener('click', (ev) => tracker._onCombatControl(ev));
            });
        }

        function highlightInit(domObj) {
            const round = tracker.viewed.round;
            const initiativeRows = domObj.querySelectorAll('.initiative');
            initiativeRows.forEach((row) => {
                if (parseInt(row.innerHTML, 10) <= round) row.classList.add('ready-to-act');
            });
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
