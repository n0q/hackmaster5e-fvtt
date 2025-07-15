export class HMSceneControlHooks {
    static getSceneControlButtons(controls) {
        const reachControl = {
            icon: 'far fa-circle-dot',
            name: 'hmReach',
            title: 'HM.CONTROLS.hmReach',
            toggle: true,
            active: false,
            visible: true,
            button: true,
            onChange: (_event, active) => {
                game.user.showAllThreats = active;
                canvas.tokens.draw();
            },
        };
        const { tools } = controls.tokens;
        tools.hmReach = reachControl;
    }
}
