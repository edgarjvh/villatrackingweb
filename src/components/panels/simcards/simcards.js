import React, { Component } from 'react';
import './simcards.css';
import Config from './../../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faSearch, faTimes, faSatellite, faPencilAlt, faTrashAlt, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import classNames from 'classnames';
import $ from 'jquery';
import moment from 'moment';

const serverURL = Config.prototype.serverURL();
const INITIAL_STATE = {
    // basic actions
    editing: false,
    deleting: false,
    saving: false,
    adding: false,

    // for showing the associated device
    showingAssociatedDevice: false,
    associatedDevice: null,
    associatedDeviceTitle: '',
    selectedSimcardDeviceId: 0,

    // simcard info
    operator: '',
    gsm: '',
    serial: '',
    apn: '',
    observations: '',
    status: false,
    editingSimcardId: 0,
    simcardsList: [],
    simcardsShown: 0,
    simcardListScrollTop: 0,

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

export default class SimcardsPanel extends Component {
    /* #region MAIN */
    panel = null;

    constructor(props) {
        super(props)

        this.state = INITIAL_STATE;
    }

    componentDidMount() {
        window.panelContainer.reorderPanels();
        this.panel = $('#' + this.props.pid);
        this.getSimcards();
    }
    /* #endregion */

    /* #region GETTER METHODS */
    getSimcards = (callback = null, isLoaded = false) => {
        this.setState({
            loaderClass: classNames({
                'loader': true,
                'hidden': false
            })
        });

        setTimeout(async () => {
            await axios.get(serverURL + '/getSimCards')
                .then(res => {
                    let wrapper = this.panel.find('#tbl-simcards .wrapper');

                    if (res.data.result === 'OK') {
                        this.setState({
                            simcardsList: res.data.simcards,
                            simcardsShown: res.data.simcards.length
                        });
                        this.handleInputSearch();
                    } else {
                        wrapper.html('<div class="no-records">No hay simcards asignadas</div>');
                        this.setState({ simcardsShown: 0 });
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
                        if (this.props.sid > 0) {
                            this.editFromAssociated(this.props.sid);
                        } else if (this.props.sid === 0) {
                            this.addFromAssociated();
                        }
                    }
                });
        }, 200);
    }

    onRefreshSimcardList = (e) => {        
        this.getSimcards(null, true);
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
        let wrapper = this.panel.find('#tbl-simcards .wrapper');

        this.panel.find('#tbl-simcards .tcol').css('color', 'black');
        this.panel.find('.btn-edit-simcard').css('color', 'black');
        this.panel.find('.btn-show-device').css('color', 'black');

        if (this.state.searchText.substring(0, 1) === '*') {
            if (this.state.searchText === '*s1') {
                wrapper.find('.trow.active').css('display', 'flex');
                wrapper.find('.trow.inactive').css('display', 'none');
                this.setState({ simcardsShown: wrapper.find('.trow.active').length });
            } else if (this.state.searchText === '*s0') {
                wrapper.find('.trow.active').css('display', 'none');
                wrapper.find('.trow.inactive').css('display', 'flex');
                this.setState({ simcardsShown: wrapper.find('.trow.inactive').length });
            } else if (this.state.searchText === '*d1') {
                wrapper.find('.trow.has-device').css('display', 'flex');
                wrapper.find('.trow.no-device').css('display', 'none');
                this.setState({ simcardsShown: wrapper.find('.trow.has-device').length });
            } else if (this.state.searchText === '*d0') {
                wrapper.find('.trow.has-device').css('display', 'none');
                wrapper.find('.trow.no-device').css('display', 'flex');
                this.setState({ simcardsShown: wrapper.find('.trow.no-device').length });
            } else {
                wrapper.find('.trow').css('display', 'flex');
                this.setState({ simcardsShown: wrapper.find('.trow').length });
            }
        } else if (this.state.searchText === '') {
            wrapper.find('.trow').css('display', 'flex');
            this.setState({ simcardsShown: wrapper.find('.trow').length });
        }
        else {
            let count = 0;

            for (let i = 0; i < wrapper.find('.trow').length; i++) {
                // #region SIMCARD
                let row = wrapper.find('.trow').eq(i);
                let operator = row.find('.operator');
                let gsm = row.find('.gsm');
                let serial = row.find('.serial');
                let apn = row.find('.apn');
                let observations = row.find('.observations');
                let btnEditSimCard = row.find('.btn-edit-simcard');

                // #region DEVICE
                let brand = row.find('.device-brand');
                let model = row.find('.device-model');
                let imei = row.find('.device-imei');
                let speed = row.find('.device-speed-limit');
                let installed = row.find('.device-installed-at');
                let deviceObservations = row.find('.device-observations');
                let btnShowDevice = row.find('.btn-show-device');

                let showRow = false;
                let inSimcard = false;
                let inDevice = false;

                if (
                    operator.text().toLowerCase().includes(this.state.searchText) ||
                    gsm.text().toLowerCase().includes(this.state.searchText) ||
                    serial.text().toLowerCase().includes(this.state.searchText) ||
                    apn.text().toLowerCase().includes(this.state.searchText)
                ) {
                    showRow = true;
                }

                if (
                    observations.text().toLowerCase().includes(this.state.searchText)
                ) {
                    showRow = true;
                    inSimcard = true;
                }

                if (
                    brand.text().toLowerCase().includes(this.state.searchText) ||
                    model.text().toLowerCase().includes(this.state.searchText) ||
                    imei.text().toLowerCase().includes(this.state.searchText) ||
                    speed.text().toLowerCase().includes(this.state.searchText) ||
                    installed.text().toLowerCase().includes(this.state.searchText) ||
                    deviceObservations.text().toLowerCase().includes(this.state.searchText)
                ) {
                    showRow = true;
                    inDevice = true;
                }

                operator.css('color', operator.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                gsm.css('color', gsm.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                serial.css('color', serial.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                apn.css('color', apn.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');

                btnEditSimCard.css('color', inSimcard ? 'red' : 'black');
                btnShowDevice.css('color', inDevice ? 'red' : 'black');

                row.css('display', showRow ? 'flex' : 'none');
                if (showRow) { count++ };
            }

            this.setState({ simcardsShown: count });
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

        let simcardList = $(e.target).closest('.panel').find('.tbl');

        if (this.state.editing && this.state.asigned && !this.state.status) {
            if (!window.confirm(`
                Si deshabilita esta simcard, también estará\r\n
                deshabilitando el dispositivo gps asociado...\r\n
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
            serverURL + '/saveSimCard',
            {
                id: this.state.editingSimcardId,
                operator: this.state.operator,
                gsm: this.state.gsm,
                serial: this.state.serial,
                apn: this.state.apn,
                observations: this.state.observations,
                status: this.state.status
            }
        )
            .then(res => {
                console.log(res.data);

                if (res.data.result === 'CREATED' || res.data.result === 'UPDATED') {
                    let msg = res.data.result === 'CREATED' ?
                        'La simcard ha sido ingresada exitosamente. Actualizando lista, por favor espere' :
                        'La simcard ha sido actualizada exitosamente. Actualizando lista, por favor espere';

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

                        simcardList.find('.trow').removeClass('editing');
                        this.getSimcards();
                    }, 200);
                }

                if (res.data.result === 'DUPLICATED GSM') {
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
                            msgText: 'Ya existe una simcard con el número gsm ingresado',
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

                if (res.data.result === 'DUPLICATED SERIAL') {
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
                            msgText: 'Ya existe una simcard con el serial ingresado',
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

    btnAddNewSimcardClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();

        this.setState({
            adding: true,
            editingSimcardId: 0
        });
    }

    btnCancelClick = (e) => {
        this.setState(INITIAL_STATE);
        const simcardsList = this.state.simcardsList.map(simcard => {
            simcard.isSelected = false;
            return simcard;
        });

        this.setState({ simcardsList, simcardsShown: simcardsList.length });
        this.panel.find('.sub-panels').fadeOut();
    }

    btnEditClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();

        let id = Number($(e.target).closest('.trow').attr('id'));

        const simcardsList = this.state.simcardsList.map(simcard => {
            if (simcard.id === id) {
                simcard.isSelected = true;

                this.setState({
                    editingSimcardId: id,
                    operator: simcard.operator,
                    gsm: simcard.gsm,
                    serial: simcard.serial,
                    apn: simcard.apn,
                    observations: simcard.observations,
                    status: simcard.status === 1 ? true : false
                });

                return simcard;
            } else {
                simcard.isSelected = false;
                return simcard;
            }
        });

        this.setState({
            editing: true,
            simcardsList
        });
    }

    btnDeleteClick = async (e) => {
        let id = Number($(e.target).find('.trow').attr('id'));

        if (window.confirm('¿Está seguro que desea eliminar esta simcard?')) {
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

            await axios.post(serverURL + '/deleteSimCard', { id: id })
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
                                msgText: 'La simcard ha sido eliminada exitosamente. Actualizando lista, por favor espere',
                                msgClass: classNames({
                                    'panel-message': true,
                                    'hidden': false,
                                    'running': false,
                                    'success': true,
                                    'error': false
                                })
                            });

                            this.getSimcards();
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
        let wrapper = this.panel.find('#tbl-simcards .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getSimcards(() => {
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
        let wrapper = this.panel.find('#tbl-simcards .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getDealers(() => {

                const simcardsList = this.state.simcardsList.map(simcard => {
                    if (simcard.id === id) {
                        simcard.isSelected = true;
        
                        this.setState({
                            editingSimcardId: id,
                            operator: simcard.operator,
                            gsm: simcard.gsm,
                            serial: simcard.serial,
                            apn: simcard.apn,
                            observations: simcard.observations,
                            status: simcard.status === 1 ? true : false
                        });
        
                        return simcard;
                    } else {
                        simcard.isSelected = false;
                        return simcard;
                    }
                });

                this.setState({
                    simcardsList,
                    editing: true,
                    simcardListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
                });
            });
        } else {
            const simcardsList = this.state.simcardsList.map(simcard => {
                if (simcard.id === id) {
                    simcard.isSelected = true;
    
                    this.setState({
                        editingSimcardId: id,
                        operator: simcard.operator,
                        gsm: simcard.gsm,
                        serial: simcard.serial,
                        apn: simcard.apn,
                        observations: simcard.observations,
                        status: simcard.status === 1 ? true : false
                    });
    
                    return simcard;
                } else {
                    simcard.isSelected = false;
                    return simcard;
                }
            });

            this.setState({
                simcardsList,
                editing: true,
                simcardListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
            });
        }
    }
    /* #endregion */

    /* #region HANDLELING SIMCARD DEVICE */
    btnShowingAssociatedDevice = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        const simcardsList = this.state.simcardsList.map(simcard => {
            if (simcard.id === id) {
                simcard.isSelected = true;

                this.setState({
                    associatedDeviceTitle: simcard.gsm,
                    associatedDevice: simcard.device,
                    selectedSimcardDeviceId: simcard.device.id
                });

                return simcard;
            } else {
                simcard.isSelected = false;
                return simcard;
            }
        })

        this.setState({
            showingAssociatedDevice: true,
            simcardsList
        });
    }

    btnCloseShowingAssociatedDevice = (e) => {
        const simcardsList = this.state.simcardsList.map(simcard => {
            simcard.isSelected = false;
            return simcard;
        });

        this.setState({
            simcardsList,
            associatedDeviceTitle: '',
            showingAssociatedDevice: false,
            associatedDevice: null,
            selectedSimcardDeviceId: 0
        });

        this.panel.find('.sub-panels').fadeOut();
    }

    btnEditShowingAssociatedDevice = () => {
        let panelState = window.panelContainer.getState();

        let exist = false;

        for (let i = 0; i < panelState.panels.length; i++) {
            if (panelState.panels[i].id === 'panel-devices') {
                exist = true;
                break;
            }
        }

        if (!exist) {
            window.panelContainer.addPanel({ id: 'panel-devices', type: 'devices', did: this.state.selectedSimcardDeviceId });
        } else {
            window.devices.editFromAssociated(this.state.selectedSimcardDeviceId, true);
            window.panelContainer.panelToFront('panel-devices');
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

        /* #region SUB PANEL SIMCARD DEVICE */
        const subPanelSimcardDeviceClasses = classNames({
            'sub-panel': true,
            'sub-panel-simcard-device': true,
            'hidden': !this.state.showingAssociatedDevice
        });
        /* #endregion */

        /* #region USER LIST CLASSES */
        const btnAddNewSimCardClasses = classNames({
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

        const btnRefreshSimcardListClasses = classNames({
            'btn-refresh-simcard-list': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });

        const tblSimCardsClasses = classNames({
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
                                    {this.state.adding ? 'Nueva Simcard' : this.state.editing ? 'Editar Simcard' : ''}
                                </div>

                                <form className="" onSubmit={this.onSubmit}>
                                    <div className={inputBoxClasses}>
                                        <input data-type="name" type="text" name={'operator-' + this.props.pid} id={'operator-' + this.props.pid} onInput={this.handleInputChange} onChange={this.handleInputChange} value={this.state.operator} required />
                                        <label htmlFor={'operator-' + this.props.pid}>Operadora</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'gsm-' + this.props.pid} id={'gsm-' + this.props.pid} pattern="[0-9]*" onChange={this.handleInputChange} value={this.state.gsm} required />
                                        <label htmlFor={'gsm-' + this.props.pid}>Gsm</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'serial-' + this.props.pid} id={'serial-' + this.props.pid} pattern="[0-9]*" onChange={this.handleInputChange} value={this.state.serial} required />
                                        <label htmlFor={'serial-' + this.props.pid}>Serial</label>
                                    </div>

                                    <div className={inputBoxClasses}>
                                        <input data-type="email" type="text" name={'apn-' + this.props.pid} id={'apn-' + this.props.pid} onInput={this.handleInputChange} onChange={this.handleInputChange} value={this.state.apn} required />
                                        <label htmlFor={'apn-' + this.props.pid}>Apn</label>
                                    </div>
                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'observations-' + this.props.pid} id={'observations-' + this.props.pid} onInput={this.handleInputChange} onChange={this.handleInputChange} value={this.state.observations} required />
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

                            <div className={subPanelSimcardDeviceClasses}>
                                <div className='sub-panel-title'>
                                    Cliente Asociado ({this.state.associatedDeviceTitle})
                                </div>

                                <div className="simcard-device-container">
                                    <div className="row">
                                        <div className="left-col simcard-device-id hidden">Id</div>
                                        <div className="right-col simcard-device-id hidden">{this.state.associatedDevice ? this.state.associatedDevice.id : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col simcard-device-imei">Imei</div>
                                        <div className="right-col simcard-device-imei">{this.state.associatedDevice ? this.state.associatedDevice.imei : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col simcard-device-speed-limit">Velocidad</div>
                                        <div className="right-col simcard-device-speed-limit">{this.state.associatedDevice ? this.state.associatedDevice.speed_limit : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col simcard-device-installed-at">F. Instalación</div>
                                        <div className="right-col simcard-device-installed-at">{this.state.associatedDevice ? this.state.associatedDevice.installed_at : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col simcard-device-observations">Observaciones</div>
                                        <div className="right-col simcard-device-observations">{this.state.associatedDevice ? this.state.associatedDevice.observations : ''}</div>
                                    </div>
                                    <div className="row">
                                        <div className="left-col simcard-device-status">Estado</div>
                                        <div className="right-col simcard-device-status">{this.state.associatedDevice ? this.state.associatedDevice.status === 1 ? 'Activo' : 'Inactivo' : ''}</div>
                                    </div>
                                </div>

                                <div className="btn-area">
                                    <div className="mochi-button" onClick={this.btnCloseShowingAssociatedDevice}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-close-associated-device" name="btn-close-associated-device">Cancelar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                    <div className="mochi-button" onClick={this.btnEditShowingAssociatedDevice}>
                                        <div className="mochi-button-decorator mochi-button-decorator-left">(</div>
                                        <button type="button" id="btn-edit-associated-device" name="btn-edit-associated-device">Editar</button>
                                        <div className="mochi-button-decorator mochi-button-decorator-right">)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel-content">
                        <div className="panel-title">
                            <div className="border-top"></div>
                            <span >Simcards <span className="counter">{this.state.simcardsShown}</span>
                                <div className={this.state.loaderClass} id={'loader' + this.props.pid}>
                                    <FontAwesomeIcon className="fas fa-spin" icon={faSpinner} />
                                </div>
                            </span>
                            <FontAwesomeIcon className={btnAddNewSimCardClasses} icon={faPlus} id="btn-new-simcard" title="Agregar Nueva Simcard" onClick={this.btnAddNewSimcardClick} />
                            <div className="border-bottom"></div>
                        </div>

                        <div className="content">
                            <div className={this.state.msgClass}>
                                {this.state.msgText}
                            </div>

                            <div className="simcards-list">
                                <div className="search-container">
                                    <div className={inputBoxSearchClasses}>
                                        <input type="search" name={'search-' + this.props.pid} id={'search-' + this.props.pid} onInput={this.inputSearchChange} onChange={this.inputSearchChange} onKeyUp={this.onKeyUpSearch} value={this.state.searchText} required />
                                        <label htmlFor={'search-' + this.props.pid}>Buscar</label>
                                        <FontAwesomeIcon className="search-icon" icon={faSearch} onClick={this.handleInputSearch} />
                                        <FontAwesomeIcon onClick={this.onClearSearch} className={btnClearSearchClasses} icon={faTimes} title="Limpiar Búsqueda" />
                                    </div>
                                    <FontAwesomeIcon title="Recargar lista de simcards" id="btn-refresh-simcard-list" className={btnRefreshSimcardListClasses} icon={faSyncAlt} onClick={this.onRefreshSimcardList} />
                                </div>

                                <div className="simcards-list-content">
                                    <div className={tblSimCardsClasses} id="tbl-simcards">

                                        <div className="thead">
                                            <div className="trow">
                                                <div className="tcol id hidden">Id</div>
                                                <div className="tcol operator">Operadora</div>
                                                <div className="tcol gsm">Gsm</div>
                                                <div className="tcol serial">Serial</div>
                                                <div className="tcol apn">Apn</div>
                                                <div className="tcol observations hidden">Observaciones</div>
                                                <div className="tcol status hidden">Status</div>
                                                <div className="tcol filler"></div>
                                                <div className="tcol action"></div>
                                            </div>
                                        </div>
                                        <div className="tbody">
                                            <div className="wrapper">
                                                {
                                                    this.state.simcardsList.map(simcard => {
                                                        /* #region ROW CLASSES */
                                                        const simcardRowClasses = classNames({
                                                            'trow': true,
                                                            'active': simcard.status === 1,
                                                            'inactive': simcard.status === 0,
                                                            'selected': simcard.isSelected,
                                                            'has-device': simcard.device !== null,
                                                            'no-device': simcard.device === null
                                                        });

                                                        const btnShowSimcardDeviceClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-show-simcard-device': true,
                                                            'no-device': simcard.device === null
                                                        });

                                                        const btnEditSimcardClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-edit-simcard': true
                                                        });

                                                        const btnDeleteSimcardClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-delete-simcard': true
                                                        });
                                                        /* #endregion */
                                                        return (
                                                            <div className={simcardRowClasses} id={simcard.id} key={simcard.id}>
                                                                <div className="tcol id hidden">{simcard.id}</div>
                                                                <div className="tcol operator">{simcard.operator}</div>
                                                                <div className="tcol gsm">{simcard.gsm}</div>
                                                                <div className="tcol serial">{simcard.serial}</div>
                                                                <div className="tcol apn">{simcard.apn}</div>
                                                                <div className="tcol observations hidden">{simcard.observations}</div>
                                                                <div className="tcol status hidden">{simcard.status}</div>
                                                                <div className="tcol filler"></div>
                                                                <div className="tcol action">
                                                                    <FontAwesomeIcon onClick={this.btnShowingAssociatedDevice} title="Ver dispositivo" className={btnShowSimcardDeviceClasses} id={'btn-edit-simcard-device-' + this.props.pid} icon={faSatellite} />
                                                                    <FontAwesomeIcon onClick={this.btnEditClick} title="Editar" className={btnEditSimcardClasses} id={'btn-edit-simcard-' + this.props.pid} icon={faPencilAlt} />
                                                                    <FontAwesomeIcon onClick={this.btnDeleteClick} title="Eliminar" className={btnDeleteSimcardClasses} id={'btn-delete-simcard-' + this.props.pid} icon={faTrashAlt} />
                                                                </div>
                                                                <div className="tcol device-id hidden">{simcard.device ? simcard.device.id : ''}</div>
                                                                <div className="tcol device-brand hidden">{simcard.device ? simcard.device.device_brand : ''}</div>
                                                                <div className="tcol device-model hidden">{simcard.device ? simcard.device.device_model : ''}</div>
                                                                <div className="tcol device-imei hidden">{simcard.device ? simcard.device.imei : ''}</div>
                                                                <div className="tcol device-speed-limit hidden">{simcard.device ? simcard.device.speed_limit : ''}</div>
                                                                <div className="tcol device-installed-at hidden">{simcard.device ? moment(simcard.device.installed_at).format('DD-MM-YYYY') : ''}</div>
                                                                <div className="tcol device-observations hidden">{simcard.device ? simcard.device.observations : ''}</div>
                                                                <div className="tcol device-status hidden">{simcard.device ? simcard.device.status === 1 ? 'Activo' : 'Inactivo' : ''}</div>
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