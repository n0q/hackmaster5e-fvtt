export class HMChatHooks {
    /** @inheritdoc */
    static renderChatMessageHTML(message, html, _context) {
        if (!html) return;
        HMChatHooks._modifyChatNote(html);
        HMChatHooks._addTokenDataAttributes(message, html);
        HMChatHooks._addTokenHoverListeners(message, html);
    }

    /**
     * Adjusts initNote card HTML to look more pleasing.
     * Removes whisper-list (in case more than one GM is on).
     *
     * @param {HTMLElement} html - The pending HT2yyML.
     * @returns {void}
     */
    static _modifyChatNote(html) {
        if (html.querySelector(".noWhisper")) {
            const whisperToElements = html.querySelectorAll(".whisper-to");
            whisperToElements.forEach(el => el.remove());
        }

        const headerElement = html.querySelector("header");
        if (headerElement) headerElement.remove();

        if (!html.querySelector(".hm-chat-note")) return;

        html.style.padding = "0px";

        const sender = html.querySelector(".message-sender");
        if (sender) sender.textContent = "";

        const metadata = html.querySelector(".message-metadata");
        if (metadata) metadata.style.display = "none";

        if (!game.user.isGM) {
            const deleteButtons = html.querySelector(".message-delete");
            deleteButtons.button.remove();
        }
    }

    /**
     * Applies speaker information to the message's root element.
     *
     * @param {ChatMessage} message - The ChatMessage document being rendered.
     * @param {HTMLElement} html - The pending HT2yyML.
     * @returns {void}
     */
    static _addTokenDataAttributes(message, html) {
        const { speaker } = message;
        const element = html[0] || html;

        element.setAttribute("data-token-id", speaker.token);
        element.setAttribute("data-actor-id", speaker.actor);
        element.setAttribute("data-scene-id", speaker.scene);
        element.classList.add("hm-chat-with-token");
    }

    /**
     * @param {ChatMessage} message - The ChatMessage document being rendered.
     * @param {HTMLElement} html - The pending HT2yyML.
     * @returns {void}
     */
    static _addTokenHoverListeners(message, html) {
        const { token, scene } = message.speaker;
        const element = html[0] || html;

        element.addEventListener("mouseenter", () => {
            HMChatHooks.highlightToken(token, scene, true);
        });

        element.addEventListener("mouseleave", () => {
            HMChatHooks.highlightToken(token, scene, false);
        });
    }

    /**
     * Highlights or unhighlights a token
     *
     * @param {string} tokenId - Token ID to highlight
     * @param {string} sceneId - Scene ID containing the token
     * @param {boolean} highlight - Highlight or unhighlight?
     */
    static highlightToken(tokenId, sceneId, highlight) {
        if (sceneId !== canvas.scene?.id) return;

        const token = canvas.tokens.get(tokenId);
        if (!token) return;

        if (!highlight) {
            if (token._chatHoverBorder) token._chatHoverBorder.clear();
            return;
        }

        const BORDER_WIDTH = 5;
        const dispositionColor = token.getDispositionColor();

        if (!token._chatHoverBorder) {
            token._chatHoverBorder = new PIXI.Graphics();
            token.addChild(token._chatHoverBorder);
        }

        const border = token._chatHoverBorder;
        border.clear();
        border.lineStyle(BORDER_WIDTH, dispositionColor, 1);
        border.drawRect(-2, -2, token.w + 4, token.h + 4);
    }
}
