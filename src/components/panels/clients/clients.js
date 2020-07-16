import React, { Component } from 'react';
import './clients.css';
import Config from './../../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSpinner, faSearch, faTimes, faSyncAlt, faCar, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import classNames from 'classnames'
import $ from 'jquery';

const serverURL = Config.prototype.serverURL();

const INITIAL_STATE = {
    // basic actions
    editing: false,
    deleting: false,
    saving: false,
    adding: false,
    clientListScrollTop: 0,

    // client vehicles info
    showingVehicles: false,
    showingVehiclesList: [],
    showingVehiclesDni: '',
    clientVehicleIdSelected: 0,

    // client info
    dni: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    observations: '',
    webAccess: false,
    status: false,
    editingClientId: 0,
    clientsList: [],
    clientsShown: 0,

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

    // loader info
    loaderClass: classNames({
        'loader': true,
        'hidden': true
    })
}

export default class ClientsPanel extends Component {
    /* #region MAIN */
    panel = null;

    constructor(props) {
        super(props);

        this.state = INITIAL_STATE;

        $(document).ready(() => {
            $('#tbl-clients .wrapper').scroll((e) => {
                this.setState({
                    clientListScrollTop: e.target.scrollTop
                });
            });
        });
    }

    componentDidMount() {
        window.panelContainer.reorderPanels();
        this.panel = $('#' + this.props.pid);
        this.getClients();
    }
    /* #endregion */

    /* #region GETTERS METHODS */
    getClients = async (callback = null, isLoaded = false) => {
        this.setState({
            loaderClass: classNames({
                'loader': true,
                'hidden': false
            })
        });

        setTimeout(async () => {
            await axios.get(serverURL + '/getClientsWithVehicles')
                .then(res => {
                    let wrapper = this.panel.find('#tbl-clients .wrapper');

                    if (res.data.result === 'OK') {
                        this.setState({
                            clientsList: res.data.clients,
                            clientsShown: res.data.clients.length
                        });
                        this.handleInputSearch();
                    } else {
                        wrapper.html('<div class="no-records">No hay clientes registrados</div>');
                        this.setState({ clientsShown: 0 });
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
                        if (this.props.cid > 0) {
                            this.editFromAssociated(this.props.cid);
                        } else if (this.props.cid === 0) {
                            this.addFromAssociated();
                        }
                    }
                });
        }, 200);
    }

