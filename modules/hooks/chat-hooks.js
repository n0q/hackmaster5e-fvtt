export class HMChatHooks {
    /** @inheritdoc */
    static renderChatMessageHTML(message, html, _context) {
        if (!html) return;
        HMChatHooks._modifyChatNote(html);
        HMChatHooks._addTokenDataAttributes(message, html);
    }

    /**
     * Sets delegated listeners on #chat and #chat-notifications DOM elements.
     * Adds listeners to dynamically created #chat-popout
     *
     * @static
     * @returns {void}
     * @listens mouseenter
     * @listens mouseleave
     */
    static initTokenHoverDelegation() {
        const containers = ["#chat", "#chat-notifications"];
        containers.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) HMChatHooks._addDelegatedTokenListeners(container);
        });

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;

                    // There you are!
                    if (node.id === "chat-popout") {
                        HMChatHooks._addDelegatedTokenListeners(node);
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true });
    }

    /**
     * Adjusts chat card HTML for nicer presentation.
     *
     * @param {HTMLElement} html - The pending HTML.
     */
    static _modifyChatNote(html) {
        if (html.querySelector(".no-whisper")) {
            html.querySelectorAll(".whisper-to").forEach(el => el.remove());
        }

        if (!html.querySelector(".hm-chat-note")) return;

        html.style.padding = "0px";
        html.querySelector("header")?.remove();
        html.querySelector(".message-sender").textContent = "";
        if (html.querySelector(".message-metadata")) {
            html.querySelector(".message-metadata").style.display = "none";
        }

        if (!game.user.isGM) {
            html.querySelector(".message-delete")?.button?.remove?.();
        }
    }

    /**
     * Applies speaker information to the message’s root element.
     *
     * @param {ChatMessage} message - The ChatMessage to apply speaker information to.
     * @param {HTMLElement} html - The pending HTML.
     */
    static _addTokenDataAttributes(message, html) {
        if (!HMChatHooks._canUserReadMessage(message)) return;
        const { speaker } = message;

        html.dataset.tokenId = speaker.token;
        html.dataset.actorId = speaker.actor;
        html.dataset.sceneId = speaker.scene;
        html.classList.add("hm-chat-with-token");
    }

    /**
     * Checks if the current user can read the given message.
     *
     * @param {ChatMessage} message - The ChatMessage to test.
     */
    static _canUserReadMessage(message) {
        if (message.isAuthor) return true;
        if (game.user.isGM) return true;
        if (!message.whisper?.length) return true;
        return message.whisper.includes(game.user.id);
    }

    /**
     * Add delegated mouseenter/mouseleave listeners to a chat container.
     *
     * @param {HTMLElement} container - Chat container element to attach listeners to.
     */
    static _addDelegatedTokenListeners(container) {
        const handler = (event, highlight) => {
            const target = event.target.closest("[data-token-id][data-scene-id]");
            if (!target) return;

            const messageElement = target.closest(".message");
            if (!messageElement) return;

            const messageId = messageElement.dataset.messageId;
            const message = game.messages.get(messageId);
            if (!message || !HMChatHooks._canUserReadMessage(message)) return;

            HMChatHooks.highlightToken(
                target.dataset.tokenId,
                target.dataset.sceneId,
                highlight
            );
        };

        container.addEventListener("mouseenter", e => handler(e, true), true);
        container.addEventListener("mouseleave", e => handler(e, false), true);
    }

    /**
     * Highlights or unhighlights a token in the current scene.
     *
     * @param {string} tokenId - id of the token to highlight.
     * @param {string} sceneId - id of the scene containing the tken.
     * @param {boolean} highlight - True if we're highlighting the token. Otherwise false.
     */
    static highlightToken(tokenId, sceneId, highlight) {
        if (sceneId !== canvas.scene?.id) return;

        const token = canvas.tokens.get(tokenId);
        if (!token) return;

        if (!highlight) {
            token._chatHoverBorder?.clear();
            return;
        }

        const dim = canvas.dimensions;
        const unit = dim.size / dim.distance;
        const BORDER_WIDTH = unit / 12;
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

