import React, { Component } from 'react';
import './vehicles.css';
import Config from './../../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faSearch, faTimes, faSyncAlt, faUserTie, faPencilAlt, faTrashAlt, faSatellite } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import classNames from 'classnames';
import $ from 'jquery';
import moment from 'moment';

const serverURL = Config.prototype.serverURL();
const INITIAL_STATE = {
    // for showing the associated client
    showingAssociatedClient: false,
    associatedClient: null,
    associatedClientTitle: '',
    selectedVehicleClientId: 0,

    // for showing the associated devices
    showingAssociatedDevices: false,
    associatedDevices: [],
    associatedDevicesTitle: '',
    selectedVehicleDeviceId: 0,

    // for showing the client selection
    showingSelectingClient: false,
    selectingClientList: [],
    selectingClientTitle: '',
    selectedClient: null,
    selectingClientSearchText: '',

    // current client
    client_id: 0,
    client_name: '',

    // basic actions
    editing: false,
    deleting: false,
    saving: false,
    adding: false,

    // vehicle info
    licensePlate: '',
    brand: '',
    model: '',
    type: '',
    year: '',
    color: '',
    observations: '',
    status: false,
    iconType: 'default',
    iconSizeW: 20,
    iconSizeH: 20,
    editingVehicleId: 0,
    vehiclesList: [],
    vehiclesShown: 0,
    vehiclesListScrollTop: 0,

    // searching info
    searchText: '',
    msgText: '',
    msgClass: classNames({
        'panel-message': true,
        'hidden': true,
        'running': false,
        'success': false,
        'error': false
    }),

    // loader
    loaderClass: classNames({
        'loader': true,
        'hidden': true
    })
}

export default class VehiclesPanel extends Component {
    /* #region MAIN */
    panel = null;

    constructor(props) {
        super(props);

        this.state = INITIAL_STATE;
    }

    componentDidMount() {
        window.panelContainer.reorderPanels();
        this.panel = $('#' + this.props.pid);
        this.getVehicles();
        this.getClients();
    }
    /* #endregion */

    /* #region GETTER METHODS */
    getClients = async () => {
        await axios.get(serverURL + '/getClients')
            .then(res => {
                if (res.data.result === 'OK') {
                    const selectingClientList = res.data.clients.map(client => {
                        return {
                            id: client.id,
                            dni: client.dni,
                            name: client.name
                        }
                    });

                    this.setState({
                        selectingClientList
                    });
                }
            })
            .catch(e => {
                this.setState({
                    selectingClientList: []
                });
            })
    }

    getVehicles = (callback = null, isLoaded = false) => {
        this.setState({
            loaderClass: classNames({
                'loader': true,
                'hidden': false
            })
        });

        setTimeout(async () => {
            await axios.get(serverURL + '/getVehiclesWithDevicesChildren')
                .then(res => {
                    let wrapper = this.panel.find('#tbl-vehicles .wrapper');

                    if (res.data.result === 'OK') {
                        this.setState({
                            vehiclesList: res.data.vehicles,
                            vehiclesShown: res.data.vehicles.length
                        });
                        this.handleInputSearch();
                    } else {
                        wrapper.html('<div class="no-records">No hay vehículos registrados</div>');
                        this.setState({ vehiclesShown: 0 });
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
                        if (this.props.vid > 0) {
                            this.editFromAssociated(this.props.vid);
                        } else if (this.props.vid === 0) {
                            this.addFromAssociated();
                        }
                    }
                });
        }, 200);
    }

