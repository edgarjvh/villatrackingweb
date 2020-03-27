import React, { Component } from "react";
import "./geofences.css";
import Config from "./../../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faSpinner,
    faSearch,
    faTimes,
    faSyncAlt,
    faPencilAlt,
    faTrashAlt,
    faCar,
    faAngleDoubleDown,
    faAngleDoubleUp
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import classNames from "classnames";
import $ from "jquery";

const serverURL = Config.prototype.serverURL();
const INITIAL_STATE = {
    // basic actions
    editing: false,
    deleting: false,
    saving: false,
    adding: false,

    // geofences info
    name: "",
    description: "",
    points: "",
    status: 0,
    center: "",
    type: "",
    radio: 0,
    editingGeofenceId: 0,
    editingGeofenceName: '',
    editingGeofenceDescription: '',
    geofencesList: [],
    geofencesShown: 0,
    vehiclesSelectedGeofence: [],
    vehiclesAvailables: [],
    geofenceListScrollTop: 0,

    // searching info
    searchText: "",
    msgText: "",
    msgClass: classNames({
        "panel-message": true,
        hidden: true,
        running: false,
        success: false,
        error: false
    }),

    // loader info
    loaderClass: classNames({
        loader: true,
        hidden: true
    })
};

export default class GeofencesPanel extends Component {
    //#region[rgba(216,247,129,0.05)] MAIN
    panel = null;

    constructor(props) {
        super(props);

        this.state = INITIAL_STATE;
    }

    componentDidMount() {
        window.panelContainer.reorderPanels();
        this.panel = $("#" + this.props.pid);
        this.getGeofences();
    }
    //#endregion

