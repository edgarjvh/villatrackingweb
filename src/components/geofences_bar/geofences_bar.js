import React, { Component } from 'react';
import './geofences_bar.css';
import Config from './../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faSearch, faTimes, faDrawPolygon, faBroom, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { faDotCircle } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import classNames from 'classnames';
import $ from 'jquery';
import { LatLng } from 'leaflet';
 
const serverURL = Config.prototype.serverURL();

const INITIAL_STATE = {
    editing: false,
    deleting: false,
    saving: false,
    adding: false,
    editingId: 0,
    searchText: '',
    msgText: '',
    msgClass: classNames({
        'panel-message': true,
        'hidden': true,
        'running': false,
        'success': false,
        'error': false
    }),
    loaderClass: classNames({
        'loader': true,
        'hidden': true
    }),
    isDrawing: false,
    isDrawingPolygon: false,
    isDrawingCircle: false,
    geofenceId: 0,
    name: '',
    description: '',
    status: 0,
    points: [],
    center: new LatLng(0,0),
    radius: 0,
    color: 'blue',
    fillColor: 'blue',
    opacity: 0.5,
    showPolygon: false,
    showCircle: false,
    geofences: [],
    lookForInside: false
}

export default class GeofencesBar extends Component {
    panel = null;

    constructor(props) {
        super(props);

        this.state = INITIAL_STATE;
    }

    updateState = (state) => {
        this.setState(state);
    }

    onBtnDrawingPolygonClick = () => {
        if (!this.state.isDrawingPolygon) {
            let state = {
                isDrawing: true,
                isDrawingPolygon: true,
                isDrawingCircle: false
            };

            this.setState(state);
            window.mainMap.updateState(state);
        }
    }

    onBtnDrawingCircleClick = () => {
        if (!this.state.isDrawingCircle) {
            let state = {
                isDrawing: true,
                isDrawingPolygon: false,
                isDrawingCircle: true
            };

            this.setState(state);
            window.mainMap.updateState(state);
        }
    }

    onBtnDeleteLastPointClick = () => {
        if (this.state.isDrawingPolygon) {
            const points = this.state.points.slice(0, this.state.points.length - 1);
            window.mainMap.updateState({ points });
            this.setState({ points });
        } else {

        }
    }

    onBtnClearGeofenceClick = () => {
        let state = {
            points: [],
            center: new LatLng(0,0),
            radius: 0
        }

        this.setState(state);
        window.mainMap.updateState(state);
    }

    onBtnCancelGeofenceClick = () => {
        let state = {
            isDrawing: false,
            isDrawingPolygon: false,
            isDrawingCircle: false,
            points: [],
            center: new LatLng(0,0),
            radius: 0,
            color: 'blue',
            fillColor: 'blue',
            opacity: 0.5,
            showPolygon: false,
            showCircle: false
        };

        this.setState(state);
        window.mainMap.updateState(state);
    }

    handleInputChange = (e) => {
        if ((e.target.name).replace('-' + this.props.pid, '') === 'status') {
            this.setState({
                status: e.target.checked
            });

        } else if ((e.target.name).replace('-' + this.props.pid, '') === 'geofence-name') {
            this.setState({
                name: e.target.value
            });

        } else if ((e.target.name).replace('-' + this.props.pid, '') === 'geofence-description') {
            this.setState({
                description: e.target.value
            });
        } else {

            this.setState({
                [(e.target.name).replace('-' + this.props.pid, '')]: e.target.value === '' ? '' : e.target.validity.valid ? e.target.value : this.state[(e.target.name).replace('-' + this.props.pid, '')]
            });
        }
    }

    btnCloseGeofencesClick = (e) => {
        let state = {
            isDrawing: false,
            isDrawingPolygon: false,
            isDrawingCircle: false,
            points: [],
            center: new LatLng(0,0),
            radius: 0,
            color: 'blue',
            fillColor: 'blue',
            opacity: 0.5,
            showPolygon: false,
            showCircle: false
        };

        
        window.mainMap.updateState(state);

        this.setState(INITIAL_STATE);
        window.main.setGeofenceState();
    }

    editFromAssociated = geofence => {
        let coords = JSON.parse(geofence.points);        
        
        let center = new LatLng(coords[0].lat, coords[0].lng);
        let points = coords.map(point =>{
            return new LatLng(point.lat, point.lng);
        });

        let state = {
            isDrawing: true,
            isDrawingCircle: geofence.type === 'circle',
            isDrawingPolygon: geofence.type === 'polygon',
            points: geofence.type === 'polygon' ? points : [],
            center: geofence.type === 'circle' ? center : new LatLng(0,0),
            radius: geofence.type === 'circle' ? geofence.radio : 0,
            showCircle: geofence.type === 'circle',
            showPolygon: geofence.type === 'polygon',
            geofenceId: geofence.id,
            name: geofence.name,
            description: geofence.description,
            status: geofence.status,
            editing: true
        }

        this.setState(state);
        window.mainMap.updateState(state);
        window.main.setGeofenceState();
    }

