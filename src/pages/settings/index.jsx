import React, {useEffect, useState} from 'react';
import * as _ from 'lodash';
import '../../styles/styles.css';
import api from '../../services';
import {bethereUrl} from '../../services/configs';
import {Container} from 'react-grid-system';
import {Header} from '../../components/header';
import Toggle from 'react-styled-toggle';
import {Option, OptionLabel, Button, Options} from './styles';
import { ThreeBounce } from 'styled-spinkit';

export const Settings = () => {
    const [backlightStatus, setBacklightStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reseting, setReseting] = useState(false);

    const handleReset = async() => {
        setLoading(true);
        setReseting(true);
        const res = await api.post(`${bethereUrl}/send`, {
            commandName: "Reset",
            changedFrom: "App",
            value: "RESET_ESP"
        });

        setTimeout(() => {
            setLoading(false);
            setReseting(false);
        }, 10000);
    }
    const handleSendCommand = async () => {
        setLoading(true);
        try {
            const lastBackLightResponse = await api.post(`${bethereUrl}/commands/laststatus` , {
                commandName: "Backlight"
            });
            const lastStatus = _.get(lastBackLightResponse, 'data.value');

            if(lastStatus === "LCD_ON") {
                const offRes = await api.post(`${bethereUrl}/send`, {
                    commandName: "Backlight",
                    changedFrom: "App",
                    value: "LCD_OFF"
                });

                if(offRes) { 
                    setBacklightStatus(false);
                }
            } else {
                const onRes = await api.post(`${bethereUrl}/send`, {
                    commandName: "Backlight",
                    changedFrom: "App",
                    value: "LCD_ON"
                });

                if(onRes) {
                    setBacklightStatus(true);
                }
            }

            setTimeout(() => {
                setLoading(false);
            }, 3000);
        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const fetchBacklight = async () => {
            const res = await api.post(`${bethereUrl}/commands/laststatus` , {
                commandName: "Backlight"
            });
            const backlightStatusValue = _.get(res, 'data.value');
            console.log(res);
            if(backlightStatusValue === "LCD_ON") {
                setBacklightStatus(true);
            } else {
                setBacklightStatus(false);
            }
        }
        fetchBacklight();
    }, []);

    return (
        <Container style={{height: '100%', minWidth: '80%'}}>
            <Header title="Settings"/>
            <Options>
                <Option className="backLightOption">
                    <OptionLabel>
                        LCD Backlight
                    </OptionLabel>
                    <Toggle
                        disabled={loading}
                        checked={backlightStatus} 
                        onChange={() => handleSendCommand()}
                    />
                </Option>
                <Option className="resetOption">
                    <p>
                        Your local station can take around 10 seconds to reboot the system and estabilish internet connection again.
                    </p>
                    <p>
                        Check your internet connection before rebooting.
                    </p>
                    <Button disabled={loading} onClick={() => handleReset()} >  
                        {reseting ? <ThreeBounce color={'white'} className="loader"/> : "Reset"}
                    </Button>
                </Option>
            </Options>
        </Container>        
    );
}