const sc = foundry.applications.ui.SceneControls;

export class HMSceneControlHooks {
    static getSceneControlButtons(controls) {
        const reachControl = {
            icon: "far fa-circle-dot",
            name: "hmReach",
            title: "HM.CONTROLS.hmReach",
            toggle: true,
            active: false,
            visible: true,
            button: false,
            order: 5,
            onChange: (_event, active) => {
                game.user.showAllThreats = active;
                canvas.tokens.draw();
            },
            toolclip: {
                heading: "HM.CONTROLS.hmReach",
                items: sc.buildToolclipItems([
                    { paragraph: "HM.CONTROLS.hmReachP" },
                ]),
            },
        };
        const { tools } = controls.tokens;
        tools.hmReach = reachControl;
    }
}
