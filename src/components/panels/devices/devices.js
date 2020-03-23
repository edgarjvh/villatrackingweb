import React, { Component } from 'react';
import './devices.css';
import Config from './../../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faSearch, faTimes, faCar, faSyncAlt, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import classNames from 'classnames';
import $ from 'jquery';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { DateUtils } from 'react-day-picker';
import dateFnsFormat from 'date-fns/format';
import dateFnsParse from 'date-fns/parse';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils from 'react-day-picker/moment';
import moment from 'moment';
import 'moment/locale/es';

const serverURL = Config.prototype.serverURL();
const INITIAL_STATE = {
    // for showing the associated vehicle
    showingAssociatedVehicle: false,
    associatedVehicle: null,
    associatedVehicleTitle: '',
    selectedDeviceVehicleId: 0,
    vehiclesList: [],

    // for showing the associated simcard    
    selectedDeviceSimcardId: 0,
    simcardsList: [],

    // for showing the associated dealer    
    selectedDeviceDealerId: 0,
    dealersList: [],

    // for showing the associated device model    
    selectedDeviceDeviceModelId: 0,
    devicesModelsList: [],

    // basic actions
    editing: false,
    deleting: false,
    saving: false,
    adding: false,

    // device info
    imei: '',
    speedLimit: '',
    installedAt: '',
    selectedInstalledAt: '',
    expiresAt: '',
    observations: '',
    status: false,
    editingDeviceId: 0,
    devicesList: [],
    devicesShown: 0,
    devicesListScrollTop: 0,

    // search info
    searchText: '',
    msgText: '',
    msgClass: classNames({
        'panel-message': true,
        'hidden': true,
        'running': false,
        'success': false,
        'error': false
    }),

    // loader info
    loaderClass: classNames({
        'loader': true,
        'hidden': true
    })
};
const MONTHS = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];
const WEEKDAYS_LONG = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
];
const WEEKDAYS_SHORT = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

const FORMAT = 'yyyy-MM-dd';

export default class DevicesPanel extends Component {
    /* #region MAIN */
    panel = null;

    constructor(props) {
        super(props)

        this.state = INITIAL_STATE;
        this.baseState = this.cloneInitialState();
        delete this.baseState.devicesList;

        console.log(INITIAL_STATE);
        console.log(this.baseState);
    }

    componentDidMount() {
        window.panelContainer.reorderPanels();
        this.panel = $('#' + this.props.pid);
        this.getDevices();
        this.getDevicesAssociations();
    }

    cloneInitialState = () => {
        let newObj = {};
        let key;

        for (key in INITIAL_STATE) {
            newObj[key] = INITIAL_STATE[key];
        }

        return newObj;
    }
    /* #endregion */

    /* #region GETTER METHODS */
    getDevices = (callback = null, isLoaded = false) => {
        this.setState({
            loaderClass: classNames({
                'loader': true,
                'hidden': false
            })
        });

        setTimeout(async () => {
            await axios.get(serverURL + '/getDevices')
                .then(res => {
                    let wrapper = this.panel.find('#tbl-devices .wrapper');

                    if (res.data.result === 'OK') {
                        this.setState({
                            devicesList: res.data.devices,
                            devicesShown: res.data.devices.length
                        });
                        this.handleInputSearch();
                    } else {
                        wrapper.html('<div class="no-records">No hay dispositivos gps registrados</div>');
                        this.setState({ devicesShown: 0 });
                    }

                    setTimeout(() => {
                        this.setState({
                            msgClass: classNames({
                                'panel-message': true,
                                'hidden': true,
                                'running': false,
                                'success': false,
                                'error': false
                            })
                        });
                    }, 1000);
                })
                .catch(e => {
                    console.log(e);
                })
                .finally(() => {
                    this.setState({
                        loaderClass: classNames({
                            'loader': true,
                            'hidden': true
                        })
                    });

                    this.panel.find('.sub-panels').fadeOut(100, () => {
                        if (callback !== null) {
                            callback();
                        }
                    });

                    if (!isLoaded) {
                        if (this.props.did > 0) {
                            this.editFromAssociated(this.props.did);
                        } else if (this.props.did === 0) {
                            this.addFromAssociated();
                        }
                    }
                })
        }, 200);
    }

