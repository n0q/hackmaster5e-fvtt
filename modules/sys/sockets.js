import { SYSTEM_SOCKET } from '../tables/constants.js';

export class HMSocket {
    static async emit(type, data) {
        if (!game.socket) return;

        const msg = {type, data, userId: game.userId};
        await game.socket.emit(SYSTEM_SOCKET, msg);
    }

    static drawReach(tokenId) {
        game.canvas.tokens.get(tokenId).drawReach();
    }

    static renderApps() {
        const apps = game.actors.reduce((acc, actor) => ({...acc, ...actor.apps}), {});
        Object.keys(apps).forEach((key) => {
            apps[key].document.prepareData();
            apps[key].render();
        });
    }
}

export const SOCKET_TYPES = {
    DRAW_REACH:     0,
    RENDER_APPS:    1,
};

export const handleSocketEvent = ({type, data, userId}) => {
    if (type === SOCKET_TYPES.DRAW_REACH) HMSocket.drawReach(data, userId);
    if (type === SOCKET_TYPES.RENDER_APPS) HMSocket.renderApps(data, userId);
};