    onRefreshVehicleList = (e) => {
        this.getClients();
        this.getVehicles(null, true);
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
        this.panel.find('#tbl-vehicles .tcol').css('color', 'black');
        this.panel.find('.btn-edit-vehicle').css('color', 'black');
        this.panel.find('.btn-show-vehicle-client').css('color', 'black');
        this.panel.find('.btn-show-vehicle-devices').css('color', 'black');

        let wrapper = this.panel.find('#tbl-vehicles .wrapper');

        if (this.state.searchText.substring(0, 1) === '*') {
            if (this.state.searchText === '*s1') {
                wrapper.find('.trow.active').css('display', 'flex');
                wrapper.find('.trow.inactive').css('display', 'none');
                this.setState({ vehiclesShown: wrapper.find('.trow.active').length });
            } else if (this.state.searchText === '*s0') {
                wrapper.find('.trow.active').css('display', 'none');
                wrapper.find('.trow.inactive').css('display', 'flex');
                this.setState({ vehiclesShown: wrapper.find('.trow.inactive').length });
            } else if (this.state.searchText === '*c1') {
                wrapper.find('.trow.has-client').css('display', 'flex');
                wrapper.find('.trow.no-client').css('display', 'none');
                this.setState({ vehiclesShown: wrapper.find('.trow.has-client').length });
            } else if (this.state.searchText === '*c0') {
                wrapper.find('.trow.has-client').css('display', 'none');
                wrapper.find('.trow.no-client').css('display', 'flex');
                this.setState({ vehiclesShown: wrapper.find('.trow.no-client').length });
            } else if (this.state.searchText === '*d1') {
                wrapper.find('.trow.has-devices').css('display', 'flex');
                wrapper.find('.trow.no-devices').css('display', 'none');
                this.setState({ vehiclesShown: wrapper.find('.trow.has-devices').length });
            } else if (this.state.searchText === '*d0') {
                wrapper.find('.trow.has-devices').css('display', 'none');
                wrapper.find('.trow.no-devices').css('display', 'flex');
                this.setState({ vehiclesShown: wrapper.find('.trow.no-devices').length });
            }
            else {
                wrapper.find('.trow').css('display', 'flex');
                this.setState({ vehiclesShown: wrapper.find('.trow').length });
            }
        }
        else if (this.state.searchText === '') {
            wrapper.find('.trow').css('display', 'flex');
            this.setState({ vehiclesShown: wrapper.find('.trow').length });
        }
        else {
            let count = 0;

            for (let i = 0; i < wrapper.find('.trow').length; i++) {
                let row = wrapper.find('.trow').eq(i);
                // #region VEHICLE
                let licensePlate = row.find('.license-plate');
                let brand = row.find('.brand');
                let model = row.find('.model');
                let type = row.find('.type');
                let year = row.find('.year');
                let color = row.find('.color');
                let observations = row.find('.observations');
                let btnEditVehicle = row.find('.btn-edit-vehicle');
                // #endregion

                // #region VEHICLE CLIENT
                let dni = row.find('.client-dni');
                let name = row.find('.client-name');
                let email = row.find('.client-email');
                let phone = row.find('.client-phone');
                let address = row.find('.client-address');
                let clientObservations = row.find('.client-observations');
                let btnShowClient = row.find('.btn-show-vehicle-client');
                // #endregion

                // #region VEHICLE DEVICES
                let vehicleDevices = row.find('.vehicle-devices');
                let btnShowDevices = row.find('.btn-show-vehicle-devices');
                // #endregion

                let showRow = false;
                let inVehicle = false;
                let inVehicleClient = false;
                let inVehicleDevices = false;

                if (
                    licensePlate.text().toLowerCase().includes(this.state.searchText) ||
                    brand.text().toLowerCase().includes(this.state.searchText) ||
                    model.text().toLowerCase().includes(this.state.searchText) ||
                    type.text().toLowerCase().includes(this.state.searchText) ||
                    year.text().toLowerCase().includes(this.state.searchText) ||
                    color.text().toLowerCase().includes(this.state.searchText)
                ) {
                    showRow = true;
                }

                if (
                    observations.text().toLowerCase().includes(this.state.searchText)
                ) {
                    showRow = true;
                    inVehicle = true;
                }

                if (
                    dni.text().toLowerCase().includes(this.state.searchText) ||
                    name.text().toLowerCase().includes(this.state.searchText) ||
                    email.text().toLowerCase().includes(this.state.searchText) ||
                    phone.text().toLowerCase().includes(this.state.searchText) ||
                    address.text().toLowerCase().includes(this.state.searchText) ||
                    clientObservations.text().toLowerCase().includes(this.state.searchText)
                ) {
                    showRow = true;
                    inVehicleClient = true;
                } else {
                    for (let v = 0; v < vehicleDevices.find('.vehicle-device').length; v++) {
                        let vehicle = vehicleDevices.find('.vehicle-device').eq(v);

                        if (
                            vehicle.find('.device-model').text().toLowerCase().includes(this.state.searchText) ||
                            vehicle.find('.device-gsm').text().toLowerCase().includes(this.state.searchText) ||
                            vehicle.find('.device-dealer').text().toLowerCase().includes(this.state.searchText) ||
                            vehicle.find('.device-imei').text().toLowerCase().includes(this.state.searchText) ||
                            vehicle.find('.device-speed-limit').text().toLowerCase().includes(this.state.searchText) ||
                            vehicle.find('.device-installed-at').text().toLowerCase().includes(this.state.searchText)
                        ) {
                            showRow = true;
                            inVehicleDevices = true;
                            count++;
                            break;
                        }
                    }
                }

                licensePlate.css('color', licensePlate.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                brand.css('color', brand.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                model.css('color', model.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                type.css('color', type.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                year.css('color', year.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                color.css('color', color.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');

                btnEditVehicle.css('color', inVehicle ? 'red' : 'black');
                btnShowClient.css('color', inVehicleClient ? 'red' : 'black');
                btnShowDevices.css('color', inVehicleDevices ? 'red' : 'black');

                row.css('display', showRow ? 'flex' : 'none');
                if (showRow) { count++ };
            }

            this.setState({ vehiclesShown: count });
        }
    }

    handleInputChange = (e) => {
        if ((e.target.name).replace('-' + this.props.pid, '') === 'status') {
            this.setState({
                status: e.target.checked
            });

        } else if ((e.target.name).replace('-' + this.props.pid, '') === 'license-plate') {
            this.setState({
                licensePlate: e.target.value === '' ? '' : e.target.validity.valid ? e.target.value : this.state.licensePlate
            });
        } else if ((e.target.name).replace('-' + this.props.pid, '') === 'client-id') {
            this.setState({
                selectedVehicleClientId: e.target.value === '' ? 0 : Number(e.target.value)
            });
        } else {

            this.setState({
                [(e.target.name).replace('-' + this.props.pid, '')]: e.target.value === '' ? '' : e.target.validity.valid ? e.target.value : this.state[(e.target.name).replace('-' + this.props.pid, '')]
            });
        }
    }

    btnAddNewVehicleClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        this.setState({
            adding: true,
            editingVehicleId: 0
        });
    }

    btnCancelClick = (e) => {
        this.setState(INITIAL_STATE);
        this.getClients();
        const vehiclesList = this.state.vehiclesList.map(vehicle => {
            vehicle.isSelected = false;
            return vehicle;
        });

        this.setState({ vehiclesList, vehiclesShown: vehiclesList.length });
        this.panel.find('.sub-panels').fadeOut();
    }

    btnEditClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        const vehiclesList = this.state.vehiclesList.map(vehicle => {
            if (vehicle.id === id) {
                vehicle.isSelected = true;

                const selectingClientList = this.state.selectingClientList.sort((x, y) => {
                    return x.id === (vehicle.client ? vehicle.client.id : 0) ? -1 : y.id === (vehicle.client ? vehicle.client.id : 0) ? 1 : 0;
                }).map(client => {
                    client.current = vehicle.client ? vehicle.client.id === client.id : false;
                    return client;
                });

                this.setState({
                    editingVehicleId: id,
                    selectedVehicleClientId: vehicle.client ? vehicle.client.id : 0,
                    client_id: vehicle.client ? vehicle.client.id : '',
                    client_name: vehicle.client ? vehicle.client.name : '',
                    licensePlate: vehicle.license_plate,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    type: vehicle.type,
                    year: vehicle.year,
                    color: vehicle.color,
                    observations: vehicle.observations,
                    status: vehicle.status === 1 ? true : false,
                    selectingClientList,
                    iconType: vehicle.icon_type,
                    iconSizeW: vehicle.icon_size_w,
                    iconSizeH: vehicle.icon_size_h
                });

                return vehicle;
            } else {
                return vehicle;
            }
        })

        this.setState({
            editing: true,
            vehiclesList
        });
    }

    btnDeleteClick = async (e) => {
        let id = Number($(e.target).closest('.trow').attr('id'));

        if (window.confirm('¿Está seguro que desea eliminar este vehículo?')) {
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

            await axios.post(serverURL + '/deleteVehicle', { id: id })
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
                                msgText: 'El vehículo ha sido eliminado exitosamente. Actualizando lista, por favor espere',
                                msgClass: classNames({
                                    'panel-message': true,
                                    'hidden': false,
                                    'running': false,
                                    'success': true,
                                    'error': false
                                })
                            });

                            this.getVehicles(null, true);
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

    onSubmit = async (e) => {
        e.preventDefault();

        let vehicleList = $(e.target).closest('.panel').find('.tbl');

        if (this.state.editing && !this.state.status) {
            if (!window.confirm(`
                Si deshabilita este vehículo, también estará\r\n
                deshabilitando los dispositivos gps asociado...\r\n
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
            serverURL + '/saveVehicle',
            {
                id: this.state.editingVehicleId,
                client_id: this.state.selectedVehicleClientId,
                license_plate: this.state.licensePlate,
                brand: this.state.brand,
                model: this.state.model,
                type: this.state.type,
                year: this.state.year,
                color: this.state.color,
                observations: this.state.observations,
                status: this.state.status,
                icon_type: this.state.iconType,
                icon_size_w: this.state.iconSizeW,
                icon_size_h: this.state.iconSizeH
            }
        )
            .then(res => {
                console.log(res.data);

                if (res.data.result === 'CREATED' || res.data.result === 'UPDATED') {
                    let msg = res.data.result === 'CREATED' ?
                        'El vehículo ha sido ingresado exitosamente. Actualizando lista, por favor espere' :
                        'El vehículo ha sido actualizado exitosamente. Actualizando lista, por favor espere';

                    this.setState({
                        msgClass: classNames({
                            'panel-message': true,
                            'hidden': true,
                            'running': false,
                            'success': false,
                            'error': false
                        })
                    });

                    window.mainConsole.getClients();

                    setTimeout(() => {
                        this.setState(INITIAL_STATE);

                        this.getClients();

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

                        vehicleList.find('.trow').removeClass('editing');
                        this.getVehicles(null, true);
                    }, 200);
                }

                if (res.data.result === 'DUPLICATED LICENSE PLATE') {
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
                            msgText: 'Ya existe un vehículo con la matrícula ingresada',
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

    addFromAssociated = (isOpened = false) => {
        this.panel.find('.sub-panels').fadeIn();
        let wrapper = this.panel.find('#tbl-vehicles .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getVehicles(() => {
                this.setState({
                    adding: true,
                    vehiclesListScrollTop: wrapper.scrollTop(0)
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
        let wrapper = this.panel.find('#tbl-vehicles .wrapper');

        if (isOpened) {
            console.log(id);
            this.setState(INITIAL_STATE);
            this.getClients();
            this.getVehicles(() => {
                this.panel.find('.sub-panels').fadeIn();
                const vehiclesList = this.state.vehiclesList.map(vehicle => {
                    if (vehicle.id === id) {
                        vehicle.isSelected = true;

                        this.setState({
                            editingVehicleId: id,
                            client_id: vehicle.client ? vehicle.client.id : 0,
                            client_name: vehicle.client ? vehicle.client.name : '',
                            licensePlate: vehicle.license_plate,
                            brand: vehicle.brand,
                            model: vehicle.model,
                            type: vehicle.type,
                            year: vehicle.year,
                            color: vehicle.color,
                            observations: vehicle.observations,
                            status: vehicle.status === 1 ? true : false
                        });

                        return vehicle;
                    } else {
                        return vehicle;
                    }
                });

                this.setState({
                    vehiclesList,
                    editing: true,
                    vehiclesListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
                });
            });
        } else {
            console.log(id);
            const vehiclesList = this.state.vehiclesList.map(vehicle => {
                if (vehicle.id === id) {
                    vehicle.isSelected = true;

                    this.setState({
                        editingVehicleId: id,
                        client_id: vehicle.client ? vehicle.client.id : 0,
                        client_name: vehicle.client ? vehicle.client.name : '',
                        licensePlate: vehicle.license_plate,
                        brand: vehicle.brand,
                        model: vehicle.model,
                        type: vehicle.type,
                        year: vehicle.year,
                        color: vehicle.color,
                        observations: vehicle.observations,
                        status: vehicle.status === 1 ? true : false
                    });

                    return vehicle;
                } else {
                    return vehicle;
                }
            });

            this.setState({
                vehiclesList,
                editing: true,
                vehiclesListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
            });
        }
    }

    onClearVehicleClient = (e) => {
        this.setState({
            selectedClient: null,
            client_id: 0,
            client_name: ''
        });

        let btn = $(e.target);

        if (!$(e.target).hasClass('btn-clear-vehicle-client')) {
            btn = btn.closest('.btn-clear-vehicle-client');
        }

        btn.addClass('hidden');
    }
    /* #endregion */

    /* #region HANDLELING VEHICLE CLIENT */
    btnShowingAssociatedClient = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        const vehiclesList = this.state.vehiclesList.map(vehicle => {
            if (vehicle.id === id) {
                vehicle.isSelected = true;

                this.setState({
                    associatedClientTitle: vehicle.license_plate,
                    associatedClient: vehicle.client,
                    selectedVehicleClientId: vehicle.client.id
                });

                return vehicle;
            } else {
                vehicle.isSelected = false;
                return vehicle;
            }
        })

        this.setState({
            showingAssociatedClient: true,
            vehiclesList
        });
    }

    btnCloseShowingAssociatedClient = (e) => {
        const vehiclesList = this.state.vehiclesList.map(vehicle => {
            vehicle.isSelected = false;
            return vehicle;
        });

        this.setState({
            vehiclesList,
            associatedClientTitle: '',
            showingAssociatedClient: false,
            associatedClient: [],
            selectedVehicleClientId: 0
        });

        this.panel.find('.sub-panels').fadeOut();
    }

    btnEditShowingAssociatedClient = () => {
        let panelState = window.panelContainer.getState();

        let exist = false;

        for (let i = 0; i < panelState.panels.length; i++) {
            if (panelState.panels[i].id === 'panel-clients') {
                exist = true;
                break;
            }
        }

        if (!exist) {
            window.panelContainer.addPanel({ id: 'panel-clients', type: 'clients', cid: this.state.selectedVehicleClientId });
        } else {
            window.clients.editFromAssociated(this.state.selectedVehicleClientId, true);
            window.panelContainer.panelToFront('panel-clients');
        }
    }
    /* #endregion */

    /* #region HANDLELING VEHICLE DEVICES */
    btnShowingAssociatedDevices = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        const vehiclesList = this.state.vehiclesList.map(vehicle => {
            if (vehicle.id === id) {
                vehicle.isSelected = true;

                this.setState({
                    associatedDevicesTitle: vehicle.license_plate,
                    associatedDevices: vehicle.devices_children
                });

                return vehicle;
            } else {
                vehicle.isSelected = false;
                return vehicle;
            }
        });

        this.setState({
            showingAssociatedDevices: true,
            vehiclesList,
            selectedVehicleDeviceId: 0
        });
    }

    onSelectedVehicleDeviceId = (e) => {
        console.log(e.target);
        let id = Number($(e.target).closest('.trow').attr('id'));

        const associatedDevices = this.state.associatedDevices.map(device => {
            if (device.id === id) {
                device.isSelected = true;
                return device;
            } else {
                device.isSelected = false;
                return device;
            }
        });

        this.setState({
            associatedDevices,
            selectedVehicleDeviceId: id
        });
    }

    btnCloseShowingAssociatedDevices = (e) => {
        const vehiclesList = this.state.vehiclesList.map(vehicle => {
            vehicle.isSelected = false;
            return vehicle;
        });

        this.setState({
            associatedDevicesTitle: '',
            showingAssociatedDevices: false,
            associatedDevices: [],
            selectedVehicleDeviceId: 0,
            vehiclesList
        });

        this.panel.find('.sub-panels').fadeOut();
    }

    btnEditShowingAssociatedDevices = (e) => {
        let panelState = window.panelContainer.getState();

        let exist = false;

        for (let i = 0; i < panelState.panels.length; i++) {
            if (panelState.panels[i].id === 'panel-devices') {
                exist = true;
                break;
            }
        }

        if (!exist) {
            window.panelContainer.addPanel({ id: 'panel-devices', type: 'devices', did: this.state.selectedVehicleDeviceId });
        } else {
            window.devices.editFromAssociated(this.state.selectedVehicleDeviceId, true);
            window.panelContainer.panelToFront('panel-devices');
        }
    }
    /* #endregion */

    /* #region HANDLELING SELECTING VEHICLE CLIENT*/
    onShowingSelectingClient = (e) => {
        if ($(e.target).hasClass('input')) {
            this.panel.find('.sub-panels').fadeIn();

            this.setState({
                showingSelectingClient: true
            });
        }
    }

    onselectedClient = (e) => {
        let row = $(e.target).closest('.trow');
        let wrapper = row.closest('.tbody-wrapper');

        wrapper.find('.trow').removeClass('selected');
        row.addClass('selected');

        this.setState({
            selectedClient: {
                id: Number(row.find('.client-id').text()),
                dni: row.find('.client-dni').text(),
                name: row.find('.client-name').text()
            }
        });
    }

    btnCloseShowingSelectingClient = (e) => {
        this.setState({
            showingSelectingClient: false,
            selectedClient: null
        });

        let btnClearVehicleClient = $(document).find('.btn-clear-vehicle-client');

        if (this.state.client_id > 0) {
            btnClearVehicleClient.removeClass('hidden');
        } else {
            btnClearVehicleClient.addClass('hidden');
        }
    }

    btnAcceptShowingSelectingClient = (e) => {
        this.setState({
            showingSelectingClient: false
        });

        $(document).find('.btn-clear-vehicle-client').removeClass('hidden');
    }

    selectMarkerIcon = (e) => {
        let iconType = 'default';
        let iconSizeW = 20;
        let iconSizeH = 20;

        if ($(e.target).hasClass('marker-icon')) {
            iconType = $(e.target).attr('data-icon-type');
            iconSizeW = $(e.target).attr('data-icon-size-w');
            iconSizeH = $(e.target).attr('data-icon-size-h');

            $(document).find('.marker-icon').removeClass('selected');
            $(e.target).addClass('selected');
        } else {
            iconType = $(e.target).closest('.marker-icon').attr('data-icon-type');
            iconSizeW = $(e.target).closest('.marker-icon').attr('data-icon-size-w');
            iconSizeH = $(e.target).closest('.marker-icon').attr('data-icon-size-h');

            $(document).find('.marker-icon').removeClass('selected');
            $(e.target).closest('.marker-icon').addClass('selected');
        }

        this.setState({
            iconType,
            iconSizeW,
            iconSizeH
        });        
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

        /* #region SUB PANEL VEHICLE CLIENT CLASSES */
        const subPanelVehicleClientClasses = classNames({
            'sub-panel': true,
            'sub-panel-vehicle-client': true,
            'hidden': !this.state.showingAssociatedClient
        });

        /* #endregion */

        /* #region SUB PANEL VEHICLE DEVICES */
        const subPanelVehicleDevicesClasses = classNames({
            'sub-panel': true,
            'sub-panel-vehicle-devices': true,
            'hidden': !this.state.showingAssociatedDevices
        });

        /* #endregion */

        /* #region SUB PANEL SELECTING CLIENT */
        const subPanelSelectingClientClasses = classNames({
            'sub-panel': true,
            'sub-panel-selecting-client': true,
            'hidden': !this.state.showingSelectingClient
        });
        /* #endregion */

        /* #region CLIENT LIST CLASSES */
        const btnAddNewVehicleClasses = classNames({
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

        const btnRefreshVehicleListClasses = classNames({
            'btn-refresh-vehicle-list': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });

        const tblVehiclesClasses = classNames({
            'tbl': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });
        /* #endregion */

        /* #region  MARKER ICON CLASSES */
        const defaultMarkerIconClasses = classNames({
            'marker-icon': true,
            'default': true,
            'selected': this.state.iconType === 'default'
        });
        const sedan1MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'sedan1'
        });
        const sedan2MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'sedan2'
        });
        const sedan3MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'sedan3'
        });
        const pickup1MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'pickup1'
        });
        const wagon1MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'wagon1'
        });
        const wagon2MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'wagon2'
        });
        const wagon3MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'wagon3'
        });
        const bus1MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'bus1'
        });
        const truck1MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'truck1'
        });
        const truck2MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'truck2'
        });
        const truck3MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'truck3'
        });
        const boat1MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'boat1'
        });
        const van1MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'van1'
        });
        const moto1MarkerIconClasses = classNames({
            'marker-icon': true,
            'selected': this.state.iconType === 'moto1'
        });
        /* #endregion */
        return (
            <div className="panel" id={this.props.pid}>
                <div className="panel-wrapper">
                    <div className='sub-panels'>
                        <div className='sub-panels-wrapper'>
                            <div className={subPanelFormClasses}>
                                <div className='sub-panel-title'>
                                    {this.state.adding ? 'Nuevo Vehículo' : this.state.editing ? 'Editar Vehículo' : ''}
                                </div>

                                <form className="" onSubmit={this.onSubmit}>
                                    <div className={inputBoxClasses}>
                                        <input data-type="license-plate" type="text" name={'license-plate-' + this.props.pid} id={'license-plate-' + this.props.pid} onChange={this.handleInputChange} value={this.state.licensePlate} required />
                                        <label htmlFor={'license-plate-' + this.props.pid}>Matrícula</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input data-type="name" type="text" name={'brand-' + this.props.pid} id={'brand-' + this.props.pid} onChange={this.handleInputChange} value={this.state.brand} required />
                                        <label htmlFor={'brand-' + this.props.pid}>Marca</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input data-type="name" type="text" name={'model-' + this.props.pid} id={'model-' + this.props.pid} onChange={this.handleInputChange} value={this.state.model} required />
                                        <label htmlFor={'model-' + this.props.pid}>Modelo</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input data-type="name" type="text" name={'type-' + this.props.pid} id={'type-' + this.props.pid} onChange={this.handleInputChange} value={this.state.type} required />
                                        <label htmlFor={'type-' + this.props.pid}>Tipo</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input maxLength="4" type="text" name={'year-' + this.props.pid} id={'year-' + this.props.pid} pattern="[0-9]*" onInput={this.handleInputChange} onChange={this.handleInputChange} value={this.state.year} required />
                                        <label htmlFor={'year-' + this.props.pid}>Año</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input data-type="name" type="text" name={'color-' + this.props.pid} id={'color-' + this.props.pid} onChange={this.handleInputChange} value={this.state.color} required />
                                        <label htmlFor={'color-' + this.props.pid}>Color</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'observations-' + this.props.pid} id={'observations-' + this.props.pid} onChange={this.handleInputChange} value={this.state.observations} required />
                                        <label htmlFor={'observations-' + this.props.pid}>Observaciones</label>
                                    </div>

                                    <div className={selectBoxClasses}>
                                        <select id={'client-id-' + this.props.pid} name={'client-id-' + this.props.pid} onChange={this.handleInputChange} value={this.state.selectedVehicleClientId} >
                                            <option value=""></option>
                                            {
                                                this.state.selectingClientList.map((client) => {
                                                    const clientClasses = classNames({
                                                        current: client.current
                                                    });
                                                    return <option key={client.id} className={clientClasses} value={client.id}>({client.dni}) {client.name}</option>
                                                })
                                            }
                                        </select>
                                        <label htmlFor={'client-id-' + this.props.pid}>Cliente</label>
                                    </div>

                                    <div className={toggleBoxClasses}>
                                        <input type="checkbox" id={'status-' + this.props.pid} name={'status-' + this.props.pid} onChange={this.handleInputChange} checked={this.state.status} />
                                        <label htmlFor={'status-' + this.props.pid} title="Status">
                                            <div className="lbl-toggle-button">Status</div>
                                            <div className="input-toggle-button"></div>
                                        </label>
                                    </div>

                                    <div className="icons-container">
                                        <div className="row">
                                            <div className={defaultMarkerIconClasses} data-icon-type="default" data-icon-size-w="20" data-icon-size-h="20" title="default" onClick={this.selectMarkerIcon}>
                                                <img className="icon-default" src={require('./../../../marker-icons/default1.svg')} alt="default" />
                                                <img className="icon-default" src={require('./../../../marker-icons/default2.svg')} alt="default" />
                                            </div>

                                            <div className={sedan1MarkerIconClasses} data-icon-type="sedan1" data-icon-size-w="20" data-icon-size-h="38" title="sedan 1" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/sedan1.svg')} alt="sedan" />
                                            </div>
                                            <div className={sedan2MarkerIconClasses} data-icon-type="sedan2" data-icon-size-w="20" data-icon-size-h="44" title="sedan 2" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/sedan2.svg')} alt="sedan" />
                                            </div>
                                            <div className={sedan3MarkerIconClasses} data-icon-type="sedan3" data-icon-size-w="20" data-icon-size-h="45" title="sedan 3" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/sedan3.svg')} alt="sedan" />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className={pickup1MarkerIconClasses} data-icon-type="pickup1" data-icon-size-w="20" data-icon-size-h="49" title="pickup 1" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/pickup1.svg')} alt="pickup" />
                                            </div>
                                            <div className={wagon1MarkerIconClasses} data-icon-type="wagon1" data-icon-size-w="20" data-icon-size-h="46" title="wagon 1" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/wagon1.svg')} alt="wagon" />
                                            </div>
                                            <div className={wagon2MarkerIconClasses} data-icon-type="wagon2" data-icon-size-w="20" data-icon-size-h="41" title="wagon 2" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/wagon2.svg')} alt="wagon" />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className={wagon3MarkerIconClasses} data-icon-type="wagon3" data-icon-size-w="20" data-icon-size-h="41" title="wagon 3" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/wagon3.svg')} alt="wagon" />
                                            </div>
                                            <div className={bus1MarkerIconClasses} data-icon-type="bus1" data-icon-size-w="20" data-icon-size-h="68" title="bus 1" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/bus1.svg')} alt="bus" />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className={truck1MarkerIconClasses} data-icon-type="truck1" data-icon-size-w="20" data-icon-size-h="47" title="truck 1" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/truck1.svg')} alt="truck" />
                                            </div>
                                            <div className={truck2MarkerIconClasses} data-icon-type="truck2" data-icon-size-w="20" data-icon-size-h="73" title="truck 2" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/truck2.svg')} alt="truck" />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className={truck3MarkerIconClasses} data-icon-type="truck3" data-icon-size-w="20" data-icon-size-h="97" title="truck 3" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/truck3.svg')} alt="truck" />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className={boat1MarkerIconClasses} data-icon-type="boat1" data-icon-size-w="20" data-icon-size-h="60" title="boat 1" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/boat1.svg')} alt="boat" />
                                            </div>
                                            <div className={van1MarkerIconClasses} data-icon-type="van1" data-icon-size-w="20" data-icon-size-h="47" title="van 1" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/van1.svg')} alt="van" />
                                            </div>
                                            <div className={moto1MarkerIconClasses} data-icon-type="moto1" data-icon-size-w="20" data-icon-size-h="50" title="moto 1" onClick={this.selectMarkerIcon}>
                                                <img src={require('./../../../marker-icons/moto1.svg')} alt="moto" />
                                            </div>
                                        </div>                                        
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

                            <div className={subPanelVehicleClientClasses}>
                                <div className='sub-panel-title'>
                                    Cliente Asociado ({this.state.associatedClientTitle})
                                </div>

                                <div className="vehicle-client-container">
                                    <div className="row">
                                        <div className="left-col vehicle-client-id hidden">Id</div>
                                        <div className="right-col vehicle-client-id hidden">{this.state.associatedClient ? this.state.associatedClient.id : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col vehicle-client-dni">Cédula/Rif</div>
                                        <div className="right-col vehicle-client-dni">{this.state.associatedClient ? this.state.associatedClient.dni : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col vehicle-client-name">Nombre</div>
                                        <div className="right-col vehicle-client-name">{this.state.associatedClient ? this.state.associatedClient.name : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col vehicle-client-email">Correo Electrónico</div>
                                        <div className="right-col vehicle-client-email">{this.state.associatedClient ? this.state.associatedClient.email : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col vehicle-client-phone">Teléfono</div>
                                        <div className="right-col vehicle-client-phone">{this.state.associatedClient ? this.state.associatedClient.phone : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col vehicle-client-address">Dirección</div>
                                        <div className="right-col vehicle-client-address">{this.state.associatedClient ? this.state.associatedClient.address : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col vehicle-client-observations">Observaciones</div>
                                        <div className="right-col vehicle-client-observations">{this.state.associatedClient ? this.state.associatedClient.observations : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col vehicle-client-status">Estado</div>
                                        <div className="right-col vehicle-client-status">{this.state.associatedClient ? this.state.associatedClient.status === 1 ? 'Activo' : 'Inactivo' : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col vehicle-client-web-access">Acceso Web</div>
                                        <div className="right-col vehicle-client-web-access">{this.state.associatedClient ? this.state.associatedClient.web_access === 1 ? 'Habilitado' : 'Inhabilitado' : ''}</div>
                                    </div>
                                </div>

                                <div className="btn-area">
                                    <div className="mochi-button" onClick={this.btnCloseShowingAssociatedClient}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-close-associated-client" name="btn-close-associated-client">Cancelar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                    <div className="mochi-button" onClick={this.btnEditShowingAssociatedClient}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-edit-associated-client" name="btn-edit-associated-client">Editar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                </div>
                            </div>

                            <div className={subPanelVehicleDevicesClasses}>
                                <div className='sub-panel-title'>
                                    Dispositivos Gps Asociados ({this.state.associatedDevicesTitle}) <span>{this.state.associatedDevices.length}</span>
                                </div>

                                <div className="tbl">
                                    <div className="thead">
                                        <div className="trow">
                                            <div className="tcol device-id hidden">Id</div>
                                            <div className="tcol device-model">Modelo</div>
                                            <div className="tcol device-simcard">Simcard</div>
                                            <div className="tcol device-imei">Imei</div>
                                            <div className="tcol device-speed-limit">Velocidad</div>
                                            <div className="tcol device-installed-at">F. Instalación</div>
                                            <div className="tcol device-status">Estado</div>
                                        </div>
                                    </div>
                                    <div className="tbody">
                                        <div className="tbody-wrapper">
                                            {
                                                this.state.associatedDevices.map(item => {
                                                    /* #region ROW CLASSES */
                                                    const rowDeviceClasses = classNames({
                                                        'trow': true,
                                                        'selected': item.isSelected
                                                    });
                                                    /* #endregion */
                                                    return (
                                                        <div className={rowDeviceClasses} key={item.id} id={item.id} onClick={this.onSelectedVehicleDeviceId}>
                                                            <div className="tcol device-id hidden">{item.id}</div>
                                                            <div className="tcol device-model">{item.device_model.device_brand + ' - ' + item.device_model.device_model}</div>
                                                            <div className="tcol device-simcard">{item.sim_card ? item.sim_card.gsm : '---'}</div>
                                                            <div className="tcol device-imei">{item.imei}</div>
                                                            <div className="tcol device-speed-limit">{item.speed_limit + ' Km/h'}</div>
                                                            <div className="tcol device-installed-at">{item.installed_at}</div>
                                                            <div className="tcol device-status">{item.status === 1 ? 'Activo' : 'Inactivo'}</div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="btn-area">
                                    <div className="mochi-button" onClick={this.btnCloseShowingAssociatedDevices}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-close-associated-devices" name="btn-close-associated-devices">Cancelar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                    <div className={this.state.selectedVehicleDeviceId > 0 ? 'mochi-button' : 'mochi-button disabled'} onClick={this.btnEditShowingAssociatedDevices}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-edit-associated-devices" name="btn-edit-associated-devices">Editar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                </div>
                            </div>

                            <div className={subPanelSelectingClientClasses}>
                                <div className='sub-panel-title'>
                                    Seleccione un cliente ({this.state.licensePlate})
                                </div>

                                <div className="current-client">
                                    <span>Cliente Actual: </span> {this.state.client_name === '' ? '---' : this.state.client_name}
                                </div>

                                <div className="tbl">
                                    <div className="thead">
                                        <div className="trow">
                                            <div className="tcol client-id hidden">Id</div>
                                            <div className="tcol client-dni">Cédula/Rif</div>
                                            <div className="tcol client-name">Nombre</div>
                                        </div>
                                    </div>
                                    <div className="tbody">
                                        <div className="tbody-wrapper">
                                            {
                                                this.state.selectingClientList.map(item => {
                                                    return (
                                                        <div className={this.state.selectedClient === null ? 'trow' : this.state.selectedClient.id === Number(item.id) ? 'trow selected' : 'trow'} key={item.id} onClick={this.onselectedClient}>
                                                            <div className="tcol client-id hidden">{item.id}</div>
                                                            <div className="tcol client-dni">{item.dni}</div>
                                                            <div className="tcol client-name">{item.name}</div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="btn-area">
                                    <div className="mochi-button" onClick={this.btnCloseShowingSelectingClient}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-close-selecting-client" name="btn-close-selecting-client">Cancelar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                    <div className={this.state.selectedClient === null ? 'mochi-button disabled' : this.state.selectedClient.id > 0 ? 'mochi-button' : 'mochi-button disabled'} onClick={this.btnAcceptShowingSelectingClient}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-accept-selecting-client" name="btn-accept-selecting-client">Aceptar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel-content">
                        <div className="panel-title">
                            <div className="border-top"></div>
                            <span >Vehículos <span className="counter">{this.state.vehiclesShown}</span>
                                <div className={this.state.loaderClass} id={'loader' + this.props.pid}>
                                    <FontAwesomeIcon className="fas fa-spin" icon={faSpinner} />
                                </div>
                            </span>
                            <FontAwesomeIcon className={btnAddNewVehicleClasses} icon={faPlus} id="btn-new-vehicle" title="Agregar Nuevo Vehículo" onClick={this.btnAddNewVehicleClick} />
                            <div className="border-bottom"></div>
                        </div>

                        <div className="content">
                            <div className={this.state.msgClass}>
                                {this.state.msgText}
                            </div>

                            <div className="vehicles-list">
                                <div className="search-container">
                                    <div className={inputBoxSearchClasses}>
                                        <input type="search" name={'search-' + this.props.pid} id={'search-' + this.props.pid} onInput={this.inputSearchChange} onChange={this.inputSearchChange} onKeyUp={this.onKeyUpSearch} value={this.state.searchText} required />
                                        <label htmlFor={'search-' + this.props.pid}>Buscar</label>
                                        <FontAwesomeIcon className="search-icon" icon={faSearch} onClick={this.handleInputSearch} />
                                        <FontAwesomeIcon onClick={this.onClearSearch} className={btnClearSearchClasses} icon={faTimes} title="Limpiar Búsqueda" />
                                    </div>
                                    <FontAwesomeIcon title="Recargar lista de vehículos" className={btnRefreshVehicleListClasses} icon={faSyncAlt} onClick={this.onRefreshVehicleList} />
                                </div>

                                <div className="vehicles-list-content">
                                    <div className={tblVehiclesClasses} id="tbl-vehicles">
                                        <div className="thead">
                                            <div className="trow">
                                                <div className="tcol id hidden">Id</div>
                                                <div className="tcol license-plate">Matrícula</div>
                                                <div className="tcol brand">Marca</div>
                                                <div className="tcol model">Modelo</div>
                                                <div className="tcol type">Tipo</div>
                                                <div className="tcol year">Año</div>
                                                <div className="tcol color">Color</div>
                                                <div className="tcol observations hidden">Observaciones</div>
                                                <div className="tcol status hidden">Status</div>
                                                <div className="tcol filler"></div>
                                                <div className="tcol action"></div>
                                            </div>
                                        </div>
                                        <div className="tbody">
                                            <div className="wrapper">
                                                {
                                                    this.state.vehiclesList.map(vehicle => {
                                                        /* #region ROW CLASSES */
                                                        const vehicleRowClasses = classNames({
                                                            'trow': true,
                                                            'active': vehicle.status === 1,
                                                            'inactive': vehicle.status === 0,
                                                            'selected': vehicle.isSelected,
                                                            'has-client': vehicle.client !== null,
                                                            'no-client': vehicle.client === null,
                                                            'has-devices': vehicle.devices_children.length > 0,
                                                            'no-devices': vehicle.devices_children.length === 0
                                                        });

                                                        const btnShowVehicleClientClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-show-vehicle-client': true,
                                                            'no-client': !vehicle.client
                                                        });

                                                        const btnShowVehicleDevicesClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-show-vehicle-devices': true,
                                                            'no-devices': vehicle.devices_children.length === 0
                                                        });

                                                        const btnEditVehicleClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-edit-vehicle': true
                                                        });

                                                        const btnDeleteVehicleClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-delete-vehicle': true
                                                        });
                                                        /* #endregion */

                                                        return (
                                                            <div className={vehicleRowClasses} id={vehicle.id} key={vehicle.id}>
                                                                <div className="tcol id hidden">{vehicle.id}</div>
                                                                <div className="tcol license-plate">{vehicle.license_plate}</div>
                                                                <div className="tcol brand">{vehicle.brand}</div>
                                                                <div className="tcol model">{vehicle.model}</div>
                                                                <div className="tcol type">{vehicle.type}</div>
                                                                <div className="tcol year">{vehicle.year}</div>
                                                                <div className="tcol color">{vehicle.color}</div>
                                                                <div className="tcol observations hidden">`+ vehicle.observations + `</div>
                                                                <div className="tcol status hidden">`+ vehicle.status + `</div>
                                                                <div className="tcol filler"></div>
                                                                <div className="tcol action">
                                                                    <FontAwesomeIcon onClick={this.btnShowingAssociatedClient} title="Ver cliente" className={btnShowVehicleClientClasses} icon={faUserTie} id={'btn-show-vehicle-client-' + this.props.pid} />
                                                                    <FontAwesomeIcon onClick={this.btnShowingAssociatedDevices} title="Ver dispositivos" className={btnShowVehicleDevicesClasses} icon={faSatellite} id={'btn-show-vehicle-client-' + this.props.pid} />
                                                                    <FontAwesomeIcon onClick={this.btnEditClick} title="Editar" className={btnEditVehicleClasses} id={'btn-edit-vehicle-' + this.props.pid} icon={faPencilAlt} />
                                                                    <FontAwesomeIcon onClick={this.btnDeleteClick} title="Eliminar" className={btnDeleteVehicleClasses} id={'btn-delete-vehicle-' + this.props.pid} icon={faTrashAlt} />
                                                                </div>
                                                                <div className="tcol vehicle-client hidden">
                                                                    <div className="tcol client-id">{vehicle.client ? vehicle.client.id : ''}</div>
                                                                    <div className="tcol client-dni">{vehicle.client ? vehicle.client.dni : ''}</div>
                                                                    <div className="tcol client-name">{vehicle.client ? vehicle.client.name : ''}</div>
                                                                    <div className="tcol client-email">{vehicle.client ? vehicle.client.email : ''}</div>
                                                                    <div className="tcol client-phone">{vehicle.client ? vehicle.client.phone : ''}</div>
                                                                    <div className="tcol client-address">{vehicle.client ? vehicle.client.address : ''}</div>
                                                                    <div className="tcol client-observations">{vehicle.client ? vehicle.client.observations : ''}</div>
                                                                    <div className="tcol client-status">{vehicle.client ? vehicle.client.status === 1 ? 'Activo' : 'Inactivo' : ''}</div>
                                                                    <div className="tcol client-web-access">{vehicle.client ? vehicle.client.web_access === 1 ? 'Habilitado' : 'Inhabilitado' : ''}</div>
                                                                </div>
                                                                <div className="tcol vehicle-devices hidden">
                                                                    {
                                                                        vehicle.devices_children.map(device => {
                                                                            return (
                                                                                <div className="tcol vehicle-device" key={device.id}>
                                                                                    <div className="tcol device-id">{device.id}</div>
                                                                                    <div className="tcol device-model">{device.device_model.device_brand + ' - ' + device.device_model.device_model}</div>
                                                                                    <div className="tcol device-gsm">{device.sim_card ? device.sim_card.gsm : ''}</div>
                                                                                    <div className="tcol device-dealer">{device.dealer.name}</div>
                                                                                    <div className="tcol device-imei">{device.imei}</div>
                                                                                    <div className="tcol device-speed-limit">{device.speed_limit}</div>
                                                                                    <div className="tcol device-installed-at">{moment(device.installed_at).format('DD-MM-YYYY')}</div>
                                                                                    <div className="tcol device-observations">{device.observations}</div>
                                                                                    <div className="tcol device-status">{device.status === 1 ? 'Activo' : 'Inactivo'}</div>
                                                                                </div>
                                                                            )
                                                                        })
                                                                    }
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


            </div>
        );
    }
    /* #endregion */
}