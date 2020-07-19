import React, { Component } from "react";
import moment from "moment";
import "./mainConsole.css";
import Config from '../../config';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import $ from 'jquery';
import classNames from 'classnames';
import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:4500';

const serverURL = Config.prototype.serverURL();

export default class MainConsole extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isHidden: !this.props.isShowingConsole,
            showingOptionSelected: 'all',
            devices: [],
            devicesShown: [],
            clientFilterText: '',
            vehicleFilterText: '',
            imeiFilterText: '',
            simcardFilterText: '',
            eventFilterText: ''
        }
    }

    sendCommand = (command) => {

    }

    componentDidMount(){
        this.getClients();

        const socket = socketIOClient(ENDPOINT);

        socket.on('new gps data', data => {
            const devicesShown = this.state.devicesShown.map(device => {
                
                if (device.imei === data.imei){
                    console.log(data);
                    if (device.location){
                        device.location.date_time = data.datetime;
                        device.location.engine_status = data.engine_status;
                        device.location.fix = data.fix;
                        device.location.name = data.event;
                        device.location.latitude = data.latitude;
                        device.location.longitude = data.longitude;
                        device.location.orientation = Number(data.orientation);
                        device.location.speed = data.speed;
                        device.location.ip = data.ip;
                        device.location.port = data.port;
                    }else{
                        device.location = {
                            id: 0,
                            imei: data.imei,
                            date_time: data.datetime,
                            engine_status: data.engine_status,
                            fix: data.fix,
                            name: data.event,
                            latitude: data.latitude,
                            longitude: data.longitude,
                            orientation: Number(data.orientation),
                            speed: data.speed,
                            ip: data.ip,
                            port: data.port
                        }
                    }
                }
                
                return device;
            });

            this.setState({
                devicesShown
            });

            this.setMarkersOnMap();
        })
    }

    getClients = async () => {
        axios.get(serverURL + '/getDevicesConsole')
        .then(res => {
            let devices = res.data.devices.map(device => {

                if (this.state.devicesShown.length > 0){
                    this.state.devicesShown.map(dev => {
                        if (device.imei === dev.imei){
                            device.shown = dev.shown
                        }
                        return false;
                    });
                }else{
                    device.shown = false;
                }
                
                return device;
            })

            this.setState({
                devices: devices.sort(function (x, y) {
                    let a = x.vehicle.client.name.toUpperCase(),
                        b = y.vehicle.client.name.toUpperCase();
                    return a === b ? 0 : a > b ? 1 : -1;
                }),
                devicesShown: devices.sort(function (x, y) {
                    let a = x.vehicle.client.name.toUpperCase(),
                        b = y.vehicle.client.name.toUpperCase();
                    return a === b ? 0 : a > b ? 1 : -1;
                })
            })
        })
        .catch(e => {
                console.log(e);
        })
        .finally(() => {
            this.setMarkersOnMap();
        });
    }

    consoleToggleBtnClick = (e) => {
        const isHidden = !this.state.isHidden;
        this.setState({isHidden});
    }

    handleShowingOptionChange = (e) => {
        this.setState({
            showingOptionSelected: e.target.value
        });
    }

    labelClick = (e) => {
       let id = $(e.target).attr('data-id');

       $(document).find('input#'+id).focus();
    }

    onChangeShown = e => {
        $(document).find('.leaflet-popup').remove();

        e.stopPropagation();
        
        let devicesShown = this.state.devicesShown.map(device => {
            if(device.id === Number($(e.target).attr('data-id'))){
                device.shown = $(e.target).is(':checked');

                if ($(e.target).is(':checked') && device.location){
                    window.mainMap.setMapCenter(device.location.latitude, device.location.longitude);
                }
            }

            return device;
        })

        this.setState({
            devicesShown
        });

        this.setMarkersOnMap();
    }

    setMarkersOnMap = e => {
        window.mainMap.refreshMarkers(this.state.devicesShown);
    }

    filterShown = e => {
        let devicesShown = this.state.devicesShown.filter(device => {
            return device.vehicle.client.name.includes(this.state.clientFilterText)
        });

        this.setState({
            devicesShown
        })
    }

    onInputFilter = e => {
        let key = $(e.target).attr('data-key');
        let value = $(e.target).val().trim().toLowerCase();

        this.setState({
            clientFilterText: key === 'client' ? value : this.state.clientFilterText,
            vehicleFilterText: key === 'vehicle' ? value : this.state.vehicleFilterText,
            imeiFilterText: key === 'imei' ? value : this.state.imeiFilterText,
            simcardFilterText: key === 'simcard' ? value : this.state.simcardFilterText,
            eventFilterText: key === 'event' ? value : this.state.eventFilterText
        });

        // if (e.keyCode === 13){
        //     this.handleConsoleFiltering();
        // }

        this.handleConsoleFiltering();
    }

    handleConsoleFiltering = () => {
        let devicesShown = this.state.devices.filter(device => {
            return device.vehicle.client.name.toLowerCase().indexOf(this.state.clientFilterText) > -1 &&
                     (device.vehicle.license_plate.toLowerCase().indexOf(this.state.vehicleFilterText) > -1 ||
                     device.vehicle.brand.toLowerCase().indexOf(this.state.vehicleFilterText) > -1 ||
                     device.vehicle.model.toLowerCase().indexOf(this.state.vehicleFilterText) > -1 ||
                     device.vehicle.year.toString().indexOf(this.state.vehicleFilterText) > -1 ||
                     device.vehicle.color.toLowerCase().indexOf(this.state.vehicleFilterText) > -1) &&
                        device.imei.toLowerCase().indexOf(this.state.imeiFilterText) > -1 &&
                            device.sim_card.gsm.toLowerCase().indexOf(this.state.simcardFilterText) > -1 &&
                                (device.location !== null ? device.location.name.toLowerCase().indexOf(this.state.eventFilterText) > -1 : true);
        });

        this.setState({
            devicesShown
        });
    }

    onRowClick = e => {

        if ($(e.target).hasClass('cbox-on-map')){
            if ($(e.target).is(':checked')){
                let row = $(e.target).closest('.trow');
                let imei = row.find('.tcol.imei').text();

                this.state.devicesShown.map((device, index) => {
                    if ((device.imei === imei) && device.shown && device.location){
                        window.mainMap.setMapCenter(device.location.latitude, device.location.longitude);
                        window.mainMap.setMapCenter(device.location.latitude, device.location.longitude);
                    }

                    return true;
                })   
            }
        }else{
            let row = $(e.target).closest('.trow');
            let imei = row.find('.tcol.imei').text();

            this.state.devicesShown.map((device, index) => {
                if ((device.imei === imei) && device.shown && device.location){
                    window.mainMap.setMapCenter(device.location.latitude, device.location.longitude);
                }

                return true;
            })     
        }           
    }


    render() {
        const mainConsoleClasses = classNames({
            'main-console': true,
            'is-hidden': this.props.isShowingGeofences || this.state.isHidden
        });       

        return (
            <div className={mainConsoleClasses} id="main-console">
                <div className="console-container">
                    <div className="console-toggle-btn" onClick={this.consoleToggleBtnClick} title={this.state.isHidden ? 'Mostrar consola' : 'Ocultar consola'}>
                        <FontAwesomeIcon className="toggle-btn-icon" icon={faChevronDown} />
                    </div>

                    <div className="console-content">
                        <div className="console-header">
                            <div className="console-header-title">Mostrar:</div>
                            <div className="showing-options">
                                <div className="form-group">                                    
                                    <input className="form-control" type="radio" name="rbtn-console-showing" id="rbtn-console-all" value="all" onChange={this.handleShowingOptionChange} checked={this.state.showingOptionSelected === 'all'} />
                                    <label htmlFor="rbtn-console-all">Todos</label>
                                </div>                                
                                <div className="form-group">                                    
                                    <input className="form-control" type="radio" name="rbtn-console-showing" id="rbtn-console-dealer" value="dealer" onChange={this.handleShowingOptionChange} checked={this.state.showingOptionSelected === 'dealer'}/>
                                    <label htmlFor="rbtn-console-dealer">Dealer</label>
                                </div>
                            </div>
                        </div>
                        <div className="console-body">
                            <div className="tbl">
                                <div className="thead">
                                    <form>
                                        <div className="trow">
                                            <div className="tcol show-on-map"></div>
                                            <div className="tcol client">
                                                <div className="tcol-container">
                                                    <input className="form-control" type="text" id="txt-filter-client" value={this.state.clientFilterText} 
                                                        data-key="client" onInput={this.onInputFilter} onChange={this.onInputFilter} onKeyUp={this.onInputFilter} required />
                                                    <label onClick={this.labelClick} data-id="txt-filter-client">Cliente</label>
                                                </div>                                                
                                            </div>
                                            <div className="tcol vehicle">
                                                <div className="tcol-container">                                                    
                                                    <input className="form-control" type="text" id="txt-filter-vehicle" value={this.state.vehicleFilterText} 
                                                        data-key="vehicle" onInput={this.onInputFilter} onChange={this.onInputFilter} onKeyUp={this.onInputFilter} required />
                                                    <label onClick={this.labelClick} data-id="txt-filter-vehicle">Vehículo</label>
                                                </div>
                                            </div>                                            
                                            <div className="tcol imei">
                                                <div className="tcol-container">                                                    
                                                    <input className="form-control" type="text" id="txt-filter-imei" value={this.state.imeiFilterText} 
                                                        data-key="imei" onInput={this.onInputFilter} onChange={this.onInputFilter} onKeyUp={this.onInputFilter} required />
                                                    <label onClick={this.labelClick} data-id="txt-filter-imei">Imei</label>
                                                </div>
                                            </div>
                                            <div className="tcol simcard">
                                                <div className="tcol-container">                                                    
                                                    <input className="form-control" type="text" id="txt-filter-simcard" value={this.state.simcardFilterText} 
                                                        data-key="simcard" onInput={this.onInputFilter} onChange={this.onInputFilter} onKeyUp={this.onInputFilter} required />
                                                    <label onClick={this.labelClick} data-id="txt-filter-simcard">Simcard</label>
                                                </div>
                                            </div>
                                            <div className="tcol event">
                                                <div className="tcol-container">                                                    
                                                    <input className="form-control" type="text" id="txt-filter-event" value={this.state.eventFilterText} 
                                                        data-key="event" onInput={this.onInputFilter} onChange={this.onInputFilter} onKeyUp={this.onInputFilter} required />
                                                    <label onClick={this.labelClick} data-id="txt-filter-event">Evento</label>
                                                </div>
                                            </div>
                                        </div>
                                    </form>                                    
                                </div>
                                <div className="tbody">
                                    <div className="tbody-wrapper">
                                        {                                           

                                            this.state.devicesShown.map((item, index) => {
                                                let rowClassnames = classNames({
                                                    'trow': true,
                                                    'shown': item.shown
                                                });                                                

                                                return (
                                                    <div className={rowClassnames} key={index} id={item.id} onClick={this.onRowClick}>
                                                        <div className="tcol show-on-map">
                                                            <input type="checkbox" className="cbox-on-map" data-id={item.id} onChange={this.onChangeShown}/>
                                                        </div>
                                                        <div className="tcol client">
                                                            {item.vehicle.client.name}
                                                        </div>
                                                        <div className="tcol vehicle">
                                                            <span className="license_plate">{item.vehicle.license_plate}</span> 
                                                            <span className="brand">{item.vehicle.brand}</span> 
                                                            <span className="model">{item.vehicle.model}</span> 
                                                            <span className="year">{item.vehicle.year}</span>
                                                            <span className="color">{item.vehicle.color}</span>
                                                        </div>
                                                        <div className="tcol imei">
                                                            {item.imei}
                                                        </div>
                                                        <div className="tcol simcard">
                                                            {item.sim_card.gsm}
                                                        </div>
                                                        <div className="tcol event">
                                                        <span className="event-name">
                                                            {
                                                                item.location ? 
                                                                (item.location.name === 'tracker' ? 'Reporte Normal' : 
                                                                item.location.name === 'acc on' ? 'Ignición ON' :
                                                                item.location.name === 'acc off' ? 'Ignición OFF' : 
                                                                item.location.name === 'acc alarm' ? 'Desconexión de Batería' : 'Reporte Normal') : ''
                                                            }
                                                            </span>

                                                            {
                                                                item.location ? <b className="event-separator">|</b> : ''
                                                            }

                                                            <span className="event-datetime">
                                                            {
                                                                item.location ? 
                                                                moment(item.location.date_time, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY hh:mm:ss a') : ''
                                                            }
                                                            </span>

                                                            {
                                                                item.location ? <b className="event-separator">|</b> : ''
                                                            }

                                                            <span className="event-speed">
                                                            {
                                                                item.location ? 
                                                                item.location.speed.toString() + ' Km/h' : ''
                                                            }
                                                            </span>
                                                        </div>                                                    
                                                    </div>                                                    
                                                )                                                
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="console-footer"></div>
                    </div>
                </div>                 
            </div>
        )
    }
}