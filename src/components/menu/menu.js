import React, { Component } from "react";
import "./menu.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import $ from "jquery";
import {
    faCar,
    faMobile,
    faSatellite,
    faUserTie,
    faUsers,
    faHandshake,
    faSimCard,
    faRoute,
    faExclamationTriangle,
    faMapSigns,
    faFileAlt,
    faUserLock,
    faLayerGroup,
    faMapMarkedAlt
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";

export default class Menu extends Component {
    constructor() {
        super();
        $(document).ready(function() {
            setTimeout(function() {
                $(".menu-container").css("top", "0");
            }, 200);

            setInterval(function() {
                let date = new Date();
                let str =
                    date.getFullYear() +
                    "-" +
                    (date.getMonth() + 1).toString().padStart(2, "0") +
                    "-" +
                    date
                        .getDate()
                        .toString()
                        .padStart(2, "0") +
                    " " +
                    date
                        .getHours()
                        .toString()
                        .padStart(2, "0") +
                    ":" +
                    date
                        .getMinutes()
                        .toString()
                        .padStart(2, "0") +
                    ":" +
                    date
                        .getSeconds()
                        .toString()
                        .padStart(2, "0");

                $(document)
                    .find(".datetime-container")
                    .text(str);
            }, 1000);
        });

        this.state = {
            isShowingGeofences: false
        };
    }

    setGeofenceState = isShowingGeofences => {
        this.setState({
            isShowingGeofences
        });
    };

    componentDidMount() {
        const btnUsers = document.getElementById("btn-users");
        const btnDealers = document.getElementById("btn-dealers");
        const btnSimcards = document.getElementById("btn-simcards");
        const btnDevices = document.getElementById("btn-devices");
        const btnClients = document.getElementById("btn-clients");
        const btnVehicles = document.getElementById("btn-vehicles");
        const btnDevicesModels = document.getElementById("btn-devices-models");
        const btnGeofences = document.getElementById("btn-geofences");

        btnUsers.addEventListener("click", event => {
            let panelState = window.panelContainer.getState();

            let exist = false;

            for (let i = 0; i < panelState.panels.length; i++) {
                if (panelState.panels[i].id === "panel-users") {
                    window.panelContainer.panelToFront("panel-users");
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                window.panelContainer.addPanel({
                    id: "panel-users",
                    type: "users",
                    uid: -1
                });
            }
        });

        btnDealers.addEventListener("click", event => {
            let panelState = window.panelContainer.getState();

            let exist = false;

            for (let i = 0; i < panelState.panels.length; i++) {
                if (panelState.panels[i].id === "panel-dealers") {
                    window.panelContainer.panelToFront("panel-dealers");
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                window.panelContainer.addPanel({
                    id: "panel-dealers",
                    type: "dealers",
                    did: -1
                });
            }
        });

        btnSimcards.addEventListener("click", event => {
            let panelState = window.panelContainer.getState();

            let exist = false;

            for (let i = 0; i < panelState.panels.length; i++) {
                if (panelState.panels[i].id === "panel-simcards") {
                    window.panelContainer.panelToFront("panel-simcards");
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                window.panelContainer.addPanel({
                    id: "panel-simcards",
                    type: "simcards",
                    sid: -1
                });
            }
        });

        btnDevices.addEventListener("click", event => {
            let panelState = window.panelContainer.getState();

            let exist = false;

            for (let i = 0; i < panelState.panels.length; i++) {
                if (panelState.panels[i].id === "panel-devices") {
                    window.panelContainer.panelToFront("panel-devices");
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                window.panelContainer.addPanel({
                    id: "panel-devices",
                    type: "devices",
                    did: -1
                });
            }
        });

        btnClients.addEventListener("click", event => {
            let panelState = window.panelContainer.getState();

            let exist = false;

            for (let i = 0; i < panelState.panels.length; i++) {
                if (panelState.panels[i].id === "panel-clients") {
                    window.panelContainer.panelToFront("panel-clients");
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                window.panelContainer.addPanel({
                    id: "panel-clients",
                    type: "clients",
                    cid: -1
                });
            }
        });

        btnVehicles.addEventListener("click", event => {
            let panelState = window.panelContainer.getState();

            let exist = false;

            for (let i = 0; i < panelState.panels.length; i++) {
                if (panelState.panels[i].id === "panel-vehicles") {
                    window.panelContainer.panelToFront("panel-vehicles");
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                window.panelContainer.addPanel({
                    id: "panel-vehicles",
                    type: "vehicles",
                    vid: -1
                });
            }
        });

        btnDevicesModels.addEventListener("click", event => {
            let panelState = window.panelContainer.getState();

            let exist = false;

            for (let i = 0; i < panelState.panels.length; i++) {
                if (panelState.panels[i].id === "panel-devices-models") {
                    window.panelContainer.panelToFront("panel-devices-models");
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                window.panelContainer.addPanel({
                    id: "panel-devices-models",
                    type: "devices-models",
                    mid: -1
                });
            }
        });

        btnGeofences.addEventListener("click", event => {
            let panelState = window.panelContainer.getState();

            let exist = false;

            for (let i = 0; i < panelState.panels.length; i++) {
                if (panelState.panels[i].id === "panel-geofences") {
                    window.panelContainer.panelToFront("panel-geofences");
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                window.panelContainer.addPanel({
                    id: "panel-geofences",
                    type: "geofences",
                    gid: -1
                });
            }
        });
    }

    render() {
        const btnUsersClasses = classNames({
            btn: true,
            "btn-users": true,
            disabled: this.props.isShowingGeofences
        });
        const btnGeofencesClasses = classNames({
            btn: true,
            "btn-geofences": true,
            disabled: this.props.isShowingGeofences
        });
        const btnClientsClasses = classNames({
            btn: true,
            "btn-clients": true,
            disabled: this.props.isShowingGeofences
        });
        const btnDealersClasses = classNames({
            btn: true,
            "btn-dealers": true,
            disabled: this.props.isShowingGeofences
        });
        // const btnDriversClasses = classNames({
        //     btn: true,
        //     "btn-drivers": true,
        //     disabled: this.props.isShowingGeofences
        // });
        const btnVehiclesClasses = classNames({
            btn: true,
            "btn-vehicles": true,
            disabled: this.props.isShowingGeofences
        });
        const btnSimCardsClasses = classNames({
            btn: true,
            "btn-simcards": true,
            disabled: this.props.isShowingGeofences
        });
        const btnDevicesModelsClasses = classNames({
            btn: true,
            "btn-devices-models": true,
            disabled: this.props.isShowingGeofences
        });
        const btnDevicesClasses = classNames({
            btn: true,
            "btn-devices": true,
            disabled: this.props.isShowingGeofences
        });
        const btnDrivingHistoryClasses = classNames({
            btn: true,
            "btn-driving-history": true,
            disabled: this.props.isShowingGeofences
        });
        const btnAlertHistoryClasses = classNames({
            btn: true,
            "btn-alert-history": true,
            disabled: this.props.isShowingGeofences
        });
        const btnReportsClasses = classNames({
            btn: true,
            "btn-reports": true,
            disabled: this.props.isShowingGeofences
        });
        const btnPermissionsClasses = classNames({
            btn: true,
            "btn-permissions": true,
            disabled: this.props.isShowingGeofences
        });
        const btnWindowsClasses = classNames({
            btn: true,
            "btn-windows": true,
            disabled: this.props.isShowingGeofences
        });
        const btnPoisClasses = classNames({
            btn: true,
            "btn-pois": true,
            disabled: this.props.isShowingGeofences
        });

        return (
            <div className="menu-container">
                <div className="user-container">
                    <div className="group">
                        <label htmlFor="">
                            Usuario: <span>{this.props.user.name}</span>
                        </label>
                    </div>
                    <div className="group">
                        <label htmlFor="">
                            Fecha: <span className="datetime-container"></span>
                        </label>
                    </div>
                </div>
                <div className="button-container">
                    <div
                        className={btnUsersClasses}
                        title="Usuarios"
                        id="btn-users"
                    >
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div
                        className={btnClientsClasses}
                        title="Clientes"
                        id="btn-clients"
                    >
                        <FontAwesomeIcon icon={faUserTie} />
                    </div>
                    <div
                        className={btnDealersClasses}
                        title="Dealers"
                        id="btn-dealers"
                    >
                        <FontAwesomeIcon icon={faHandshake} />
                    </div>
                    {/* <div className={btnDriversClasses} title="Conductores" id="btn-drivers">
                        <FontAwesomeIcon icon={faIdCardAlt} />
                    </div> */}
                    <div
                        className={btnVehiclesClasses}
                        title="Vehículos"
                        id="btn-vehicles"
                    >
                        <FontAwesomeIcon icon={faCar} />
                    </div>
                    <div
                        className={btnSimCardsClasses}
                        title="Sim Cards"
                        id="btn-simcards"
                    >
                        <FontAwesomeIcon icon={faSimCard} />
                    </div>
                    <div
                        className={btnDevicesModelsClasses}
                        title="Modelos de Dispositivos"
                        id="btn-devices-models"
                    >
                        <FontAwesomeIcon icon={faMobile} />
                    </div>
                    <div
                        className={btnDevicesClasses}
                        title="Dispositivos Gps"
                        id="btn-devices"
                    >
                        <FontAwesomeIcon icon={faSatellite} />
                    </div>
                    <div
                        className={btnGeofencesClasses}
                        title="Geocercas"
                        id="btn-geofences"
                    >
                        <FontAwesomeIcon icon={faMapSigns} />
                    </div>
                    <div
                        className={btnDrivingHistoryClasses}
                        title="Historial de Recorrido"
                    >
                        <FontAwesomeIcon icon={faRoute} />
                    </div>
                    <div
                        className={btnAlertHistoryClasses}
                        title="Historial de Alertas"
                    >
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                    </div>
                    <div className={btnReportsClasses} title="Informes">
                        <FontAwesomeIcon icon={faFileAlt} />
                    </div>
                    <div className={btnPermissionsClasses} title="Permisos">
                        <FontAwesomeIcon icon={faUserLock} />
                    </div>
                    <div className={btnWindowsClasses} title="Ventanas">
                        <FontAwesomeIcon icon={faLayerGroup} />
                    </div>
                    <div className={btnPoisClasses} title="Puntos de Interés">
                        <FontAwesomeIcon icon={faMapMarkedAlt} />
                    </div>
                </div>

                <img src="/img/logo2.svg" alt="logo" />
            </div>
        );
    }
}