    addFromAssociated = () => {
        let state = {            
            adding: true
        }

        this.setState(state);
        window.mainMap.updateState(state);
        window.main.setGeofenceState();
    }

    btnSaveGeofence = async () => {

        this.setState({
            saving: true,
            msgText: 'Enviando datos... Por favor espere',
            msgClass: classNames({
                'panel-message': true,
                'hidden': false,
                'running': true,
                'success': false,
                'error': false
            }),
            loaderClass: classNames({
                'loader': true,
                'hidden': false
            })
        });

        await axios.post(
            serverURL + '/saveGeofence',
            {
                id: this.state.geofenceId,                
                name: this.state.name,
                description: this.state.description,
                status: this.state.status,
                points: this.state.isDrawingPolygon ? JSON.stringify(this.state.points) : JSON.stringify([this.state.center]),
                type: this.state.isDrawingPolygon ? 'polygon' : 'circle',
                radio: this.state.radius
            }
        )
            .then(res => {
                if (res.data.result === 'CREATED') {
                    alert('La geocerca ha sido creada exitosamente');

                    let state = {
                        isDrawing: false,
                        isDrawingPolygon: false,
                        isDrawingCircle: false,
                        points: [],
                        center: new LatLng(0,0),
                        radius: 0,
                        color: 'blue',
                        fillColor: 'blue',
                        opacity: 0.5,
                        showPolygon: false,
                        showCircle: false
                    };            
                    
                    window.mainMap.updateState(state);            
                    this.setState(INITIAL_STATE);
                    window.geofences.refreshFromAssociated();
                    window.main.setGeofenceState();
                }

                if (res.data.result === 'UPDATED') {
                    alert('La geocerca ha sido actualizada exitosamente');

                    let state = {
                        isDrawing: false,
                        isDrawingPolygon: false,
                        isDrawingCircle: false,
                        points: [],
                        center: new LatLng(0,0),
                        radius: 0,
                        color: 'blue',
                        fillColor: 'blue',
                        opacity: 0.5,
                        showPolygon: false,
                        showCircle: false
                    };            
                    
                    window.mainMap.updateState(state);            
                    this.setState(INITIAL_STATE);
                    window.geofences.refreshFromAssociated();
                    window.main.setGeofenceState();
                }

                if (res.data.result === 'DUPLICATED NAME') {
                    alert('Ya existe una geocerca con el nombre ingresado');
                }                
            })
            .catch(e => {
                console.log(e);

                alert('Ha ocurrido un error\n'+e);
            });

    }

