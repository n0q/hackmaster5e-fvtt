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

    static renderCombatTracker(tracker, html) {
        doubleClickSetsInitiative(html);
        if (!tracker.viewed?.round) return;
        removeTurnControls(html);
        addHACControl(html);
        highlightInit(html);

        function removeTurnControls(doc) {
            doc.find('[data-control=\'nextTurn\']').each((_, el) => el.remove());
            doc.find('[data-control=\'previousTurn\']')[0].remove();
            doc.find('.active').removeClass('active');
        }

        function doubleClickSetsInitiative(doc) {
            doc.find('.token-initiative').off('dblclick').on('dblclick', onInitiativeDblClick);
            doc.find('#combat-tracker li.combatant').each((_, el) => {
                if (el.classList.contains('active')) return;
                el.classList.add('turn-done');
            });
        }

        function addHACControl(doc) {
            const title = doc.find('h3.encounter-title');
            title.css('margin-left', '0');
            const hacButton = `
                <a class="combat-button combat-control" data-tooltip="COMBAT.HueAndCry" data-control="doHueAndCry">
                     <i class="fas fa-megaphone"></i>
                </a>`;
            $(hacButton).insertBefore(title);
            doc.find('.combat-control').click((ev) => tracker._onCombatControl(ev));
        }

        function highlightInit(doc) {
            const {round} = tracker.viewed;
            const inits = doc.find('.initiative');
            inits.each((i, row) => {
                if (row.innerHTML <= round) $(row).addClass('ready-to-act');
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
