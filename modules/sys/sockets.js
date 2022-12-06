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
};

function drawReach(tokenId) {
    game.canvas.tokens.get(tokenId).drawReach();
}

export const handleSocketEvent = ({type, data, userId}) => {
    if (type === SOCKET_TYPES.DRAW_REACH) drawReach(data, userId);
};
