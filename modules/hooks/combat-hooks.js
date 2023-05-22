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

    static renderCombatTrackerConfig(config, html) {
        const formEl = $(html).find('div').has('input[type="checkbox"]');
        const {position} = config;
        position.height -= formEl.outerHeight();
        config.setPosition(position);
        formEl.remove('div');
    }

    static renderCombatTracker(_tracker, html) {
        function removeTurnControls(combatDocument) {
            if (!combatDocument.find('[data-control=\'nextTurn\']').length) return;
            combatDocument.find('[data-control=\'nextTurn\']').each((_, el) => el.remove());
            combatDocument.find('[data-control=\'previousTurn\']')[0].remove();
            combatDocument.find('.active').removeClass('active');
        }

        function DoubleclickSetsInitiative(combatDocument) {
            combatDocument.find('.token-initiative').off('dblclick').on('dblclick', onInitiativeDblClick);
            combatDocument.find('#combat-tracker li.combatant').each((_, el) => {
                if (el.classList.contains('active')) return;
                el.classList.add('turn-done');
            });
        }

        removeTurnControls(html);
        DoubleclickSetsInitiative(html);
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
