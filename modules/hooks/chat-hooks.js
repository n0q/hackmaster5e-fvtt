export class HMChatHooks {
    static async renderChatMessage(_app, html) {
        if (html.find('.noWhisper')) html.find('.whisper-to').remove();

        if (!html.find('.hm-chat-note').length) return;

        html.css('padding', '0px');
        html.find('.message-sender').text('');
        html.find('.message-metadata')[0].style.display = 'none';
        if (!game.user.isGM) html.find('.message-delete').remove();
    }
}
