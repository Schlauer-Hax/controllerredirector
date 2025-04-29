// @ts-ignore
import express from 'express';
import expressWs from 'express-ws';
import ViGEmClient from 'vigemclient';

const ew = expressWs(express());
const app = ew.app;
const port = 3000;

const client = new ViGEmClient();
client.connect();

const controllers: any = {

};

type Controller = {
    index: number
    axes: [number, number, number, number],
    buttons: number[],
    timestamp: number,
}

function updateController(data: Controller) {
    if (controllers[data.index] === undefined) {
        controllers[data.index] = client.createDS4Controller();
        controllers[data.index].connect();
    }
    const controller = controllers[data.index];
    [
        controller.button.CROSS, 
        controller.button.CIRCLE, 
        controller.button.SQUARE, 
        controller.button.TRIANGLE, 
        controller.button.SHOULDER_LEFT, 
        controller.button.SHOULDER_RIGHT,
        undefined,
        undefined,
        controller.button.SHARE,
        controller.button.OPTIONS,
        controller.button.THUMB_LEFT,
        controller.button.THUMB_RIGHT,
        undefined,
        undefined,
        undefined,
        undefined,
        controller.button.SPECIAL_PS
    ].forEach((button, index) => {
        button?.setValue(Boolean(data.buttons[index]));
    });
    console.log(controller)
    controller.axis.leftX.setValue(data.axes[0]);
    controller.axis.leftY.setValue(-data.axes[1]);
    controller.axis.rightX.setValue(data.axes[2]);
    controller.axis.rightY.setValue(-data.axes[3]);
    controller.axis.leftTrigger.setValue(data.buttons[6]);
    controller.axis.rightTrigger.setValue(data.buttons[7]);
    controller.axis.dpadVert.setValue(data.buttons[12] ? 1 : data.buttons[13] ? -1 : 0);
    controller.axis.dpadHorz.setValue(data.buttons[15] ? 1 : data.buttons[14] ? -1 : 0);
    //controller.button.A.setValue(Boolean(data.buttons[0]));
    
    //console.log(controller)
    console.log(data)
}

app.use(express.static('public'));

app.ws('/', (ws, req) => {
    ws.on('message', (msg) => {
        updateController(JSON.parse(msg.toString()));
    })
})

app.listen(port, () => console.log(`listening on port ${port}! http://localhost:${port}`));