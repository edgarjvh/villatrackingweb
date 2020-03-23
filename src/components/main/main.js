import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import SimpleCrypto from 'simple-crypto-js';
import Login from './../auth/login';
import Menu from './../menu/menu';
import MainMap from './../map/map';
import PanelContainer from '../panels/panel-container/panel-container';
import GeofencesBar from './../geofences_bar/geofences_bar';
import Modal from './../modal/modal';

import './main.css';

const secret = '_villasecret';
const serverURL = 'http://localhost:8000';

let crypto = new SimpleCrypto(secret);

export default class Main extends Component {

    constructor() {
        super()        

        let now = Math.ceil(new Date().getTime() / 1000);

        if (localStorage.getItem('user')) {
            let user = JSON.parse(crypto.decrypt(localStorage.getItem('user')));

            if (user.expiresIn < now) {
                ReactDOM.render(<Login />, document.getElementById('root'));
            }

            this.state = {
                user: user,
                isShowingGeofences: false
            }
        } else {
            ReactDOM.render(<Login />, document.getElementById('root'));
        }
    }

    setGeofenceState = () => {
        this.setState({
            isShowingGeofences: !this.state.isShowingGeofences
        });
    }

    getState = () => {
        return this.state;
    }

    render() {
        return (
            <div className="main-container">
                <Menu user={JSON.parse(crypto.decrypt(localStorage.getItem('user')))} serverUrl={serverURL} isShowingGeofences={this.state.isShowingGeofences}/>
                <MainMap serverUrl={serverURL} ref={(mainMap) => {window.mainMap = mainMap}}/>
                <PanelContainer uid={this.state.user.id}  serverUrl={serverURL} isShowingGeofences={this.state.isShowingGeofences} ref={(panelContainer) => {window.panelContainer = panelContainer}}/>
                <GeofencesBar serverUrl={serverURL} show={this.state.isShowingGeofences} ref={(geofencesBar) => {window.geofencesBar = geofencesBar}} />
            </div>
        )
    }
}