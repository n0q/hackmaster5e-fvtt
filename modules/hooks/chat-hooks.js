export class HMChatHooks {
    /* eslint-disable no-param-reassign */
    static async renderChatMessage(_obj, html) {
        if (!html) return;

        if (html.querySelector('.noWhisper')) {
            const whisperToElements = html.querySelectorAll('.whisper-to');
            whisperToElements.forEach((el) => el.remove());
        }

        if (!html.querySelector('.hm-chat-note')) return;

        html.style.padding = '0px';

        const sender = html.querySelector('.message-sender');
        if (sender) sender.textContent = '';

        const metadata = html.querySelector('.message-metadata');
        if (metadata) metadata.style.display = 'none';

        if (!game.user.isGM) {
            const deleteButtons = html.querySelector('.message-delete');
            deleteButtons.button.remove();
        }
    }
    /* eslint-enable no-param-reassign */
}