    onRefreshClientsList = () => {
        this.getClients(null, true);
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
        let wrapper = this.panel.find('#tbl-clients .wrapper');

        if (this.state.searchText.substring(0, 1) === '*') {
            if (this.state.searchText === '*v1') {
                wrapper.find('.trow.has-vehicles').css('display', 'flex');
                wrapper.find('.trow.no-vehicles').css('display', 'none');
                this.setState({ clientsShown: wrapper.find('.trow.has-vehicles').length });
            } else if (this.state.searchText === '*v0') {
                wrapper.find('.trow.has-vehicles').css('display', 'none');
                wrapper.find('.trow.no-vehicles').css('display', 'flex');
                this.setState({ clientsShown: wrapper.find('.trow.no-vehicles').length });
            } else if (this.state.searchText === '*s1') {
                wrapper.find('.trow.active').css('display', 'flex');
                wrapper.find('.trow.inactive').css('display', 'none');
                this.setState({ clientsShown: wrapper.find('.trow.active').length });
            } else if (this.state.searchText === '*s0') {
                wrapper.find('.trow.active').css('display', 'none');
                wrapper.find('.trow.inactive').css('display', 'flex');
                this.setState({ clientsShown: wrapper.find('.trow.inactive').length });
            } else {
                wrapper.find('.trow').css('display', 'flex');
                this.setState({ clientsShown: wrapper.find('.trow').length });
            }

        } else if (this.state.searchText === '') {
            wrapper.find('.trow').css('display', 'flex');
            this.panel.find('#tbl-clients .tcol').css('color', 'black');
            this.panel.find('.btn-edit-client').css('color', 'black');
            this.panel.find('.btn-show-vehicles').css('color', 'black');
            this.setState({ clientsShown: wrapper.find('.trow').length });

        } else {
            let count = 0;

            for (let i = 0; i < wrapper.find('.trow').length; i++) {
                let row = wrapper.find('.trow').eq(i);
                let dni = row.find('.dni');
                let name = row.find('.name');
                let email = row.find('.email');
                let phone = row.find('.phone');
                let address = row.find('.address');
                let observations = row.find('.observations');
                let vehicleLicensePlate = row.find('.vehicle-license-plate');
                let vehicleBrand = row.find('.vehicle-brand');
                let vehicleModel = row.find('.vehicle-model');
                let vehicleType = row.find('.vehicle-type');
                let vehicleYear = row.find('.vehicle-year');
                let vehicleColor = row.find('.vehicle-color');
                let btnEditClient = row.find('.btn-edit-client');
                let btnShowVehicles = row.find('.btn-show-vehicles');

                let showRow = false;

                if (
                    dni.text().toLowerCase().includes(this.state.searchText) ||
                    name.text().toLowerCase().includes(this.state.searchText) ||
                    email.text().toLowerCase().includes(this.state.searchText) ||
                    phone.text().toLowerCase().includes(this.state.searchText) ||
                    address.text().toLowerCase().includes(this.state.searchText) ||
                    observations.text().toLowerCase().includes(this.state.searchText) ||
                    vehicleLicensePlate.text().toLowerCase().includes(this.state.searchText) ||
                    vehicleBrand.text().toLowerCase().includes(this.state.searchText) ||
                    vehicleModel.text().toLowerCase().includes(this.state.searchText) ||
                    vehicleType.text().toLowerCase().includes(this.state.searchText) ||
                    vehicleYear.text().toLowerCase().includes(this.state.searchText) ||
                    vehicleColor.text().toLowerCase().includes(this.state.searchText)
                ) {
                    showRow = true;
                    count++;
                }

                dni.css('color', dni.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                name.css('color', name.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                email.css('color', email.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                phone.css('color', phone.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');

                btnEditClient.css('color',
                    address.text().toLowerCase().includes(this.state.searchText) ||
                        observations.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black'
                );

                btnShowVehicles.css('color',
                    vehicleLicensePlate.text().toLowerCase().includes(this.state.searchText) ||
                        vehicleBrand.text().toLowerCase().includes(this.state.searchText) ||
                        vehicleModel.text().toLowerCase().includes(this.state.searchText) ||
                        vehicleType.text().toLowerCase().includes(this.state.searchText) ||
                        vehicleYear.text().toLowerCase().includes(this.state.searchText) ||
                        vehicleColor.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black'
                );

                row.css('display', showRow ? 'flex' : 'none');
            }

            this.setState({ clientsShown: count });
        }
    }

    handleInputChange = (e) => {
        if ((e.target.name).replace('-' + this.props.pid, '') === 'status') {
            this.setState({
                status: e.target.checked
            });

        } else if ((e.target.name).replace('-' + this.props.pid, '') === 'web-access') {
            this.setState({
                webAccess: e.target.checked
            });

        } else {

            this.setState({
                [(e.target.name).replace('-' + this.props.pid, '')]: e.target.value === '' ? '' : e.target.validity.valid ? e.target.value : this.state[(e.target.name).replace('-' + this.props.pid, '')]
            });
        }
    }

    btnAddNewClientClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();

        this.setState({
            adding: true,
            editingClientId: 0
        });
    }

    btnCancelClick = (e) => {
        this.setState(INITIAL_STATE);

        const clientsList = this.state.clientsList.map(client => {
            client.isSelected = false;
            return client;
        });

        this.setState({ clientsList, clientsShown: clientsList.length });
        this.panel.find('.sub-panels').fadeOut();
    }

    btnDeleteClick = async (e) => {
        let row = $(e.target).closest('.trow');
        let id = row.find('.id').text();

        if (window.confirm(`
            Si elimina este cliente perderá los reportes relacionados\n\r 
            y sus vehículos quedarán sin asignar.\n\r
            ¿Desea continuar?
        `)) {
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

            await axios.post(serverURL + '/deleteClient', { id: id })
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
                                msgText: 'El cliente ha sido eliminado exitosamente. Actualizando lista, por favor espere',
                                msgClass: classNames({
                                    'panel-message': true,
                                    'hidden': false,
                                    'running': false,
                                    'success': true,
                                    'error': false
                                })
                            });

                            this.getClients(null, true);
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

        // let clientList = $(e.target).closest('.panel').find('.tbl');

        if (this.state.editing && !this.state.status) {
            if (!window.confirm(`
                Si deshabilita este cliente, también estará\r\n
                deshabilitando los vehículos asociados...\r\n
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
            serverURL + '/saveClient',
            {
                id: this.state.editingClientId,
                dni: this.state.dni,
                name: this.state.name,
                email: this.state.email,
                phone: this.state.phone,
                address: this.state.address,
                observations: this.state.observations,
                status: this.state.status,
                web_access: this.state.webAccess
            }
        )
            .then(res => {
                if (res.data.result === 'CREATED' || res.data.result === 'UPDATED') {
                    let msg = res.data.result === 'CREATED' ?
                        'El cliente ha sido ingresado exitosamente. Actualizando lista, por favor espere' :
                        'El cliente ha sido actualizado exitosamente. Actualizando lista, por favor espere';

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

                        this.getClients(null, true);
                    }, 200);
                }

                if (res.data.result === 'DUPLICATED DNI') {
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
                            msgText: 'Ya existe un cliente con el número de cédula o rif ingresado',
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

                if (res.data.result === 'DUPLICATED EMAIL') {
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
                            msgText: 'Ya existe un cliente con el correo electrónico ingresado',
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

                if (res.data.result === 'INVALID EMAIL') {
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
                            msgText: 'El correo electrónico ingresado es inválido',
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

    btnEditClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        const clientsList = this.state.clientsList.map(client => {
            if (client.id === id) {
                client.isSelected = true;

                this.setState({
                    editingClientId: id,
                    dni: client.dni,
                    name: client.name,
                    email: client.email,
                    phone: client.phone,
                    address: client.address,
                    observations: client.observations,
                    webAccess: client.web_access === 1 ? true : false,
                    status: client.status === 1 ? true : false
                })

                return client;
            } else {
                return client;
            }
        });

        this.setState({
            clientsList,
            editing: true
        });
    }

    addFromAssociated = (isOpened = false) => {
        this.panel.find('.sub-panels').fadeIn();
        let wrapper = this.panel.find('#tbl-clients .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getClients(() => {
                this.setState({
                    adding: true,
                    clientListScrollTop: wrapper.scrollTop(0)
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
        let wrapper = this.panel.find('#tbl-clients .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getClients(() => {

                const clientsList = this.state.clientsList.map(client => {
                    if (client.id === id) {
                        client.isSelected = true;

                        this.setState({
                            dni: client.dni,
                            name: client.name,
                            email: client.email,
                            phone: client.phone,
                            address: client.address,
                            observations: client.observations,
                            webAccess: client.web_access === 1 ? true : false,
                            status: client.status === 1 ? true : false
                        });

                        return client;
                    } else {
                        return client;
                    }
                });

                this.setState({
                    clientsList,
                    editing: true,
                    clientListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
                });
            });
        } else {
            const clientsList = this.state.clientsList.map(client => {
                if (client.id === Number(id)) {
                    client.isSelected = true;

                    this.setState({
                        dni: client.dni,
                        name: client.name,
                        email: client.email,
                        phone: client.phone,
                        address: client.address,
                        observations: client.observations,
                        webAccess: client.web_access === 1 ? true : false,
                        status: client.status === 1 ? true : false
                    });

                    return client;
                } else {
                    return client;
                }
            });

            this.setState({
                clientsList,
                editing: true,
                clientListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
            });
        }
    }
    /* #endregion */

    /* #region HANDLELING CLIENT VEHICLES */
    btnShowVehiclesClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        this.state.clientsList.filter(client => client.id === id).map(client => {
            this.setState({
                showingVehiclesDni: client.dni,
                showingVehicles: true,
                showingVehiclesList: client.vehicles
            });

            return false;
        });
    }

    onClientVehicleSelected = (e) => {
        let row = $(e.target).closest('.trow');
        let wrapper = row.closest('.tbody-wrapper');

        wrapper.find('.trow').removeClass('selected');

        row.addClass('selected');

        this.setState({
            clientVehicleIdSelected: Number(row.find('.vehicle-id').text())
        });
    }

    btnCloseClientVehiclesClick = (e) => {
        this.setState({
            showingVehicles: false,
            showingVehiclesList: [],
            showingVehiclesDni: '',
            clientVehicleIdSelected: 0,
        });

        this.panel.find('.sub-panels').fadeOut();
    }

    btnClientEditVehicleSelected = (e) => {
        let panelState = window.panelContainer.getState();

        let exist = false;

        for (let i = 0; i < panelState.panels.length; i++) {
            if (panelState.panels[i].id === 'panel-vehicles') {
                exist = true;
                break;
            }
        }

        if (!exist) {
            window.panelContainer.addPanel({ id: 'panel-vehicles', type: 'vehicles', vid: this.state.clientVehicleIdSelected });
        } else {
            window.vehicles.editFromAssociated(this.state.clientVehicleIdSelected, true);
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
            'hidden': !this.state.adding && !this.state.editing
        });

        const inputBoxClasses = classNames({
            'input-box-container': true,
            'disabled': (!this.state.adding && !this.state.editing) || this.state.saving
        });

        const toggleBoxClasses = classNames({
            'input-toggle-container': true,
            'disabled': (!this.state.adding && !this.state.editing) || this.state.saving
        });

        const formMochiButtonClasses = classNames({
            'mochi-button': true,
            'disabled': (!this.state.adding && !this.state.editing) || this.state.saving
        });
        /* #endregion */

        /* #region SUB PANEL VEHICLES CLASSES */
        const subPanelVehiclesClasses = classNames({
            'sub-panel': true,
            'sub-panel-client-vehicles': true,
            'hidden': !this.state.showingVehicles
        });

        const btnEditClientVehicleClasses = classNames({
            'mochi-button': true,
            'disabled': this.state.clientVehicleIdSelected === 0
        });

        /* #endregion */

        /* #region CLIENT LIST CLASSES */
        const btnAddNewClientClasses = classNames({
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

        const btnRefreshClientListClasses = classNames({
            'btn-refresh-client-list': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });

        const tblClientsClasses = classNames({
            'tbl': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });
        /* #endregion */
        return (
            <div className="panel" id={this.props.pid}>
                <div className="panel-wrapper">

                    <div className="sub-panels">
                        <div className="sub-panels-wrapper">
                            <div className={subPanelFormClasses}>  {/* SUB PANEL FORM */}
                                <div className="sub-panel-title">
                                    {this.state.adding ? 'Nuevo Cliente' : this.state.editing ? 'Editar Cliente' : ''}
                                </div>

                                <form onSubmit={this.onSubmit}>
                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'dni-' + this.props.pid} id={'dni-' + this.props.pid} pattern="[0-9]*" onInput={this.handleInputChange} onChange={this.handleInputChange} value={this.state.dni} required />
                                        <label htmlFor={'dni-' + this.props.pid}>Cédula de Identidad</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input data-type="name" type="text" name={'name-' + this.props.pid} id={'name-' + this.props.pid} onChange={this.handleInputChange} value={this.state.name} required />
                                        <label htmlFor={'name-' + this.props.pid}>Nombre</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input data-type="email" type="text" name={'email-' + this.props.pid} id={'email-' + this.props.pid} onChange={this.handleInputChange} value={this.state.email} required />
                                        <label htmlFor={'email-' + this.props.pid}>Correo Electrónico</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'phone-' + this.props.pid} id={'phone-' + this.props.pid} pattern="[0-9]*" onInput={this.handleInputChange} onChange={this.handleInputChange} value={this.state.phone} required />
                                        <label htmlFor={'phone-' + this.props.pid}>Teléfono</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'address-' + this.props.pid} id={'address-' + this.props.pid} onChange={this.handleInputChange} value={this.state.address} required />
                                        <label htmlFor={'address-' + this.props.pid}>Dirección</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'observations-' + this.props.pid} id={'observations-' + this.props.pid} onChange={this.handleInputChange} value={this.state.observations} required />
                                        <label htmlFor={'observations-' + this.props.pid}>Observaciones</label>
                                    </div>

                                    <div className="input-toggle-container-group-row">

                                        <div className={toggleBoxClasses}>
                                            <input type="checkbox" id={'status-' + this.props.pid} name={'status-' + this.props.pid} onChange={this.handleInputChange} checked={this.state.status} />
                                            <label htmlFor={'status-' + this.props.pid} title="Status">
                                                <div className="lbl-toggle-button">Status</div>
                                                <div className="input-toggle-button"></div>
                                            </label>
                                        </div>

                                        <div className={toggleBoxClasses}>
                                            <input type="checkbox" id={'web-access-' + this.props.pid} name={'web-access-' + this.props.pid} onChange={this.handleInputChange} checked={this.state.webAccess} />
                                            <label htmlFor={'web-access-' + this.props.pid} title="Status">
                                                <div className="lbl-toggle-button">Acceso Web</div>
                                                <div className="input-toggle-button"></div>
                                            </label>
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

                            <div className={subPanelVehiclesClasses}> {/* SUB PANEL VEHICLES */}
                                <div className="sub-panel-title">
                                    Vehículos Asociados ({this.state.showingVehiclesDni}) <span>{this.state.showingVehiclesList.length}</span>
                                </div>

                                <div className="tbl">
                                    <div className="thead">
                                        <div className="trow">
                                            <div className="tcol license-plate">Matrícula</div>
                                            <div className="tcol brand">Marca</div>
                                            <div className="tcol model">Modelo</div>
                                            <div className="tcol type">Tipo</div>
                                            <div className="tcol year">Año</div>
                                            <div className="tcol color">Color</div>
                                            <div className="tcol status">Estado</div>
                                        </div>
                                    </div>

                                    <div className="tbody">
                                        <div className="tbody-wrapper">
                                            {
                                                this.state.showingVehiclesList.map((item, index) => {
                                                    /* #region VEHICLE ROW CLASSES */
                                                    const vehicleRowClasses = classNames({
                                                        'trow': true,
                                                        'selected': this.state.clientVehicleIdSelected === item.id
                                                    });
                                                    /* #endregion */

                                                    return (
                                                        <div className={vehicleRowClasses} key={index} onClick={this.onClientVehicleSelected}>
                                                            <div className="tcol vehicle-id hidden">{item.id}</div>
                                                            <div className="tcol license-plate">{item.license_plate}</div>
                                                            <div className="tcol brand">{item.brand}</div>
                                                            <div className="tcol model">{item.model}</div>
                                                            <div className="tcol type">{item.type}</div>
                                                            <div className="tcol year">{item.year}</div>
                                                            <div className="tcol color">{item.color}</div>
                                                            <div className="tcol status">{item.status === 1 ? 'Activo' : 'Inactivo'}</div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="btn-area">
                                    <div className="mochi-button" onClick={this.btnCloseClientVehiclesClick}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-close-client-vehicles" name="btn-close-client-vehicles">Cerrar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>

                                    <div className={btnEditClientVehicleClasses} onClick={this.btnClientEditVehicleSelected}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-edit-client-vehicle" name="btn-edit-client-vehicle">Editar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel-content">
                        <div className="panel-title">
                            <div className="border-top"></div>
                            <span >Clientes <span className="counter">{this.state.clientsShown}</span>
                                <div className={this.state.loaderClass} id={'loader' + this.props.pid}>
                                    <FontAwesomeIcon className="fas fa-spin" icon={faSpinner} />
                                </div>
                            </span>
                            <FontAwesomeIcon className={btnAddNewClientClasses} icon={faPlus} id="btn-new-client" title="Agregar Nuevo Cliente" onClick={this.btnAddNewClientClick} />
                            <div className="border-bottom"></div>
                        </div>

                        <div className="content">
                            <div className={this.state.msgClass}>
                                {this.state.msgText}
                            </div>

                            <div className="clients-list">
                                <div className="search-container">
                                    <div className={inputBoxSearchClasses}>
                                        <input type="search" name={'search-' + this.props.pid} id={'search-' + this.props.pid} onInput={this.inputSearchChange} onChange={this.inputSearchChange} onKeyUp={this.onKeyUpSearch} value={this.state.searchText} required />
                                        <label htmlFor={'search-' + this.props.pid}>Buscar</label>
                                        <FontAwesomeIcon className="search-icon" icon={faSearch} onClick={this.handleInputSearch} />
                                        <FontAwesomeIcon onClick={this.onClearSearch} className={btnClearSearchClasses} icon={faTimes} title="Limpiar Búsqueda" />
                                    </div>

                                    <FontAwesomeIcon title="Recargar lista de clientes" className={btnRefreshClientListClasses} icon={faSyncAlt} onClick={this.onRefreshClientsList} />
                                </div>

                                <div className="clients-list-content">
                                    <div className={tblClientsClasses} id="tbl-clients">
                                        <div className="thead">
                                            <div className="trow">
                                                <div className="tcol id hidden">Id</div>
                                                <div className="tcol dni">Cédula</div>
                                                <div className="tcol name">Nombre</div>
                                                <div className="tcol email ">Email</div>
                                                <div className="tcol phone ">Teléfono</div>
                                                <div className="tcol permission-level hidden">Nivel de Permiso</div>
                                                <div className="tcol status hidden">Status</div>
                                                <div className="tcol action"></div>
                                            </div>
                                        </div>
                                        <div className="tbody">
                                            <div className="wrapper">
                                                {
                                                    this.state.clientsList.map(client => {
                                                        /* #region ROW CLASSES */
                                                        const clientRowClasses = classNames({
                                                            'trow': true,
                                                            'active': client.status === 1,
                                                            'inactive': client.status === 0,
                                                            'has-vehicles': client.vehicles.length > 0,
                                                            'no-vehicles': client.vehicles.length === 0,
                                                            'selected': client.isSelected
                                                        });

                                                        const btnShowVehiclesClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-show-vehicles': true,
                                                            'no-vehicles': client.vehicles.length === 0
                                                        });

                                                        const btnEditClientClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-edit-client': true
                                                        });

                                                        const btnDeleteClientClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-delete-client': true
                                                        });
                                                        /* #endregion */

                                                        return (
                                                            <div key={client.id} className={clientRowClasses} id={client.id}>
                                                                <div className="tcol id hidden">{client.id}</div>
                                                                <div className="tcol dni">{client.dni}</div>
                                                                <div className="tcol name">{client.name}</div>
                                                                <div className="tcol email">{client.email}</div>
                                                                <div className="tcol phone">{client.phone}</div>
                                                                <div className="tcol address hidden">{client.address}</div>
                                                                <div className="tcol permission-level hidden">{client.permission_level}</div>
                                                                <div className="tcol observations hidden">{client.observations}</div>
                                                                <div className="tcol status hidden">{client.status}</div>
                                                                <div className="tcol web-access hidden">{client.web_access}</div>
                                                                <div className="tcol filler"></div>
                                                                <div className="tcol action">
                                                                    <FontAwesomeIcon onClick={this.btnShowVehiclesClick} title="Ver vehículos" className={btnShowVehiclesClasses} icon={faCar} id={'btn-show-vehicles-' + this.props.pid} />
                                                                    <FontAwesomeIcon onClick={this.btnEditClick} title="Editar" className={btnEditClientClasses} id={'btn-edit-client-' + this.props.pid} icon={faPencilAlt} />
                                                                    <FontAwesomeIcon onClick={this.btnDeleteClick} title="Eliminar" className={btnDeleteClientClasses} id={'btn-delete-client-' + this.props.pid} icon={faTrashAlt} />
                                                                </div>
                                                                <div className="tcol client-vehicles hidden">
                                                                    {
                                                                        client.vehicles.map(vehicle => {
                                                                            return (
                                                                                <div className="tcol vehicle" key={vehicle.id}>
                                                                                    <div className="tcol vehicle-id">{vehicle.id}</div>
                                                                                    <div className="tcol vehicle-license-plate">{vehicle.license_plate}</div>
                                                                                    <div className="tcol vehicle-brand">{vehicle.brand}</div>
                                                                                    <div className="tcol vehicle-model">{vehicle.model}</div>
                                                                                    <div className="tcol vehicle-type">{vehicle.type}</div>
                                                                                    <div className="tcol vehicle-year">{vehicle.year}</div>
                                                                                    <div className="tcol vehicle-color">{vehicle.color}</div>
                                                                                    <div className="tcol vehicle-status">{vehicle.status === 1 ? 'Activo' : 'Inactivo'}</div>
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