import { SYSTEM_SOCKET } from '../tables/constants.js';

export class HMSocket {
    static async emit(type, data) {
        if (!game.socket) return;

        const msg = {type, data, userId: game.userId};
        await game.socket.emit(SYSTEM_SOCKET, msg);
    }
}

export const SOCKET_TYPES = {
    DRAW_REACH: 0,
    RENDER_ACTORS: 1,
};

export const handleSocketEvent = ({type, data, userId}) => {
    if (type === SOCKET_TYPES.DRAW_REACH) drawReach(data, userId);
    if (type === SOCKET_TYPES.RENDER_APPS) renderApps(data, userId);
};

function drawReach(tokenId) {
    game.canvas.tokens.get(tokenId).drawReach();
}

function renderApps() {
    const apps = game.actors.reduce((acc, actor) => ({...acc, ...actor.apps}), {});
    Object.keys(apps).forEach((key) => apps[key].render());
}