    render() {
        /* #region GEOFENCE BAR CLASSES */

        const geofenceBarClasses = classNames({
            'geofence-bar': true,
            'shown': this.props.show,
            'hidden': !this.props.show
        });

        const btnDrawGeofencePolygonClasses = classNames({
            'btn-draw-geofence': true,
            'polygon-geofence': true,
            'drawing': this.state.isDrawing && this.state.isDrawingPolygon,
            'disabled': this.state.isDrawingCircle
        });

        const btnDrawGeofenceCircleClasses = classNames({
            'btn-draw-geofence': true,
            'polygon-geofence': true,
            'drawing': this.state.isDrawing && this.state.isDrawingCircle,
            'disabled': this.state.isDrawingPolygon
        });

        const btnClearGeofencesClasses = classNames({
            'btn-draw-geofence': true,
            'clear-geofence': true,
            'disabled': this.state.points.length === 0 && (!this.state.center || (this.state.center.lat === 0 || this.state.center.lng === 0)) && this.state.radius === 0
        });

        const btnCancelGeofencesClasses = classNames({
            'btn-draw-geofence': true,
            'cancel-geofence': true,
            'disabled': !this.state.isDrawingPolygon && !this.state.isDrawingCircle
        });

        const btnDeleteLastPointClasses = classNames({
            'btn-draw-geofence': true,
            'delete-last-point': true,
            'disabled': !this.state.isDrawingPolygon || this.state.points.length === 0
        });

        const inputBoxClasses = classNames({
            'input-box-container': true
        });

        const textAreaBoxClasses = classNames({
            'textarea-box-container': true
        });

        const toggleBoxClasses = classNames({
            'input-toggle-container': true,
            'disabled': (!this.state.adding && !this.state.editing) || this.state.saving
        });

        const btnSaveGeofencesClasses = classNames({
            'mochi-button': true,
            'disabled': 
                this.state.name.trim() === '' ||
                this.state.description.trim() === '' ||
                (this.state.isDrawingPolygon && this.state.points.length < 3) ||
                (this.state.isDrawingCircle && this.state.radius === 0) ||
                (!this.state.isDrawingPolygon && !this.state.isDrawingCircle)
        });

        const rowPolygonInfoClasses = classNames({
            'row-info': true,
            'shown': this.state.isDrawingPolygon
        });
        const rowCircleInfoClasses = classNames({
            'row-info': true,
            'shown': this.state.isDrawingCircle
        });

        const btnCloseGeofencesClasses = classNames({
            'mochi-button': true,
            'active': this.state.lookForInside 
        });
        /* #endregion */
        return (
            <div className={geofenceBarClasses}>
                <div className="geofence-bar-wrapper">
                    <div className="title">{this.state.editing ? 'Editar Geocerca' : 'Crear Geocerca'}</div>
                    <div className="btn-drawing-container">
                        <div className="row">
                            <FontAwesomeIcon className={btnDrawGeofencePolygonClasses} icon={faDrawPolygon} title="Dibujar geocerca poligonal" onClick={this.onBtnDrawingPolygonClick} />
                            <FontAwesomeIcon className={btnDrawGeofenceCircleClasses} icon={faDotCircle} title="Dibujar geocerca circular" onClick={this.onBtnDrawingCircleClick} />
                        </div>
                        <div className="row">
                            <FontAwesomeIcon className={btnDeleteLastPointClasses} icon={faBackspace} title="Quitar último punto" onClick={this.onBtnDeleteLastPointClick} />
                            <FontAwesomeIcon className={btnClearGeofencesClasses} icon={faBroom} title="Limpiar geocerca" onClick={this.onBtnClearGeofenceClick} />
                            <FontAwesomeIcon className={btnCancelGeofencesClasses} icon={faTimes} title="Cancelar" onClick={this.onBtnCancelGeofenceClick} />
                        </div>
                    </div>

                    <div className={inputBoxClasses}>
                        <input type="text" name={'geofence-name-' + this.props.pid} id={'geofence-name-' + this.props.pid} onChange={this.handleInputChange} value={this.state.name} required />
                        <label htmlFor={'geofence-name-' + this.props.pid}>Nombre</label>
                    </div>

                    <div className={textAreaBoxClasses}>
                        <textarea name={'geofence-description-' + this.props.pid} id={'geofence-description-' + this.props.pid} onChange={this.handleInputChange} value={this.state.description} required></textarea>
                        <label htmlFor={'geofence-description-' + this.props.pid}>Descripción</label>
                    </div>

                    <div className={toggleBoxClasses}>
                        <input type="checkbox" id={'status-' + this.props.pid} name={'status-' + this.props.pid} onChange={this.handleInputChange} checked={this.state.status} />
                        <label htmlFor={'status-' + this.props.pid} title="Status">
                            <div className="lbl-toggle-button">Status</div>
                            <div className="input-toggle-button"></div>
                        </label>
                    </div>

                    <div className="geofences-info">
                        <div className={rowPolygonInfoClasses}>
                            <div className="header">Puntos:</div> <div>{this.state.points.length}</div>
                        </div>
                        <div className={rowCircleInfoClasses}>
                            <div className="header">Centro:</div>
                            <div className="coords">
                                <div className="coord coord-lat">
                                    <div className="header">Lat: </div> <div>{this.state.center.lat.toFixed(6)}</div>
                                </div>
                                <div className="coord coord-lng">
                                    <div className="header">Lng: </div> <div>{this.state.center.lng.toFixed(6)}</div>
                                </div>
                            </div>
                        </div>
                        <div className={rowCircleInfoClasses}>
                            <div className="header">Radio:</div> <div>{Math.ceil(this.state.radius)} Metros</div>
                        </div>
                        
                    </div>

                    <div className="filler"></div>

                    <div className="btn-area">
                        <div className={btnCloseGeofencesClasses} onClick={this.btnCloseGeofencesClick}>
                            <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                            <button type="button" id="btn-close-geofences" name="btn-close-geofences">Cerrar</button>
                            <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                        </div>

                        <div className={btnSaveGeofencesClasses} onClick={this.btnSaveGeofence}>
                            <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                            <button type="button" id="btn-save-geofence" name="btn-save-geofence">Guardar</button>
                            <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}