    // #region[rgba(129,217,246,0.05)] GETTER METHODS
    getGeofences = (callback = null, isLoaded = false) => {
        this.setState({
            loaderClass: classNames({
                'loader': true,
                'hidden': false
            })
        });

        setTimeout(async () => {
            await axios.get(serverURL + '/getGeofences')
                .then(async res => {
                    let wrapper = this.panel.find('#tbl-geofences .wrapper');

                    if (res.data.result === 'OK') {
                        await this.setState({
                            geofencesList: res.data.geofences,
                            geofencesShown: res.data.geofences.length,
                            vehiclesAvailables: res.data.vehiclesAvailables.map(vehicle => {
                                vehicle.asigned = false;
                                vehicle.isSelected = false;
                                return vehicle;
                            })                           
                        });
                        
                        this.handleInputSearch();
                    } else {
                        wrapper.html('<div class="no-records">No hay geocercas registradas</div>');
                        this.setState({ geofencesShown: 0 });
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
                });
        }, 200);
    }

    onRefreshGeofenceList = () => {
        this.getGeofences(null, true);
    }
    //#endregion

    //#region[rgba(245,188,169,0.1)] HANDLELING FORM */
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
        let wrapper = this.panel.find('#tbl-geofences .wrapper');

        if (this.state.searchText.substring(0, 1) === '*') {
            if (this.state.searchText === '*s1') {
                wrapper.find('.trow.active').css('display', 'flex');
                wrapper.find('.trow.inactive').css('display', 'none');
                this.setState({ geofencesShown: wrapper.find('.trow.active').length });
            } else if (this.state.searchText === '*s0') {
                wrapper.find('.trow.active').css('display', 'none');
                wrapper.find('.trow.inactive').css('display', 'flex');
                this.setState({ geofencesShown: wrapper.find('.trow.inactive').length });
            } else {
                wrapper.find('.trow').css('display', 'flex');
                this.setState({ geofencesShown: wrapper.find('.trow').length });
            }
        } else if (this.state.searchText === '') {
            wrapper.find('.trow').css('display', 'flex');
            this.panel.find('#tbl-geofences .tbody .wrapper .trow .tcol').css('color', 'black');
            this.panel.find('.btn-edit-geofence').css('color', 'black');
            this.setState({ geofencesShown: wrapper.find('.trow').length });
        }
        else {
            let count = 0;

            for (let i = 0; i < wrapper.find('.trow').length; i++) {
                let row = wrapper.find('.trow').eq(i);                
                let name = row.find('.name');
                let description = row.find('.description');
                let type = row.find('.type');                
                let btnEditGeofence = row.find('.btn-edit-geofence');

                let showRow = false;

                if (name.text().toLowerCase().includes(this.state.searchText) ||
                    description.text().toLowerCase().includes(this.state.searchText) ||
                    type.text().toLowerCase().includes(this.state.searchText)) {

                    showRow = true;
                    count++;
                }
                
                name.css('color', name.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                description.css('color', description.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                type.css('color', type.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');              

                row.css('display', showRow ? 'flex' : 'none');
            }

            this.setState({ geofencesShown: count });
        }
    }

    handleInputChange = (e) => {
        if ((e.target.name).replace('-' + this.props.pid, '') === 'status') {
            this.setState({
                status: e.target.checked
            });

        } else {

            this.setState({
                [(e.target.name).replace('-' + this.props.pid, '')]: e.target.value === '' ? '' : e.target.validity.valid ? e.target.value : this.state[(e.target.name).replace('-' + this.props.pid, '')]
            });
        }
    }

    btnDeleteClick = async (e) => {
        let id = Number($(e.target).closest('.trow').find('.id').text());

        if (window.confirm('¿Está seguro que desea eliminar esta geocerca?')) {
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

            await axios.post(serverURL + '/deleteGeofence', { id: id })
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
                                msgText: 'La geocerca ha sido eliminada exitosamente. Actualizando lista, por favor espere',
                                msgClass: classNames({
                                    'panel-message': true,
                                    'hidden': false,
                                    'running': false,
                                    'success': true,
                                    'error': false
                                })
                            });

                            this.getGeofences(null, true);
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

    btnAddNewGeofenceClick = (e) => {        
        window.geofencesBar.addFromAssociated();
    }

    btnEditClick = (e) => {
        let id = Number($(e.target).closest('.trow').attr('id'));

        const geofencesList = this.state.geofencesList.map(geofence => {
            if (geofence.id === id) {
                geofence.isSelected = true;

                window.geofencesBar.editFromAssociated(geofence);

                return geofence;
            } else {
                return geofence;
            }
        })
    }   

    refreshFromAssociated = () => {
        this.onRefreshGeofenceList();
    }

    btnCancelAsigningClick = (e) => {
       
        const geofencesList = this.state.geofencesList.map(geofence => {
            geofence.isSelected = false;
            return geofence;
        });

        const vehiclesAvailables = this.state.vehiclesAvailables.map(vehicle => {
            vehicle.asigned = false;
            vehicle.isSelected = false;

            return vehicle;
        });

        this.setState({ 
            geofencesList, 
            geofencesShown: geofencesList.length,
            editingGeofenceId: 0,
            editingGeofenceName: '',
            vehiclesAvailables
        });
        this.panel.find('.sub-panels').fadeOut();
    }    

    addFromAssociated = (isOpened = false) => {
        this.panel.find('.sub-panels').fadeIn();
        let wrapper = this.panel.find('#tbl-geofences .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getGeofences(() => {
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
        let wrapper = this.panel.find('#tbl-geofences .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getGeofences(() => {

                const geofencesList = this.state.geofencesList.map(geofence => {
                    if (geofence.id === id) {
                        geofence.isSelected = true;

                        this.setState({
                            dni: geofence.dni,
                            name: geofence.name,
                            email: geofence.email,
                            phone: geofence.phone,
                            address: geofence.address,
                            contact: geofence.contact,
                            website: geofence.website,
                            status: geofence.status === 1 ? true : false
                        });

                        return geofence;
                    } else {
                        return geofence;
                    }
                });

                this.setState({
                    geofencesList,
                    editing: true,
                    geofenceListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
                });
            });
        } else {
            const geofencesList = this.state.geofencesList.map(geofence => {
                if (geofence.id === Number(id)) {
                    geofence.isSelected = true;

                    this.setState({
                        dni: geofence.dni,
                        name: geofence.name,
                        email: geofence.email,
                        phone: geofence.phone,
                        address: geofence.address,
                        contact: geofence.contact,
                        website: geofence.website,
                        status: geofence.status === 1 ? true : false
                    });

                    return geofence;
                } else {
                    return geofence;
                }
            });

            this.setState({
                geofencesList,
                editing: true,
                geofenceListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
            });
        }
    }

    btnShowingAssociatedVehicles = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        this.state.geofencesList.map(geofence => {           
            if (geofence.id === id){
                const vehiclesAvailables = this.state.vehiclesAvailables.map(vehicle => {
                    for (let i = 0; i < geofence.vehicles.length; i++){
                        if (geofence.vehicles[i].id === vehicle.id){
                            vehicle.asigned = true;
                            break;
                        }
                    }

                    return vehicle;
                });

                this.setState({
                    editingGeofenceId: geofence.id,
                    editingGeofenceName: geofence.name,
                    editingGeofenceDescription: geofence.description,
                    vehiclesAvailables
                });

                return false;
            }            
        });
    }

    cboxSelectingVehicle = (e) => {
        let row = $(e.target).closest('.trow');
        let id = Number(row.find('.tcol.id').text());
        
        const vehiclesAvailables = this.state.vehiclesAvailables.map(vehicle => {
            if (vehicle.id === id){
                vehicle.isSelected = e.target.checked;
            }

            return vehicle;
        })

        this.setState({
            vehiclesAvailables
        });
    }

    btnRemoveVehicle = (e) => {
        const vehiclesAvailables = this.state.vehiclesAvailables.map(vehicle => {
            if (vehicle.asigned && vehicle.isSelected){
                vehicle.asigned = false;
                vehicle.isSelected = false;
            }

            return vehicle;
        });

        this.setState({vehiclesAvailables});
    }

    btnAddVehicle = (e) => {
        const vehiclesAvailables = this.state.vehiclesAvailables.map(vehicle => {
            if (!vehicle.asigned && vehicle.isSelected){
                vehicle.asigned = true;
                vehicle.isSelected = false;
            }

            return vehicle;
        });

        this.setState({vehiclesAvailables});
    }   

    btnSaveAsigningClick = async (e) => {
        const vehicles = [];

        this.state.vehiclesAvailables.map(vehicle => {
            if (vehicle.asigned){
                vehicles.push(vehicle.id);
            }
        });

        let data = {
            id: this.state.editingGeofenceId,
            vehicles: vehicles
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
            serverURL + '/syncAsigned', data            
        )
            .then(res => {
                if (res.data.result === 'OK') {
                    let msg = 'Los vehículos asignados han sido actualizados exitosamente. Por favor espere...';

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

                        this.getGeofences(null, true);
                    }, 200);
                }               

                if (res.data.result === 'ERROR') {
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
                            msgText: 'Error al enviar los datos',
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
    /* #endregion */
    
/* #region RENDER METHOD */
render() {
    /* #region SUB PANEL ASIGNING CLASSES */
    const subPanelAsigningClasses = classNames({
        'sub-panel': true,
        'sub-panel-asigning': true,
        'hidden': this.state.editingGeofenceName === ''
    });

    const scrollingUnasignedClasses = classNames({
        'trow': true,
        'scrolling': this.state.vehiclesAvailables.filter(vehicle => {
            return !vehicle.asigned
        }).length > 8
    });

    const scrollingAsignedClasses = classNames({
        'trow': true,
        'scrolling': this.state.vehiclesAvailables.filter(vehicle => {
            return vehicle.asigned
        }).length > 8
    });

    const actionRemoveVehiclesClasses = classNames({
        'asigning-action-btn': true,
        'disabled': this.state.vehiclesAvailables.filter(vehicle => {
            return vehicle.asigned && vehicle.isSelected
        }).length === 0
    });

    const actionAddVehiclesClasses = classNames({
        'asigning-action-btn': true,
        'disabled': this.state.vehiclesAvailables.filter(vehicle => {
            return !vehicle.asigned && vehicle.isSelected
        }).length === 0
    });
 
    const saveMochiButtonClasses = classNames({
        'mochi-button': true,
        'disabled': (!this.state.adding && !this.state.editing) || this.state.saving
    });
    /* #endregion */

    /* #region USER LIST CLASSES */
    const btnAddNewGeofenceClasses = classNames({
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

    const btnRefreshGeofenceListClasses = classNames({
        'btn-refresh-geofence-list': true,
        'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
    });

    const tblGeofencesClasses = classNames({
        'tbl': true,
        'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
    });
    /* #endregion */
    return (
        <div className="panel" id={this.props.pid}>
            <div className="panel-wrapper">

                <div className="sub-panels">
                    <div className="sub-panels-wrapper">
                        <div className={subPanelAsigningClasses}>
                            <div className="sub-panel-title">
                                {this.state.editingGeofenceName}
                            </div>

                            <div className="sub-panel-subtitle">
                                {this.state.editingGeofenceDescription}
                            </div>

                            <div className="asigning-main-container">
                                <div className="unasigned">
                                    <div className="tbl">
                                        <div className="thead">
                                            <div className="ttittle">
                                                Vehículos Disponibles 
                                                <span className="asigning-counter">{
                                                    this.state.vehiclesAvailables.filter(vehicle => {
                                                        return !vehicle.asigned
                                                    }).length}
                                                </span>
                                            </div>
                                            <div className={scrollingUnasignedClasses}>
                                                <div className="tcol select-handler"></div>
                                                <div className="tcol id hidden"></div>
                                                <div className="tcol license_plate">Matrícula</div>
                                                <div className="tcol brand">Marca (Modelo)</div>
                                                <div className="tcol year">Año</div>
                                                <div className="tcol color">Color</div>
                                            </div>
                                        </div>
                                        <div className="tbody">
                                            <div className="tbody-wrapper">
                                                {
                                                    this.state.vehiclesAvailables.map(vehicle => {
                                                        if (!vehicle.asigned){
                                                            const unasignedRowClasses = classNames({
                                                                'trow': true,
                                                                'inactive': vehicle.status === 0,
                                                                'selected-row': vehicle.isSelected                                                                 
                                                            });    
    
                                                            return (
                                                                <div className={unasignedRowClasses} key={vehicle.id}>
                                                                    <div className="tcol select-handler">
                                                                        <input type="checkbox" className="cbox-select-vehicle" onChange={this.cboxSelectingVehicle} />
                                                                    </div>
                                                                    <div className="tcol id hidden">{vehicle.id}</div>
                                                                    <div className="tcol license_plate">{vehicle.license_plate}</div>
                                                                    <div className="tcol brand">
                                                                        <span className="highlighted">{vehicle.brand}</span> ({vehicle.model})                                                                        
                                                                    </div>
                                                                    <div className="tcol year">{vehicle.year}</div>
                                                                    <div className="tcol color">{vehicle.color}</div>     
                                                                </div>
                                                            )
                                                        }                                                        
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="asigning-actions">
                                    <FontAwesomeIcon icon={faAngleDoubleUp} title="Quitar vehículos seleccionados" className={actionRemoveVehiclesClasses} onClick={this.btnRemoveVehicle} />
                                    <FontAwesomeIcon icon={faAngleDoubleDown} title="Asignar vehículos seleccionados" className={actionAddVehiclesClasses} onClick={this.btnAddVehicle} />
                                </div>

                                <div className="asigned">
                                    <div className="tbl">
                                        <div className="thead">
                                            <div className="ttittle">Vehículos Asignados 
                                                <span className="asigning-counter">{
                                                    this.state.vehiclesAvailables.filter(vehicle => {
                                                        return vehicle.asigned
                                                    }).length}
                                                </span>
                                            </div>
                                            <div className={scrollingAsignedClasses}>
                                                <div className="tcol select-handler"></div>
                                                <div className="tcol id hidden"></div>
                                                <div className="tcol license_plate">Matrícula</div>
                                                <div className="tcol brand">Marca (Modelo)</div>
                                                <div className="tcol year">Año</div>
                                                <div className="tcol color">Color</div>
                                            </div>
                                        </div>
                                        <div className="tbody">
                                            <div className="tbody-wrapper">
                                                {
                                                    this.state.vehiclesAvailables.map(vehicle => {
                                                        if (vehicle.asigned){
                                                            const asignedRowClasses = classNames({
                                                                'trow': true,
                                                                'inactive': vehicle.status === 0,
                                                                'selected-row': vehicle.isSelected                                                                 
                                                            });    
    
                                                            return (
                                                                <div className={asignedRowClasses} key={vehicle.id}>
                                                                    <div className="tcol select-handler">
                                                                        <input type="checkbox" className="cbox-select-vehicle" onChange={this.cboxSelectingVehicle} />
                                                                    </div>
                                                                    <div className="tcol id hidden">{vehicle.id}</div>
                                                                    <div className="tcol license_plate">{vehicle.license_plate}</div>
                                                                    <div className="tcol brand">
                                                                        <span className="highlighted">{vehicle.brand}</span> ({vehicle.model})                                                                        
                                                                    </div>
                                                                    <div className="tcol year">{vehicle.year}</div>
                                                                    <div className="tcol color">{vehicle.color}</div>    
                                                                </div>
                                                            )
                                                        }                                                        
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="btn-area">                                    
                                    <div className="mochi-button" onClick={this.btnCancelAsigningClick}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-cancel" name="btn-cancel">Cancelar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                    <div className="mochi-button" onClick={this.btnSaveAsigningClick}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="submit" id="submit" name="submit">Guardar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>

                <div className="panel-content">
                    <div className="panel-title">
                        <div className="border-top"></div>
                        <span >Geocercas <span className="counter">{this.state.geofencesShown}</span>
                            <div className={this.state.loaderClass} id={'loader' + this.props.pid}>
                                <FontAwesomeIcon className="fas fa-spin" icon={faSpinner} />
                            </div>
                        </span>
                        <FontAwesomeIcon className={btnAddNewGeofenceClasses} icon={faPlus} id="btn-new-geofence" title="Agregar Nueva Geocerca" onClick={this.btnAddNewGeofenceClick} />
                        <div className="border-bottom"></div>
                    </div>

                    <div className="content">
                        <div className={this.state.msgClass}>
                            {this.state.msgText}
                        </div>

                        <div className="geofences-list">
                            <div className="search-container">
                                <div className={inputBoxSearchClasses}>
                                    <input type="search" name={'search-' + this.props.pid} id={'search-' + this.props.pid} onInput={this.inputSearchChange} onChange={this.inputSearchChange} onKeyUp={this.onKeyUpSearch} value={this.state.searchText} required />
                                    <label htmlFor={'search-' + this.props.pid}>Buscar</label>
                                    <FontAwesomeIcon className="search-icon" icon={faSearch} onClick={this.handleInputSearch} />
                                    <FontAwesomeIcon onClick={this.onClearSearch} className={btnClearSearchClasses} icon={faTimes} title="Limpiar Búsqueda" />
                                </div>
                                <FontAwesomeIcon title="Recargar lista de geocercas" className={btnRefreshGeofenceListClasses} icon={faSyncAlt} onClick={this.onRefreshGeofenceList} />
                            </div>

                            <div className="geofences-list-content">
                                <div className={tblGeofencesClasses} id="tbl-geofences">
                                    <div className="thead">
                                        <div className="trow">
                                            <div className="tcol id hidden">Id</div>                                            
                                            <div className="tcol name">Nombre</div>
                                            <div className="tcol type ">Tipo</div>
                                            <div className="tcol description ">Descripción</div>
                                            <div className="tcol points hidden">Coordenadas</div>
                                            <div className="tcol radio hidden">Radio</div>                                            
                                            <div className="tcol status hidden">Status</div>
                                            <div className="tcol action"></div>
                                        </div>
                                    </div>
                                    <div className="tbody">
                                        <div className="wrapper">
                                            {
                                                this.state.geofencesList.map(geofence => {
                                                    /* #region ROW CLASSES */
                                                    const geofenceRowClasses = classNames({
                                                        'trow': true,
                                                        'active': geofence.status === 1,
                                                        'inactive': geofence.status === 0,
                                                        'selected': geofence.isSelected
                                                    });

                                                    const btnShowingAssociatedVehiclesClasses = classNames({
                                                        'btn-action': true,
                                                        'btn-showing-associated-vehicles': true
                                                    });

                                                    const btnEditGeofenceClasses = classNames({
                                                        'btn-action': true,
                                                        'btn-edit-geofence': true
                                                    });

                                                    const btnDeleteGeofenceClasses = classNames({
                                                        'btn-action': true,
                                                        'btn-delete-geofence': true
                                                    });
                                                    /* #endregion */
                                                    return (
                                                        <div className={geofenceRowClasses} id={geofence.id} key={geofence.id}>
                                                            <div className="tcol id hidden">{geofence.id}</div>                                                            
                                                            <div className="tcol name">{geofence.name}</div>
                                                            <div className="tcol type ">{geofence.type === 'polygon' ? 'Poligonal' : 'Circular'}</div>
                                                            <div className="tcol description ">{geofence.description}</div>
                                                            <div className="tcol points hidden">{geofence.points}</div>
                                                            <div className="tcol radio hidden">{geofence.radio}</div>
                                                            <div className="tcol status hidden">{geofence.status}</div>
                                                            <div className="tcol action">
                                                                <FontAwesomeIcon onClick={this.btnShowingAssociatedVehicles} title="Ver vehículos asociados" className={btnShowingAssociatedVehiclesClasses} id={'btn-showing-associated-vehicles-' + this.props.pid} icon={faCar} />
                                                                <FontAwesomeIcon onClick={this.btnEditClick} title="Editar" className={btnEditGeofenceClasses} id={'btn-edit-geofence-' + this.props.pid} icon={faPencilAlt} />
                                                                <FontAwesomeIcon onClick={this.btnDeleteClick} title="Eliminar" className={btnDeleteGeofenceClasses} id={'btn-delete-geofence-' + this.props.pid} icon={faTrashAlt} />
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
    )
}
/* #endregion */

}
