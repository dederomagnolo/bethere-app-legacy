import COMMANDS from './commands';
import callApi from './callApi';

const APP = 'App';

const payloadList = {
    MANUAL_PUMP_ON: {
        commandName: COMMANDS.MANUAL_PUMP.NAME,
        changedFrom: APP,
        value: COMMANDS.MANUAL_PUMP.ON
    },
    MANUAL_PUMP_OFF: {
        commandName: COMMANDS.MANUAL_PUMP.NAME,
        changedFrom: APP,
        value: COMMANDS.MANUAL_PUMP.OFF
    },
    WATERING_AUTO_ON: {
        commandName: COMMANDS.WATERING_ROUTINE.NAME,
        changedFrom: APP,
        value: COMMANDS.WATERING_ROUTINE.MODE_ON
    },
    WATERING_AUTO_OFF: {
        commandName: COMMANDS.WATERING_ROUTINE.NAME,
        changedFrom: APP,
        value: COMMANDS.WATERING_ROUTINE.MODE_OFF
    },
    AUTO_PUMP_ON: {
        commandName: COMMANDS.WATERING_ROUTINE.NAME,
        changedFrom: APP,
        value: COMMANDS.WATERING_ROUTINE.PUMP_ON
    },
    AUTO_PUMP_OFF: {
        commandName: COMMANDS.WATERING_ROUTINE.NAME,
        changedFrom: APP,
        value: COMMANDS.WATERING_ROUTINE.PUMP_OFF
    },
    BACKLIGHT_ON: {
        commandName: COMMANDS.BACKLIGHT.NAME,
        changedFrom: APP,
        value: COMMANDS.BACKLIGHT.ON
    },
    BACKLIGHT_OFF: {
        commandName: COMMANDS.BACKLIGHT.NAME,
        changedFrom: APP,
        value: COMMANDS.BACKLIGHT.OFF
    }
}

async function sendCommand (command) {
    const payloadToSend = payloadList[command];
    console.log(payloadToSend);
    return await callApi(
        'POST',
        '/send',
        {...payloadToSend}
    )
}

export default sendCommand;