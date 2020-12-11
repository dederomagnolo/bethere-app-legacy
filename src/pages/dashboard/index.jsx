import React, { useState, useEffect } from 'react';
import Toggle from 'react-styled-toggle';
import { Header } from '../../components/header';
import * as _ from 'lodash';
import moment from 'moment';
import api from '../../services';
import { setColorId, isOdd, setMeasureId } from './utils';
import {NewCard} from '../../components/newCard';
import {Cards, MainContainer} from './styles';
import {Graph} from './graph';
import {isFromApp} from './utils';
import { thingspeakUrl, bethereUrl} from '../../services/configs';

const initialState = {
    measures: { 
        internalHumidity: '' , 
        internalTemperature: '' , 
        externalHumidity: '' , 
        externalTemperature: ''
    }
}

const pumpTimeSetPoint = 600000;

export const Dashboard = () => {
    const [pumpFlag, setPumpFlag] = useState(false);
    const [blockButtonFlag, setBlockButtonFlag] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
/*     const [minutes, setMinutesLeft] = useState(null);
    const [seconds, setSecondsLeft] = useState(null); */
    const [isCommandFromApp, setFromApp] = useState(false);
    const [pumpCountDown, setPumpCountDown] = useState("");
    const [measures, setMeasures] = useState(initialState.measures);
    const [temperatureData, setTemperatureData] = useState([]);
    const [humidityData, setHumidityData] = useState([]);
    const [showTemperatureChart, setShowTemperatureChart] = useState(true);
    const [showHumidityChart, setShowHumidityChart] = useState(false);
    // Week Logics
    /* const lastWeekStartDate = moment().subtract(5, 'days').format("YYYY-MM-DD"); */
    /* const queryStart = `${lastWeekStartDate}%2000:00:00`; */
    /* const queryEnd = `${endOfDay}%2000:00:00`  */

    // field 3: internal humidity
    // field 4: internal temperature
    // field 5: external humidity
    // field 6: external temperature
    // field 7: pump indicator

    const updateDataFromRemote = async () => {
        try{
            const pumpStatusResponse = await api.get(`${bethereUrl}/commands/pumpstatus`);
            const lastFeed = await api.get(`${thingspeakUrl}/feeds/last.json`);
            const lastPumpStatus = _.get(pumpStatusResponse, 'data.value');
            if(pumpStatusResponse) {
                const commandSentBy = _.get(pumpStatusResponse, 'data.changedFrom');
                const isCommandFromApp = isFromApp(commandSentBy);
                setFromApp(isCommandFromApp);
            }
            
        
            const internalHumidity = _.get(lastFeed, 'data.field3');
            const internalTemperature = _.get(lastFeed, 'data.field4');
            const externalHumidity = _.get(lastFeed, 'data.field5');
            const externalTemperature = _.get(lastFeed, 'data.field6');

            const  measuresFromRemote  = {
                internalHumidity: internalHumidity && internalHumidity !== 'nan' ? Number(internalHumidity).toFixed(2) : "-",
                internalTemperature: internalTemperature && internalTemperature !== 'nan' ? Number(internalTemperature).toFixed(2) : "-",
                externalHumidity: externalHumidity && externalHumidity !== 'nan' ? Number(externalHumidity).toFixed(2) : "-",
                externalTemperature: externalTemperature && externalTemperature !== 'nan' ? Number(externalTemperature).toFixed(2) : "-"
            }
            setMeasures(measuresFromRemote);

            if(lastPumpStatus === "1") {
                setPumpFlag(true);
                const today = moment();
                console.log(moment().format('hh:mm:ss'));
                const lastPumpUpdate = _.get(pumpStatusResponse, 'data.createdAt');
                console.log(moment(lastPumpUpdate).format('hh:mm:ss'));
                const interval = moment(today).diff(lastPumpUpdate);
                const remainingTime = pumpTimeSetPoint - interval;
                const d = moment.duration(remainingTime, 'milliseconds');
                const secs = Math.floor(d.seconds());
                const mins = Math.floor(d.asMinutes());
                console.log(`${mins}:${secs}`);
                setTimeLeft(`${mins}:${secs}`);
               
                /* 
                setSecondsLeft(seconds);
                const minutes = moment(remainingTime).format('mm');
                setMinutesLeft(minutes);
                */
            } 
        } catch(err) {
          console.log(err);
        }
    }

    useEffect(() => {
        updateDataFromRemote();

        const updateFields = async (fieldNumber) => {
            const today = moment().format('YYYY-MM-DD');
            const nextDay = moment().add(1, 'days').format('YYYY-MM-DD');

            const queryStart = `${today}%2003:00:00`;
            const queryEnd = `${nextDay}%2003:00:00`; //check this timezone to use utc

            try {
                const response = await api.get(`${thingspeakUrl}/fields/${fieldNumber}.json?start=${queryStart}&end=${queryEnd}`);  // 
                const weekFeed = _.get(response, 'data.feeds');
                const weekFeedSlice = _.slice(weekFeed, 50);
                const data = [];
                await _.each(weekFeed, (entry, index) => {
                    // if(isOdd(index)) {
                        const created_at = _.get(entry, 'created_at');
                        const fieldMeasure = _.get(entry, `field${fieldNumber}`);
                        data.push({
                            "x": moment(created_at).format('HH:mm'),
                            "y": fieldMeasure && fieldMeasure !== "nan" ? Number(fieldMeasure).toFixed(2) : "30"
                        });
                    // }
                });

                if(fieldNumber === 4 || fieldNumber === 6) { // internal temperature and external temperature
                    setTemperatureData((temperatureData) => [...temperatureData, {
                        "id" : setMeasureId(fieldNumber),
                        "color": setColorId(fieldNumber),
                        "data": data
                    }]);
                } else {
                    setHumidityData((humidityData) => [...humidityData, {
                        "id" : setMeasureId(fieldNumber),
                        "color": setColorId(fieldNumber),
                        "data": data
                    }]);
                }

            } catch(err) {
                console.log(err);
            }
        }

        updateFields(4);
        updateFields(6);
        updateFields(3);
        updateFields(5);

    }, []);


   /*  useEffect(() => {
        if (!seconds) return;
        const intervalId = setInterval(() => {
            console.log(seconds);
        setSecondsLeft(Number(seconds) - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [seconds]);

    useEffect(() => {
        if (!minutes) return;
            const intervalId = setInterval(() => {
            setSecondsLeft(minutes - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [minutes]); */
        
    const updatePump = async () => { 
        try{
            const pumpStatusReponse = await api.get(`${bethereUrl}/commands/pumpstatus`);
            setBlockButtonFlag(true);
            const pumpStatus = _.get(pumpStatusReponse, 'data.value');
            if(pumpStatus === "1") {
                await api.post(`${bethereUrl}/send`, {
                    commandName: "Pump Status",
                    changedFrom: "App",
                    value: "0"
                });
                setPumpFlag(false);
            } else {
                const commandRes = await api.post(`${bethereUrl}/send`, {
                    commandName: "Pump Status",
                    changedFrom: "App",
                    value: "1"
                });
                setPumpFlag(true);
                const createdAt = _.get(commandRes, 'data.createdAt');
                const today = moment();
                const interval = moment(today).diff(createdAt);
                const remainingTime = pumpTimeSetPoint - interval;
                const d = moment.duration(remainingTime, 'milliseconds');
                const secs = Math.floor(d.seconds());
                const mins = Math.floor(d.asMinutes());
                console.log(`${mins}:${secs}`);
                setTimeLeft(`${mins}:${secs}`);
            }
            setBlockButtonFlag(false);
        } catch(err) {
          console.log(err);
        }    
    }

    return (
        <MainContainer>
            <Header title="Dashboard"/>
            <div>
                {/* <span style={{fontSize: "20px"}}>Hello! Your garden looks good today:</span> */}
                <Cards>
                    <NewCard 
                        label={"Temperature (°C)"} 
                        icon={"thermometer half"} 
                        internalMeasure={measures.internalTemperature} 
                        externalMeasure={measures.externalTemperature}
                        onClick={() => {
                            setShowTemperatureChart(true);
                            setShowHumidityChart(false);
                        }}
                    />
                    <NewCard 
                        label={"Humidity (%)"} 
                        icon={"tint"} 
                        internalMeasure={measures.internalHumidity} 
                        externalMeasure={measures.externalHumidity} 
                        onClick={() => {
                            setShowHumidityChart(true)
                            setShowTemperatureChart(false);
                        }}
                    />
                    <NewCard 
                        label={"Pump Control"} 
                        icon={"cog"}
                        pump={true}
                        children={
                            <div>
                                <Toggle 
                                    backgroundColorChecked="#3bea64" 
                                    disabled={blockButtonFlag} 
                                    checked={pumpFlag} 
                                    onChange={() => updatePump()}
                                />
                                {!pumpFlag 
                                    ? <div>{"Available!"}</div>
                                    : <div>Remaining time: {timeLeft} mins</div> 
                                }
                            </div>
                            }
                    >
                    </NewCard>
                </Cards>
                {showTemperatureChart && temperatureData.length > 0 && <Graph chartData={temperatureData}/>}
                {showHumidityChart && humidityData.length > 0 && <Graph chartData={humidityData}/>}
                {/* {chartData.length > 0 && <Graph chartData={temperatureData}/>} */}
            </div>
        </MainContainer>
    );
}