    getDevicesAssociations = () => {
        axios.get(serverURL + '/getDevicesAssociations')
            .then(res => {
                const simcardsList = res.data.unasigned_simcards.map(simcard => {
                    simcard.current = false;
                    return simcard;
                });
                const vehiclesList = res.data.vehicles.map(vehicle => {
                    vehicle.current = false;
                    return vehicle;
                });
                const dealersList = res.data.dealers.map(dealer => {
                    dealer.current = false;
                    return dealer;
                });
                const devicesModelsList = res.data.devices_models.map(device_model => {
                    device_model.current = false;
                    return device_model;
                });
                this.setState({
                    simcardsList,
                    vehiclesList,
                    dealersList,
                    devicesModelsList
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    onRefreshDeviceList = (e) => {
        this.getDevicesAssociations();
        this.getDevices(null, true);
    }
    /* #endregion */

    /* #region HANDLELING FORM */
    inputSearchChange = async (e) => {
        await this.setState({
            searchText: e.target.value.trim().toLowerCase()
        });

        if (this.state.searchText === '') {
            this.handleInputSearch();
        }
    }

    onKeyUpSearch = (e) => {
        if (e.keyCode === 27 || e.which === 27) {
            this.onClearSearch();
        } else if (e.keyCode === 13 || e.which === 13) {
            this.handleInputSearch();
        }
    }

    onClearSearch = async (e) => {
        await this.setState({
            searchText: ''
        });
        this.handleInputSearch();
    }

    handleInputSearch = () => {
        this.panel.find('#tbl-devices .tcol').css('color', 'black');
        this.panel.find('.btn-edit-device').css('color', 'black');
        this.panel.find('.btn-show-device-vehicle').css('color', 'black');

        let wrapper = this.panel.find('#tbl-devices .wrapper');

        if (this.state.searchText.substring(0, 1) === '*') {
            if (this.state.searchText === '*s1') {
                wrapper.find('.trow.active').css('display', 'flex');
                wrapper.find('.trow.inactive').css('display', 'none');
                this.setState({ devicesShown: wrapper.find('.trow.active').length });
            } else if (this.state.searchText === '*s0') {
                wrapper.find('.trow.active').css('display', 'none');
                wrapper.find('.trow.inactive').css('display', 'flex');
                this.setState({ devicesShown: wrapper.find('.trow.inactive').length });
            } else if (this.state.searchText === '*v1') {
                wrapper.find('.trow.has-vehicle').css('display', 'flex');
                wrapper.find('.trow.no-vehicle').css('display', 'none');
                this.setState({ devicesShown: wrapper.find('.trow.has-vehicle').length });
            } else if (this.state.searchText === '*v0') {
                wrapper.find('.trow.has-vehicle').css('display', 'none');
                wrapper.find('.trow.no-vehicle').css('display', 'flex');
                this.setState({ devicesShown: wrapper.find('.trow.no-vehicle').length });
            }
            else {
                wrapper.find('.trow').css('display', 'flex');
                this.setState({ devicesShown: wrapper.find('.trow').length });
            }
        }
        else if (this.state.searchText === '') {
            wrapper.find('.trow').css('display', 'flex');
            this.setState({ devicesShown: wrapper.find('.trow').length });
        }
        else {
            let count = 0;

            for (let i = 0; i < wrapper.find('.trow').length; i++) {
                let row = wrapper.find('.trow').eq(i);
                // #region DEVICE
                let deviceDealer = row.find('.device-dealer');
                let deviceModel = row.find('.device-model');
                let deviceSimcard = row.find('.device-simcard');
                let imei = row.find('.imei');
                let speedLimit = row.find('.speed-limit');
                let installedAt = row.find('.installed-at');
                let observations = row.find('.observations');
                let btnEditDevice = row.find('.btn-edit-device');
                // #endregion

                // #region DEVICE VEHICLE
                let licensePlate = row.find('.vehicle-license-plate');
                let brand = row.find('.vehicle-brand');
                let model = row.find('.vehicle-model');
                let type = row.find('.vehicle-type');
                let year = row.find('.vehicle-year');
                let color = row.find('.vehicle-color');
                let vehicleObservations = row.find('.vehicle-observations');
                let btnShowDeviceVehicle = row.find('.btn-show-device-vehicle');
                // #endregion               

                let showRow = false;
                let inDevice = false;
                let inDeviceVehicle = false;

                if (
                    deviceDealer.text().toLowerCase().includes(this.state.searchText) ||
                    deviceModel.text().toLowerCase().includes(this.state.searchText) ||
                    deviceSimcard.text().toLowerCase().includes(this.state.searchText) ||
                    imei.text().toLowerCase().includes(this.state.searchText) ||
                    speedLimit.text().toLowerCase().includes(this.state.searchText) ||
                    installedAt.text().toLowerCase().includes(this.state.searchText)
                ) {
                    showRow = true;
                }

                if (
                    observations.text().toLowerCase().includes(this.state.searchText)
                ) {
                    showRow = true;
                    inDevice = true;
                }

                if (
                    licensePlate.text().toLowerCase().includes(this.state.searchText) ||
                    brand.text().toLowerCase().includes(this.state.searchText) ||
                    model.text().toLowerCase().includes(this.state.searchText) ||
                    type.text().toLowerCase().includes(this.state.searchText) ||
                    year.text().toLowerCase().includes(this.state.searchText) ||
                    color.text().toLowerCase().includes(this.state.searchText) ||
                    vehicleObservations.text().toLowerCase().includes(this.state.searchText)
                ) {
                    showRow = true;
                    inDeviceVehicle = true;
                }

                deviceDealer.css('color', deviceDealer.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                deviceModel.css('color', deviceModel.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                deviceSimcard.css('color', deviceSimcard.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                imei.css('color', imei.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                speedLimit.css('color', speedLimit.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                installedAt.css('color', installedAt.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');

                btnEditDevice.css('color', inDevice ? 'red' : 'black');
                btnShowDeviceVehicle.css('color', inDeviceVehicle ? 'red' : 'black');

                row.css('display', showRow ? 'flex' : 'none');
                if (showRow) { count++ };
            }

            this.setState({ devicesShown: count });
        }
    }

    handleInputChange = (e) => {
        if ((e.target.name).replace('-' + this.props.pid, '') === 'status') {
            this.setState({
                status: e.target.checked
            });

        } else if ((e.target.name).replace('-' + this.props.pid, '') === 'device-model-id') {
            this.setState({
                selectedDeviceDeviceModelId: e.target.value === '' ? 0 : Number(e.target.value)
            });
        } else if ((e.target.name).replace('-' + this.props.pid, '') === 'simcard-id') {
            this.setState({
                selectedDeviceSimcardId: e.target.value === '' ? 0 : Number(e.target.value)
            });
        } else if ((e.target.name).replace('-' + this.props.pid, '') === 'dealer-id') {
            this.setState({
                selectedDeviceDealerId: e.target.value === '' ? 0 : Number(e.target.value)
            });
        } else if ((e.target.name).replace('-' + this.props.pid, '') === 'vehicle-id') {
            this.setState({
                selectedDeviceVehicleId: e.target.value === '' ? 0 : Number(e.target.value)
            });
        } else if ((e.target.name).replace('-' + this.props.pid, '') === 'speed-limit') {
            this.setState({
                speedLimit: e.target.value === '' ? 0 : Number(e.target.value)
            });
        } else {
            this.setState({
                [(e.target.name).replace('-' + this.props.pid, '')]: e.target.value === '' ? '' : e.target.validity.valid ? e.target.value : this.state[(e.target.name).replace('-' + this.props.pid, '')]
            });
        }
    }

    onSubmit = async (e) => {
        e.preventDefault();

        let deviceList = $(e.target).closest('.panel').find('.tbl');

        if ((this.state.editing || this.state.adding) && !this.state.status) {
            if (!window.confirm(`
                Si deshabilita este dispositivo gps, también estará\r\n
                deshabilitando el vehículo asociado...\r\n
                ¿Desea continuar?
            `)) {
                return;
            }
        }

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
            serverURL + '/saveDevice',
            {
                id: this.state.editingDeviceId,
                device_model_id: this.state.selectedDeviceDeviceModelId,
                dealer_id: this.state.selectedDeviceDealerId,
                sim_card_id: this.state.selectedDeviceSimcardId,
                vehicle_id: this.state.selectedDeviceVehicleId,
                imei: this.state.imei,
                speed_limit: this.state.speedLimit,
                installed_at: this.state.installedAt,
                observations: this.state.observations,
                status: this.state.status
            }
        )
            .then(res => {
                console.log(res.data);

                if (res.data.result === 'CREATED' || res.data.result === 'UPDATED') {
                    let msg = res.data.result === 'CREATED' ?
                        'El dispositivo gps ha sido ingresado exitosamente. Actualizando lista, por favor espere' :
                        'El dispositivo gps ha sido actualizado exitosamente. Actualizando lista, por favor espere';

                    this.setState({
                        msgClass: classNames({
                            'panel-message': true,
                            'hidden': true,
                            'running': false,
                            'success': false,
                            'error': false
                        })
                    });

                    setTimeout(() => {
                        this.setState(INITIAL_STATE);

                        this.setState({
                            msgText: msg,
                            msgClass: classNames({
                                'panel-message': true,
                                'hidden': false,
                                'running': false,
                                'success': true,
                                'error': false
                            })
                        });

                        deviceList.find('.trow').removeClass('editing');
                        this.getDevicesAssociations();
                        this.getDevices(null, true);
                    }, 200);
                }

                if (res.data.result === 'DUPLICATED IMEI') {
                    this.setState({
                        msgClass: classNames({
                            'panel-message': true,
                            'hidden': true,
                            'running': false,
                            'success': false,
                            'error': false
                        })
                    });

                    setTimeout(() => {
                        this.setState({
                            saving: false,
                            msgText: 'Ya existe un dispositivo gps con el imei ingresado',
                            msgClass: classNames({
                                'panel-message': true,
                                'hidden': false,
                                'running': false,
                                'success': false,
                                'error': true
                            }),
                            loaderClass: classNames({
                                'loader': true,
                                'hidden': true
                            })
                        });

                        setTimeout(() => {
                            this.setState({
                                msgClass: classNames({
                                    'panel-message': true,
                                    'hidden': true,
                                    'running': false,
                                    'success': false,
                                    'error': false
                                })
                            });
                        }, 2000);
                    }, 200);
                }
            })
            .catch(e => {
                console.log(e);

                this.setState({
                    msgClass: classNames({
                        'panel-message': true,
                        'hidden': true,
                        'running': false,
                        'success': false,
                        'error': false
                    })
                });

                setTimeout(() => {
                    this.setState({
                        saving: false,
                        msgText: 'Ocurrió un error en el servidor',
                        msgClass: classNames({
                            'panel-message': true,
                            'hidden': false,
                            'running': false,
                            'success': false,
                            'error': true
                        }),
                        loaderClass: classNames({
                            'loader': true,
                            'hidden': true
                        })
                    });

                    setTimeout(() => {
                        this.setState({
                            msgClass: classNames({
                                'panel-message': true,
                                'hidden': true,
                                'running': false,
                                'success': false,
                                'error': false
                            })
                        });
                    }, 2000);
                }, 200);
            });
    }

    btnAddNewDeviceClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        this.setState({
            adding: true,
            editingDeviceId: 0
        });
    }

    btnCancelClick = (e) => {
        const curDevicesList = this.state.devicesList;
        this.setState(this.baseState);
        setTimeout(() => {
            this.panel.find('.sub-panels').fadeOut();
            this.getDevicesAssociations();
            const devicesList = curDevicesList.map(device => {
                device.isSelected = false;
                return device;
            });

            this.state.devicesList = devicesList;
            this.setState({ devicesShown: devicesList.length });

        }, 400);
    }

    btnEditClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        const devicesList = this.state.devicesList.map(device => {
            if (device.id === id) {
                device.isSelected = true;

                const simcardsList = [
                    {
                        id: device.sim_card.id,
                        operator: device.sim_card.operator,
                        gsm: device.sim_card.gsm,
                        current: true
                    },
                    ...this.state.simcardsList
                ];

                const vehiclesList = this.state.vehiclesList.sort((x, y) => {
                    return x.id === (device.vehicle ? device.vehicle.id : 0) ? -1 : y.id === (device.vehicle ? device.vehicle.id : 0) ? 1 : 0;
                }).map(vehicle => {
                    vehicle.current = device.vehicle ? device.vehicle.id === vehicle.id : false;
                    return vehicle;
                });

                const dealersList = this.state.dealersList.sort((x, y) => {
                    return x.id === device.dealer.id ? -1 : y.id === device.dealer.id ? 1 : 0;
                }).map(dealer => {
                    dealer.current = device.dealer.id === dealer.id;
                    return dealer;
                });

                const devicesModelsList = this.state.devicesModelsList.sort((x, y) => {
                    return x.id === device.device_model.id ? -1 : y.id === device.device_model.id ? 1 : 0;
                }).map(device_model => {
                    device_model.current = device.device_model.id === device_model.id;
                    return device_model;
                });

                this.setState({
                    editingDeviceId: id,
                    selectedDeviceDeviceModelId: device.device_model.id,
                    selectedDeviceDealerId: device.dealer.id,
                    selectedDeviceSimcardId: device.sim_card.id,
                    selectedDeviceVehicleId: device.vehicle ? device.vehicle.id : 0,
                    imei: device.imei,
                    speedLimit: device.speed_limit,
                    installedAt: device.installed_at,
                    selectedInstalledAt: device.installed_at,
                    observations: device.observations,
                    status: device.status === 1 ? true : false,
                    simcardsList,
                    vehiclesList,
                    dealersList,
                    devicesModelsList
                });

                return device;
            } else {
                return device;
            }
        })

        this.setState({
            editing: true,
            devicesList
        });
    }

    btnDeleteClick = async (e) => {
        let id = Number($(e.target).closest('.trow').attr('id'));

        if (window.confirm('¿Está seguro que desea eliminar este dispositivo gps?')) {
            this.setState({
                deleting: true,
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

            await axios.post(serverURL + '/deleteDevice', { id: id })
                .then(res => {
                    if (res.data.result === 'OK') {
                        this.setState({
                            msgClass: classNames({
                                'panel-message': true,
                                'hidden': true,
                                'running': false,
                                'success': false,
                                'error': false
                            })
                        });

                        setTimeout(() => {
                            this.setState({
                                deleting: false,
                                msgText: 'El dispositivo gps ha sido eliminado exitosamente. Actualizando lista, por favor espere',
                                msgClass: classNames({
                                    'panel-message': true,
                                    'hidden': false,
                                    'running': false,
                                    'success': true,
                                    'error': false
                                })
                            });

                            this.getDevices(null, true);
                        }, 200);
                    } else {
                        this.setState({
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
                            })
                        });
                    }
                })
                .catch(e => {
                    this.setState({
                        msgClass: classNames({
                            'panel-message': true,
                            'hidden': true,
                            'running': false,
                            'success': false,
                            'error': false
                        })
                    });

                    setTimeout(() => {
                        this.setState({
                            deleting: false,
                            msgText: 'Ocurrió un error en el servidor',
                            msgClass: classNames({
                                'panel-message': true,
                                'hidden': false,
                                'running': false,
                                'success': false,
                                'error': true
                            }),
                            loaderClass: classNames({
                                'loader': true,
                                'hidden': true
                            })
                        });

                        setTimeout(() => {
                            this.setState({
                                msgClass: classNames({
                                    'panel-message': true,
                                    'hidden': true,
                                    'running': false,
                                    'success': false,
                                    'error': false
                                })
                            });
                        }, 2000);
                    }, 200);
                });
        }
    }

    parseDate = (str, format, locale) => {
        const parsed = dateFnsParse(str, format, { locale });
        if (DateUtils.isDate(parsed)) {
            return parsed;
        }
        return undefined;
    }

    formatDate = (date, format, locale) => {
        return dateFnsFormat(date, format, { locale });
    }

    renderInputDate = (props) => {
        const inputBoxClasses = classNames({
            'input-box-container': true,
            'disabled': (!this.state.adding && !this.state.editing) || this.state.saving
        });
        return (
            <div className={inputBoxClasses}>
                <input {...props} type="text" name={'installed-at-' + this.props.pid} id={'installed-at-' + this.props.pid} value={this.state.installedAt} required />
                <label htmlFor={'installed-at-' + this.props.pid}>F. Instalación</label>
            </div>
        );
    };

    handleDayChange = selectedDay => {
        this.setState({
            installedAt: moment(selectedDay).format('YYYY-MM-DD')
        });
    }

    addFromAssociated = (isOpened = false) => {
        this.panel.find('.sub-panels').fadeIn();
        let wrapper = this.panel.find('#tbl-devices .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getDevicesAssociations();
            this.getDevices(() => {
                this.setState({
                    adding: true,
                    devicesListScrollTop: wrapper.scrollTop(0)
                });
            });
        } else {
            this.setState({
                adding: true
            });
        }
    }

    editFromAssociated = (id, isOpened = false) => {
        this.panel.find('.sub-panels').fadeIn();
        let wrapper = this.panel.find('#tbl-devices .wrapper');
        
        if (isOpened) {            
            this.setState(INITIAL_STATE);
            this.getDevicesAssociations();
            this.getDevices( () => {
                this.panel.find('.sub-panels').fadeIn();
                const devicesList = this.state.devicesList.map(device => {
                    if (device.id === id){
                        device.isSelected = true;

                        const simcardsList = [
                            {
                                id: device.sim_card.id,
                                operator: device.sim_card.operator,
                                gsm: device.sim_card.gsm,
                                current: true
                            },
                            ...this.state.simcardsList
                        ];
        
                        const vehiclesList = this.state.vehiclesList.sort((x, y) => {
                            return x.id === device.vehicle.id ? -1 : y.id === device.vehicle.id ? 1 : 0;
                        }).map(vehicle => {
                            vehicle.current = device.vehicle.id === vehicle.id;
                            return vehicle;
                        });
        
                        const dealersList = this.state.dealersList.sort((x, y) => {
                            return x.id === device.dealer.id ? -1 : y.id === device.dealer.id ? 1 : 0;
                        }).map(dealer => {
                            dealer.current = device.dealer.id === dealer.id;
                            return dealer;
                        });
        
                        const devicesModelsList = this.state.devicesModelsList.sort((x, y) => {
                            return x.id === device.device_model.id ? -1 : y.id === device.device_model.id ? 1 : 0;
                        }).map(device_model => {
                            device_model.current = device.device_model.id === device_model.id;
                            return device_model;
                        });
        
                        this.setState({
                            editingDeviceId: id,
                            selectedDeviceDeviceModelId: device.device_model.id,
                            selectedDeviceDealerId: device.dealer.id,
                            selectedDeviceSimcardId: device.sim_card.id,
                            selectedDeviceVehicleId: device.vehicle ? device.vehicle.id : 0,
                            imei: device.imei,
                            speedLimit: device.speed_limit,
                            installedAt: device.installed_at,
                            selectedInstalledAt: device.installed_at,
                            observations: device.observations,
                            status: device.status === 1 ? true : false,
                            simcardsList,
                            vehiclesList,
                            dealersList,
                            devicesModelsList
                        });

                        return device;
                    }else{
                        return device;
                    }
                });

                this.setState({
                    devicesList,
                    editing: true,
                    devicesListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
                });
            });
        } else {            
            const devicesList = this.state.devicesList.map(device => {
                if (device.id === id){
                    device.isSelected = true;

                    const simcardsList = [
                        {
                            id: device.sim_card.id,
                            operator: device.sim_card.operator,
                            gsm: device.sim_card.gsm,
                            current: true
                        },
                        ...this.state.simcardsList
                    ];
    
                    const vehiclesList = this.state.vehiclesList.sort((x, y) => {
                        return x.id === device.vehicle.id ? -1 : y.id === device.vehicle.id ? 1 : 0;
                    }).map(vehicle => {
                        vehicle.current = device.vehicle.id === vehicle.id;
                        return vehicle;
                    });
    
                    const dealersList = this.state.dealersList.sort((x, y) => {
                        return x.id === device.dealer.id ? -1 : y.id === device.dealer.id ? 1 : 0;
                    }).map(dealer => {
                        dealer.current = device.dealer.id === dealer.id;
                        return dealer;
                    });
    
                    const devicesModelsList = this.state.devicesModelsList.sort((x, y) => {
                        return x.id === device.device_model.id ? -1 : y.id === device.device_model.id ? 1 : 0;
                    }).map(device_model => {
                        device_model.current = device.device_model.id === device_model.id;
                        return device_model;
                    });
    
                    this.setState({
                        editingDeviceId: id,
                        selectedDeviceDeviceModelId: device.device_model.id,
                        selectedDeviceDealerId: device.dealer.id,
                        selectedDeviceSimcardId: device.sim_card.id,
                        selectedDeviceVehicleId: device.vehicle ? device.vehicle.id : 0,
                        imei: device.imei,
                        speedLimit: device.speed_limit,
                        installedAt: device.installed_at,
                        selectedInstalledAt: device.installed_at,
                        observations: device.observations,
                        status: device.status === 1 ? true : false,
                        simcardsList,
                        vehiclesList,
                        dealersList,
                        devicesModelsList
                    });

                    return device;
                }else{
                    return device;
                }
            });

            this.setState({
                devicesList,
                editing: true,
                devicesListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
            });
        }
    }
    /* #endregion */

    /* #region HANDLELING DEVICE VEHICLE */
    btnShowingAssociatedVehicle = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        const devicesList = this.state.devicesList.map(device => {
            if (device.id === id) {
                device.isSelected = true;

                this.setState({
                    associatedVehicleTitle: device.imei,
                    associatedVehicle: device.vehicle,
                    selectedDeviceVehicleId: device.vehicle.id
                });

                return device;
            } else {
                device.isSelected = false;
                return device;
            }
        })

        this.setState({
            showingAssociatedVehicle: true,
            devicesList
        });
    }

    btnCloseShowingAssociatedVehicle = (e) => {
        const curDevicesList = this.state.devicesList;
        this.setState(this.baseState);
        setTimeout(() => {
            this.panel.find('.sub-panels').fadeOut();
            this.getDevicesAssociations();
            const devicesList = curDevicesList.map(device => {
                device.isSelected = false;
                return device;
            });

            this.state.devicesList = devicesList;
            this.setState({ devicesShown: devicesList.length });

        }, 400);        
    }

    btnEditShowingAssociatedVehicle = () => {
        let panelState = window.panelContainer.getState();

        let exist = false;

        for (let i = 0; i < panelState.panels.length; i++) {
            if (panelState.panels[i].id === 'panel-vehicles') {
                exist = true;
                break;
            }
        }

        if (!exist) {
            window.panelContainer.addPanel({ id: 'panel-vehicles', type: 'vehicles', vid: this.state.selectedDeviceVehicleId });
        } else {
            window.vehicles.editFromAssociated(this.state.selectedVehicleClientId, true);
            window.panelContainer.panelToFront('panel-vehicles');
        }
    }
    /* #endregion */

    /* #region RENDER METHOD */
    render() {
        /* #region SUB PANEL FORM CLASSES */
        const subPanelFormClasses = classNames({
            'sub-panel': true,
            'sub-panel-form': true,
            'hidden': (!this.state.adding && !this.state.editing) || this.state.showingSelectingClient
        });

        const inputBoxClasses = classNames({
            'input-box-container': true,
            'disabled': (!this.state.adding && !this.state.editing) || this.state.saving
        });

        const toggleBoxClasses = classNames({
            'input-toggle-container': true,
            'disabled': (!this.state.adding && !this.state.editing) || this.state.saving
        });

        const selectBoxClasses = classNames({
            'select-box-container': true,
            'disabled': (!this.state.adding && !this.state.editing) || this.state.saving
        });

        const formMochiButtonClasses = classNames({
            'mochi-button': true,
            'disabled': (!this.state.adding && !this.state.editing) || this.state.saving
        });
        /* #endregion */

        /* #region SUB PANEL DEVICE VEHICLE CLASSES */
        const subPanelDeviceVehicleClasses = classNames({
            'sub-panel': true,
            'sub-panel-device-vehicle': true,
            'hidden': !this.state.showingAssociatedVehicle
        });

        /* #endregion */

        /* #region CLIENT LIST CLASSES */
        const btnAddNewDeviceClasses = classNames({
            'disabled': this.state.adding || this.state.editing
        });

        const inputBoxSearchClasses = classNames({
            'input-box-container': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });

        const btnClearSearchClasses = classNames({
            'clear-search-icon': true,
            'hidden': this.state.searchText === ''
        });

        const btnRefreshDeviceListClasses = classNames({
            'btn-refresh-devices-list': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });

        const tblDevicesClasses = classNames({
            'tbl': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });
        /* #endregion */
        return (
            <div className="panel" id={this.props.pid}>
                <div className="panel-wrapper">

                    <div className="sub-panels">
                        <div className="sub-panels-wrapper">
                            <div className={subPanelFormClasses}>
                                <div className='sub-panel-title'>
                                    {this.state.adding ? 'Nuevo Dispositivo' : this.state.editing ? 'Editar Dispositivo' : ''}
                                </div>

                                <form className="" onSubmit={this.onSubmit}>
                                    <div className={selectBoxClasses}>
                                        <select id={'device-model-id-' + this.props.pid} name={'device-model-id-' + this.props.pid} onChange={this.handleInputChange} value={this.state.selectedDeviceDeviceModelId} required >
                                            <option value=""></option>
                                            {
                                                this.state.devicesModelsList.map((device_model) => {
                                                    const deviceModelClasses = classNames({
                                                        current: device_model.current
                                                    });
                                                    return <option key={device_model.id} className={deviceModelClasses} value={device_model.id}>{device_model.device_brand} - {device_model.device_model}</option>
                                                })
                                            }
                                        </select>
                                        <label htmlFor={'device-model-id-' + this.props.pid}>Modelo de Dispositivo</label>
                                    </div>

                                    <div className={selectBoxClasses}>
                                        <select id={'dealer-id-' + this.props.pid} name={'dealer-id-' + this.props.pid} onChange={this.handleInputChange} value={this.state.selectedDeviceDealerId} required >
                                            <option value=""></option>
                                            {
                                                this.state.dealersList.map((dealer) => {
                                                    const dealerClasses = classNames({
                                                        current: dealer.current
                                                    });
                                                    return <option key={dealer.id} className={dealerClasses} value={dealer.id}>{dealer.name} ({dealer.dni})</option>
                                                })
                                            }
                                        </select>
                                        <label htmlFor={'dealer-id-' + this.props.pid}>Dealer</label>
                                    </div>

                                    <div className={selectBoxClasses}>
                                        <select id={'simcard-id-' + this.props.pid} name={'simcard-id-' + this.props.pid} onChange={this.handleInputChange} value={this.state.selectedDeviceSimcardId} required >
                                            <option value=""></option>
                                            {
                                                this.state.simcardsList.map((simcard) => {
                                                    const simcardClasses = classNames({
                                                        current: simcard.current
                                                    });

                                                    return <option key={simcard.id} className={simcardClasses} value={simcard.id}>{simcard.gsm} ({simcard.operator})</option>
                                                })
                                            }
                                        </select>
                                        <label htmlFor={'simcard-id-' + this.props.pid}>Simcard</label>
                                    </div>

                                    <div className={selectBoxClasses}>
                                        <select id={'vehicle-id-' + this.props.pid} name={'vehicle-id-' + this.props.pid} onChange={this.handleInputChange} value={this.state.selectedDeviceVehicleId} >
                                            <option value=""></option>
                                            {
                                                this.state.vehiclesList.map((vehicle) => {
                                                    const vehicleClasses = classNames({
                                                        current: vehicle.current
                                                    });
                                                    return <option key={vehicle.id} className={vehicleClasses} value={vehicle.id}>{vehicle.license_plate} ({vehicle.brand} {vehicle.model})</option>
                                                })
                                            }
                                        </select>
                                        <label htmlFor={'vehicle-id-' + this.props.pid}>Vehículo</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input maxLength="15" type="text" name={'imei-' + this.props.pid} id={'imei-' + this.props.pid} pattern="[0-9]*" onInput={this.handleInputChange} onChange={this.handleInputChange} value={this.state.imei} required />
                                        <label htmlFor={'imei-' + this.props.pid}>Imei</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input maxLength="3" type="text" name={'speed-limit-' + this.props.pid} id={'speed-limit-' + this.props.pid} pattern="[0-9]*" onInput={this.handleInputChange} onChange={this.handleInputChange} value={this.state.speedLimit} required />
                                        <label htmlFor={'speed-limit-' + this.props.pid}>Velocidad Límite</label>
                                    </div>

                                    <DayPickerInput
                                        formatDate={this.formatDate}
                                        format={FORMAT}
                                        parseDate={this.parseDate}
                                        placeholder=''
                                        onDayChange={this.handleDayChange}
                                        selectedDay={this.state.selectedInstalledAt}
                                        locale='es'
                                        localeUtils={MomentLocaleUtils}
                                        months={MONTHS}
                                        weekdaysLong={WEEKDAYS_LONG}
                                        weekdaysShort={WEEKDAYS_SHORT}
                                        component={props => this.renderInputDate(props)}
                                    />

                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'observations-' + this.props.pid} id={'observations-' + this.props.pid} onChange={this.handleInputChange} value={this.state.observations} required />
                                        <label htmlFor={'observations-' + this.props.pid}>Observaciones</label>
                                    </div>

                                    <div className={toggleBoxClasses}>
                                        <input type="checkbox" id={'status-' + this.props.pid} name={'status-' + this.props.pid} onChange={this.handleInputChange} checked={this.state.status} />
                                        <label htmlFor={'status-' + this.props.pid} title="Status">
                                            <div className="lbl-toggle-button">Status</div>
                                            <div className="input-toggle-button"></div>
                                        </label>
                                    </div>

                                    <div className="btn-area-form">
                                        <div className="top-bordered"></div>
                                        <div className={formMochiButtonClasses} onClick={this.btnCancelClick}>
                                            <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                            <button type="button" id="btn-cancel" name="btn-cancel">Cancelar</button>
                                            <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                        </div>
                                        <div className={formMochiButtonClasses}>
                                            <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                            <button type="submit" id="submit" name="submit">Guardar</button>
                                            <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        
                            <div className={subPanelDeviceVehicleClasses}>
                                <div className='sub-panel-title'>
                                    Vehiculo Asociado ({this.state.associatedVehicleTitle})
                                </div>

                                <div className="device-vehicle-container">
                                    <div className="row">
                                        <div className="left-col device-vehicle-id hidden">Id</div>
                                        <div className="right-col device-vehicle-id hidden">{this.state.associatedVehicle ? this.state.associatedVehicle.id : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col device-vehicle-license-plate">Matrícula</div>
                                        <div className="right-col device-vehicle-license-plate">{this.state.associatedVehicle ? this.state.associatedVehicle.license_plate : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col device-vehicle-brand">Marca</div>
                                        <div className="right-col capitalize device-vehicle-brand">{this.state.associatedVehicle ? this.state.associatedVehicle.brand : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col device-vehicle-model">Modelo</div>
                                        <div className="right-col capitalize device-vehicle-model">{this.state.associatedVehicle ? this.state.associatedVehicle.model : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col device-vehicle-type">Tipo</div>
                                        <div className="right-col capitalize device-vehicle-type">{this.state.associatedVehicle ? this.state.associatedVehicle.type : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col device-vehicle-year">Año</div>
                                        <div className="right-col device-vehicle-year">{this.state.associatedVehicle ? this.state.associatedVehicle.year : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col device-vehicle-color">Color</div>
                                        <div className="right-col capitalize device-vehicle-color">{this.state.associatedVehicle ? this.state.associatedVehicle.color : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col device-vehicle-observations">Observaciones</div>
                                        <div className="right-col device-vehicle-observations">{this.state.associatedVehicle ? this.state.associatedVehicle.observations : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col device-vehicle-status">Estado</div>
                                        <div className="right-col device-vehicle-status">{this.state.associatedVehicle ? this.state.associatedVehicle.status === 1 ? 'Activo' : 'Inactivo' : ''}</div>
                                    </div>                                    
                                </div>

                                <div className="btn-area">
                                    <div className="mochi-button" onClick={this.btnCloseShowingAssociatedVehicle}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-close-associated-vehicle" name="btn-close-associated-vehicle">Cancelar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                    <div className="mochi-button" onClick={this.btnEditShowingAssociatedVehicle}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-edit-associated-vehicle" name="btn-edit-associated-vehicle">Editar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel-content">
                        <div className="panel-title">
                            <div className="border-top"></div>
                            <span >Dispositivos Gps <span className="counter">{this.state.devicesShown}</span>
                                <div className={this.state.loaderClass} id={'loader' + this.props.pid}>
                                    <FontAwesomeIcon className="fas fa-spin" icon={faSpinner} />
                                </div>
                            </span>
                            <FontAwesomeIcon className={btnAddNewDeviceClasses} icon={faPlus} id="btn-new-device" title="Agregar Nuevo Dispositivo Gps" onClick={this.btnAddNewDeviceClick} />
                            <div className="border-bottom"></div>
                        </div>

                        <div className="content">
                            <div className={this.state.msgClass}>
                                {this.state.msgText}
                            </div>

                            <div className="devices-list">
                                <div className="search-container">
                                    <div className={inputBoxSearchClasses}>
                                        <input type="search" name={'search-' + this.props.pid} id={'search-' + this.props.pid} onInput={this.inputSearchChange} onChange={this.inputSearchChange} onKeyUp={this.onKeyUpSearch} value={this.state.searchText} required />
                                        <label htmlFor={'search-' + this.props.pid}>Buscar</label>
                                        <FontAwesomeIcon className="search-icon" icon={faSearch} onClick={this.handleInputSearch} />
                                        <FontAwesomeIcon onClick={this.onClearSearch} className={btnClearSearchClasses} icon={faTimes} title="Limpiar Búsqueda" />
                                    </div>
                                    <FontAwesomeIcon title="Recargar lista de dispositivos" className={btnRefreshDeviceListClasses} icon={faSyncAlt} onClick={this.onRefreshDeviceList} />
                                </div>

                                <div className="devices-list-content">
                                    <div className={tblDevicesClasses} id="tbl-devices">
                                        <div className="thead">
                                            <div className="trow">
                                                <div className="tcol id hidden">Id</div>
                                                <div className="tcol device-dealer">Dealer</div>
                                                <div className="tcol device-model">Modelo</div>
                                                <div className="tcol device-simcard">Simcard</div>
                                                <div className="tcol imei">Imei</div>
                                                <div className="tcol speed-limit">Velocidad</div>
                                                <div className="tcol installed-at">F. Instalación</div>
                                                <div className="tcol expires-at hidden">F. Vencimiento</div>
                                                <div className="tcol observations hidden">Observaciones</div>
                                                <div className="tcol status hidden">Status</div>
                                                <div className="tcol action"></div>
                                            </div>
                                        </div>
                                        <div className="tbody">
                                            <div className="wrapper">
                                                {
                                                    this.state.devicesList.map(device => {
                                                        /* #region ROW CLASSES */
                                                        const devicesRowClasses = classNames({
                                                            'trow': true,
                                                            'active': device.status === 1,
                                                            'inactive': device.status === 0,
                                                            'selected': device.isSelected,
                                                            'has-vehicle': device.vehicle,
                                                            'no-vehicle': !device.vehicle
                                                        });

                                                        const btnShowDeviceVehicleClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-show-device-vehicle': true,
                                                            'no-vehicle': !device.vehicle
                                                        });

                                                        const btnEditDeviceClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-edit-device': true
                                                        });

                                                        const btnDeleteDeviceClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-delete-device': true
                                                        });
                                                        /* #endregion */
                                                        return (
                                                            <div className={devicesRowClasses} id={device.id} key={device.id}>
                                                                <div className="tcol id hidden">{device.id}</div>
                                                                <div className="tcol device-dealer">{device.dealer.name}</div>
                                                                <div className="tcol device-model">{device.device_model.device_brand + ' - ' + device.device_model.device_model}</div>
                                                                <div className="tcol device-simcard">{device.sim_card.gsm}</div>
                                                                <div className="tcol imei">{device.imei}</div>
                                                                <div className="tcol speed-limit">{device.speed_limit} Km/h</div>
                                                                <div className="tcol installed-at">{moment(device.installed_at).format('DD-MM-YYYY')}</div>
                                                                <div className="tcol expires-at hidden">{device.expires_at}</div>
                                                                <div className="tcol observations hidden">{device.observations}</div>
                                                                <div className="tcol status hidden">{device.status}</div>
                                                                <div className="tcol filler"></div>
                                                                <div className="tcol action">
                                                                    <FontAwesomeIcon icon={faCar} className={btnShowDeviceVehicleClasses} title="Ver vehículo" onClick={this.btnShowingAssociatedVehicle} />
                                                                    <FontAwesomeIcon onClick={this.btnEditClick} title="Editar" className={btnEditDeviceClasses} id={'btn-edit-vehicle-' + this.props.pid} icon={faPencilAlt} />
                                                                    <FontAwesomeIcon onClick={this.btnDeleteClick} title="Eliminar" className={btnDeleteDeviceClasses} id={'btn-delete-vehicle-' + this.props.pid} icon={faTrashAlt} />
                                                                </div>
                                                                <div className="tcol device-vehicle hidden">
                                                                    <div className="tcol vehicle-id">{device.vehicle ? device.vehicle.id : ''}</div>
                                                                    <div className="tcol vehicle-license-plate">{device.vehicle ? device.vehicle.license_plate : ''}</div>
                                                                    <div className="tcol vehicle-brand">{device.vehicle ? device.vehicle.brand : ''}</div>
                                                                    <div className="tcol vehicle-model">{device.vehicle ? device.vehicle.model : ''}</div>
                                                                    <div className="tcol vehicle-type">{device.vehicle ? device.vehicle.type : ''}</div>
                                                                    <div className="tcol vehicle-year">{device.vehicle ? device.vehicle.year : ''}</div>
                                                                    <div className="tcol vehicle-color">{device.vehicle ? device.vehicle.color : ''}</div>
                                                                    <div className="tcol vehicle-observations">{device.vehicle ? device.vehicle.observations : ''}</div>
                                                                    <div className="tcol vehicle-status">{device.vehicle ? device.vehicle.status === 1 ? 'Activo' : 'Inactivo' : ''}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="drag-handler"></div>
                        <div className="panel-not-focused"> </div>
                        <div className="panel-selection-handler"> </div>
                    </div>
                </div>
            </div >
        )
    }        
    /* #endregion */
}