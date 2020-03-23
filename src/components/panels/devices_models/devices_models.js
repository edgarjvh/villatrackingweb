import React, { Component } from 'react';
import './devices_models.css';
import Config from '../../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faSearch, faTimes, faSyncAlt, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import classNames from 'classnames';
import $ from 'jquery';

const serverURL = Config.prototype.serverURL();
const INITIAL_STATE = {
    // basic actions
    editing: false,
    deleting: false,
    saving: false,
    adding: false,

    // devices_model info
    brand: '',
    model: '',    
    status: false,
    editingDevicesModelId: 0,
    devicesModelsList: [],
    devicesModelsShown: 0,
    devicesModelListScrollTop: 0,

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

export default class DevicesModelsPanel extends Component {
    /* #region MAIN */
    panel = null;

    constructor(props) {
        super(props)

        this.state = INITIAL_STATE;
    }

    componentDidMount() {
        window.panelContainer.reorderPanels();
        this.panel = $('#' + this.props.pid);
        this.getDevicesModels();
    }
    /* #endregion */

    /* #region GETTER METHODS*/
    getDevicesModels = (callback = null, isLoaded = false) => {
        this.setState({
            loaderClass: classNames({
                'loader': true,
                'hidden': false
            })
        });

        setTimeout(async () => {
            await axios.get(serverURL + '/getDevicesModels')
                .then(res => {
                    let wrapper = this.panel.find('#tbl-devices_models .wrapper');

                    if (res.data.result === 'OK') {
                        this.setState({
                            devicesModelsList: res.data.devices_models,
                            devicesModelsShown: res.data.devices_models.length
                        });
                        this.handleInputSearch();
                    } else {
                        wrapper.html('<div class="no-records">No hay modelos de dispositivos registrados</div>');
                        this.setState({ devicesModelsShown: 0 });
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
                        if (this.props.mid > 0) {
                            this.editFromAssociated(this.props.mid);
                        } else if (this.props.mid === 0) {
                            this.addFromAssociated();
                        }
                    }
                });
        }, 200);
    }

    onRefreshDevicesModelList = () => {
        this.getDevicesModels(null, true);
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
        let wrapper = this.panel.find('#tbl-devices-models .wrapper');

        if (this.state.searchText.substring(0, 1) === '*') {
            if (this.state.searchText === '*s1') {
                wrapper.find('.trow.active').css('display', 'flex');
                wrapper.find('.trow.inactive').css('display', 'none');
                this.setState({ devicesModelsShown: wrapper.find('.trow.active').length });
            } else if (this.state.searchText === '*s0') {
                wrapper.find('.trow.active').css('display', 'none');
                wrapper.find('.trow.inactive').css('display', 'flex');
                this.setState({ devicesModelsShown: wrapper.find('.trow.inactive').length });
            } else {
                wrapper.find('.trow').css('display', 'flex');
                this.setState({ devicesModelsShown: wrapper.find('.trow').length });
            }
        } else if (this.state.searchText === '') {
            wrapper.find('.trow').css('display', 'flex');
            this.panel.find('#tbl-devices-models .tbody .wrapper .trow .tcol').css('color', 'black');
            this.panel.find('.btn-edit-devices_model').css('color', 'black');
            this.setState({ devicesModelsShown: wrapper.find('.trow').length });
        }
        else {
            let count = 0;

            for (let i = 0; i < wrapper.find('.trow').length; i++) {
                let row = wrapper.find('.trow').eq(i);
                let brand = row.find('.brand');
                let model = row.find('.model');                

                let showRow = false;

                if (brand.text().toLowerCase().includes(this.state.searchText) ||
                    model.text().toLowerCase().includes(this.state.searchText)) {
                    showRow = true;                    
                }

                brand.css('color', brand.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                model.css('color', model.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');             

                row.css('display', showRow ? 'flex' : 'none');
                count = showRow ? count++ : count;
            }

            this.setState({ devicesModelsShown: count });
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

    onSubmit = async (e) => {
        e.preventDefault();

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
            serverURL + '/saveDeviceModel',
            {
                id: this.state.editingDevicesModelId,
                brand: this.state.brand,
                model: this.state.model,
                status: this.state.status
            }
        )
            .then(res => {
                if (res.data.result === 'CREATED' || res.data.result === 'UPDATED') {
                    let msg = res.data.result === 'CREATED' ?
                        'El modelo de dispositivo ha sido ingresado exitosamente. Actualizando lista, por favor espere' :
                        'El modelo de dispositivo ha sido actualizado exitosamente. Actualizando lista, por favor espere';

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

                        this.getDevicesModels(null, true);
                    }, 200);
                }

                if (res.data.result === 'DUPLICATED DEVICE MODEL') {
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
                            msgText: 'Ya existe un registro con el fabricante y el modelo ingresado',
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

    btnAddNewDevicesModelClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();

        this.setState({
            adding: true,
            editingDevicesModelId: 0
        });        
    }

    btnCancelClick = (e) => {
        this.setState(INITIAL_STATE);
        const devicesModelsList = this.state.devicesModelsList.map(device_model => {
            device_model.isSelected = false;
            return device_model;
        });

        this.setState({ devicesModelsList, devicesModelsShown: devicesModelsList.length });
        this.panel.find('.sub-panels').fadeOut();
    }

    btnEditClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        const devicesModelsList = this.state.devicesModelsList.map(device_model => {
            if (device_model.id === id) {
                device_model.isSelected = true;

                this.setState({
                    editingDevicesModelId: id,
                    brand: device_model.device_brand,
                    model: device_model.device_model,                    
                    status: device_model.status === 1 ? true : false
                });

                return device_model;
            } else {
                return device_model;
            }
        })

        this.setState({
            devicesModelsList,
            editing: true
        });
    }

    btnDeleteClick = async (e) => {
        let id = Number($(e.target).closest('.trow').find('.id').text());

        if (window.confirm('¿Está seguro que desea eliminar este modelo de dispositivo?')) {
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

            await axios.post(serverURL + '/deleteDeviceModel', { id: id })
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
                                msgText: 'El modelo de dispositivo ha sido eliminado exitosamente. Actualizando lista, por favor espere',
                                msgClass: classNames({
                                    'panel-message': true,
                                    'hidden': false,
                                    'running': false,
                                    'success': true,
                                    'error': false
                                })
                            });

                            this.getDevicesModels(null, true);
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

    addFromAssociated = (isOpened = false) => {
        this.panel.find('.sub-panels').fadeIn();
        let wrapper = this.panel.find('#tbl-devices_models .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getDevicesModels(() => {
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
        let wrapper = this.panel.find('#tbl-devices_models .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getDevicesModels(() => {

                const devicesModelsList = this.state.devicesModelsList.map(device_model => {
                    if (device_model.id === id) {
                        device_model.isSelected = true;

                        this.setState({
                            brand: device_model.device_brand,
                            model: device_model.device_model,                            
                            status: device_model.status === 1 ? true : false
                        });

                        return device_model;
                    } else {
                        return device_model;
                    }
                });

                this.setState({
                    devicesModelsList,
                    editing: true,
                    devicesModelListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
                });
            });
        } else {
            const devicesModelsList = this.state.devicesModelsList.map(device_model => {
                if (device_model.id === Number(id)) {
                    device_model.isSelected = true;

                    this.setState({
                        brand: device_model.device_brand,
                        model: device_model.device_model,                            
                        status: device_model.status === 1 ? true : false
                    });

                    return device_model;
                } else {
                    return device_model;
                }
            });

            this.setState({
                devicesModelsList,
                editing: true,
                devicesModelListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
            });
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

        /* #region USER LIST CLASSES */
        const btnAddNewDeviceModelClasses = classNames({
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

        const btnRefreshDevicesModelListClasses = classNames({
            'btn-refresh-device-model-list': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });

        const tblDevicesModelsClasses = classNames({
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
                                <div className="sub-panel-title">
                                    {this.state.adding ? 'Nuevo Modelo de Dispositivo' : this.state.editing ? 'Editar Modelo de Dispositivo' : ''}
                                </div>

                                <form className="" onSubmit={this.onSubmit}>

                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'brand-' + this.props.pid} id={'brand-' + this.props.pid} onInput={this.handleInputChange} onChange={this.handleInputChange} value={this.state.brand} required />
                                        <label htmlFor={'brand-' + this.props.pid}>Fabricante</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'model-' + this.props.pid} id={'model-' + this.props.pid} onChange={this.handleInputChange} value={this.state.model} required />
                                        <label htmlFor={'model-' + this.props.pid}>Modelo</label>
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
                        </div>
                    </div>

                    <div className="panel-content">
                        <div className="panel-title">
                            <div className="border-top"></div>
                            <span >Modelos de Dispositivos <span className="counter">{this.state.devicesModelsShown}</span>
                                <div className={this.state.loaderClass} id={'loader' + this.props.pid}>
                                    <FontAwesomeIcon className="fas fa-spin" icon={faSpinner} />
                                </div>
                            </span>
                            <FontAwesomeIcon className={btnAddNewDeviceModelClasses} icon={faPlus} id="btn-new-device-model" title="Agregar Nuevo Modelo de Dispositivo" onClick={this.btnAddNewDevicesModelClick} />
                            <div className="border-bottom"></div>
                        </div>

                        <div className="content">
                            <div className={this.state.msgClass}>
                                {this.state.msgText}
                            </div>

                            <div className="devices-models-list">
                                <div className="search-container">
                                    <div className={inputBoxSearchClasses}>
                                        <input type="search" name={'search-' + this.props.pid} id={'search-' + this.props.pid} onInput={this.inputSearchChange} onChange={this.inputSearchChange} onKeyUp={this.onKeyUpSearch} value={this.state.searchText} required />
                                        <label htmlFor={'search-' + this.props.pid}>Buscar</label>
                                        <FontAwesomeIcon className="search-icon" icon={faSearch} onClick={this.handleInputSearch} />
                                        <FontAwesomeIcon onClick={this.onClearSearch} className={btnClearSearchClasses} icon={faTimes} title="Limpiar Búsqueda" />
                                    </div>
                                    <FontAwesomeIcon title="Recargar lista de modelos de dispositivos" className={btnRefreshDevicesModelListClasses} icon={faSyncAlt} onClick={this.onRefreshDevicesModelList} />
                                </div>

                                <div className="devices-models-list-content">
                                    <div className={tblDevicesModelsClasses} id="tbl-devices-models">
                                        <div className="thead">
                                            <div className="trow">
                                                <div className="tcol id hidden">Id</div>
                                                <div className="tcol brand">Fabricante</div>
                                                <div className="tcol model">Modelo</div>                                                
                                                <div className="tcol status hidden">Status</div>
                                                <div className="tcol action"></div>
                                            </div>
                                        </div>
                                        <div className="tbody">
                                            <div className="wrapper">
                                                {
                                                    this.state.devicesModelsList.map(device_model => {
                                                        /* #region ROW CLASSES */
                                                        const deviceModelRowClasses = classNames({
                                                            'trow': true,
                                                            'active': device_model.status === 1,
                                                            'inactive': device_model.status === 0,
                                                            'selected': device_model.isSelected
                                                        });

                                                        const btnEditDeviceModelClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-edit-device-model': true
                                                        });

                                                        const btnDeleteDeviceModelClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-delete-device-model': true
                                                        });
                                                        /* #endregion */
                                                        return (
                                                            <div className={deviceModelRowClasses} id={device_model.id} key={device_model.id}>
                                                                <div className="tcol id hidden">{device_model.id}</div>
                                                                <div className="tcol brand">{device_model.device_brand}</div>
                                                                <div className="tcol model">{device_model.device_model}</div>
                                                                <div className="tcol filler"></div>
                                                                <div className="tcol status hidden">{device_model.status}</div>
                                                                <div className="tcol action">
                                                                    <FontAwesomeIcon onClick={this.btnEditClick} title="Editar" className={btnEditDeviceModelClasses} id={'btn-edit-device_model-' + this.props.pid} icon={faPencilAlt} />
                                                                    <FontAwesomeIcon onClick={this.btnDeleteClick} title="Eliminar" className={btnDeleteDeviceModelClasses} id={'btn-delete-device_model-' + this.props.pid} icon={faTrashAlt} />
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