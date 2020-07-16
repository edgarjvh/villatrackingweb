import React, { Component } from 'react';
import './dealers.css';
import Config from './../../../config';
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

    // dealer info
    dni: '',
    name: '',
    email: '',
    contact: '',
    phone: '',
    address: '',
    website: '',
    status: false,
    editingDealerId: 0,
    dealersList: [],
    dealersShown: 0,
    dealerListScrollTop: 0,

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

export default class DealersPanel extends Component {
    /* #region MAIN */
    panel = null;

    constructor(props) {
        super(props)

        this.state = INITIAL_STATE;
    }

    componentDidMount() {
        window.panelContainer.reorderPanels();
        this.panel = $('#' + this.props.pid);
        this.getDealers();
    }
    /* #endregion */

    /* #region GETTER METHODS*/
    getDealers = (callback = null, isLoaded = false) => {
        this.setState({
            loaderClass: classNames({
                'loader': true,
                'hidden': false
            })
        });

        setTimeout(async () => {
            await axios.get(serverURL + '/getDealers')
                .then(res => {
                    let wrapper = this.panel.find('#tbl-dealers .wrapper');

                    if (res.data.result === 'OK') {
                        this.setState({
                            dealersList: res.data.dealers,
                            dealersShown: res.data.dealers.length
                        });
                        this.handleInputSearch();
                    } else {
                        wrapper.html('<div class="no-records">No hay dealers registrados</div>');
                        this.setState({ dealersShown: 0 });
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

    onRefreshDealerList = () => {
        this.getDealers(null, true);
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
        let wrapper = this.panel.find('#tbl-dealers .wrapper');

        if (this.state.searchText.substring(0, 1) === '*') {
            if (this.state.searchText === '*s1') {
                wrapper.find('.trow.active').css('display', 'flex');
                wrapper.find('.trow.inactive').css('display', 'none');
                this.setState({ dealersShown: wrapper.find('.trow.active').length });
            } else if (this.state.searchText === '*s0') {
                wrapper.find('.trow.active').css('display', 'none');
                wrapper.find('.trow.inactive').css('display', 'flex');
                this.setState({ dealersShown: wrapper.find('.trow.inactive').length });
            } else {
                wrapper.find('.trow').css('display', 'flex');
                this.setState({ dealersShown: wrapper.find('.trow').length });
            }
        } else if (this.state.searchText === '') {
            wrapper.find('.trow').css('display', 'flex');
            this.panel.find('#tbl-dealers .tbody .wrapper .trow .tcol').css('color', 'black');
            this.panel.find('.btn-edit-dealer').css('color', 'black');
            this.setState({ dealersShown: wrapper.find('.trow').length });
        }
        else {
            let count = 0;

            for (let i = 0; i < wrapper.find('.trow').length; i++) {
                let row = wrapper.find('.trow').eq(i);
                let dni = row.find('.dni');
                let name = row.find('.name');
                let email = row.find('.email');
                let phone = row.find('.phone');
                let contact = row.find('.contact');
                let address = row.find('.address');
                let website = row.find('.website');
                let btnEditDealer = row.find('.btn-edit-dealer');

                let showRow = false;

                if (dni.text().toLowerCase().includes(this.state.searchText) ||
                    name.text().toLowerCase().includes(this.state.searchText) ||
                    email.text().toLowerCase().includes(this.state.searchText) ||
                    phone.text().toLowerCase().includes(this.state.searchText) ||
                    contact.text().toLowerCase().includes(this.state.searchText) ||
                    address.text().toLowerCase().includes(this.state.searchText) ||
                    website.text().toLowerCase().includes(this.state.searchText)) {

                    showRow = true;
                    count++;
                }

                dni.css('color', dni.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                name.css('color', name.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                email.css('color', email.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                phone.css('color', phone.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');

                btnEditDealer.css('color',
                    contact.text().toLowerCase().includes(this.state.searchText) ||
                        address.text().toLowerCase().includes(this.state.searchText) ||
                        website.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black'
                )

                row.css('display', showRow ? 'flex' : 'none');
            }

            this.setState({ dealersShown: count });
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
            serverURL + '/saveDealer',
            {
                id: this.state.editingDealerId,
                dni: this.state.dni,
                name: this.state.name,
                email: this.state.email,
                contact: this.state.contact,
                phone: this.state.phone,
                address: this.state.address,
                website: this.state.website,
                status: this.state.status
            }
        )
            .then(res => {
                if (res.data.result === 'CREATED' || res.data.result === 'UPDATED') {
                    let msg = res.data.result === 'CREATED' ?
                        'El dealer ha sido ingresado exitosamente. Actualizando lista, por favor espere' :
                        'El dealer ha sido actualizado exitosamente. Actualizando lista, por favor espere';

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

                        this.getDealers(null, true);
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
                            msgText: 'Ya existe un dealer con la cédula o rif ingresado',
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
                            msgText: 'Ya existe un dealer con el correo electrónico ingresado',
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

    btnAddNewDealerClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();

        this.setState({
            adding: true,
            editingDealerId: 0
        });        
    }

    btnCancelClick = (e) => {
        this.setState(INITIAL_STATE);
        const dealersList = this.state.dealersList.map(dealer => {
            dealer.isSelected = false;
            return dealer;
        });

        this.setState({ dealersList, dealersShown: dealersList.length });
        this.panel.find('.sub-panels').fadeOut();
    }

    btnEditClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        const dealersList = this.state.dealersList.map(dealer => {
            if (dealer.id === id) {
                dealer.isSelected = true;

                this.setState({
                    editingDealerId: id,
                    dni: dealer.dni,
                    name: dealer.name,
                    email: dealer.email,
                    phone: dealer.phone,
                    contact: dealer.contact,
                    address: dealer.address,
                    website: dealer.website,
                    status: dealer.status === 1 ? true : false
                });

                return dealer;
            } else {
                return dealer;
            }
        })

        this.setState({
            dealersList,
            editing: true
        });
    }

    btnDeleteClick = async (e) => {
        let id = Number($(e.target).closest('.trow').find('.id').text());

        if (window.confirm('¿Está seguro que desea eliminar este dealer?')) {
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

            await axios.post(serverURL + '/deleteDealer', { id: id })
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
                                msgText: 'El dealer ha sido eliminado exitosamente. Actualizando lista, por favor espere',
                                msgClass: classNames({
                                    'panel-message': true,
                                    'hidden': false,
                                    'running': false,
                                    'success': true,
                                    'error': false
                                })
                            });

                            this.getDealers(null, true);
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
        let wrapper = this.panel.find('#tbl-dealers .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getDealers(() => {
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
        let wrapper = this.panel.find('#tbl-dealers .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getDealers(() => {

                const dealersList = this.state.dealersList.map(dealer => {
                    if (dealer.id === id) {
                        dealer.isSelected = true;

                        this.setState({
                            dni: dealer.dni,
                            name: dealer.name,
                            email: dealer.email,
                            phone: dealer.phone,
                            address: dealer.address,
                            contact: dealer.contact,
                            website: dealer.website,
                            status: dealer.status === 1 ? true : false
                        });

                        return dealer;
                    } else {
                        return dealer;
                    }
                });

                this.setState({
                    dealersList,
                    editing: true,
                    dealerListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
                });
            });
        } else {
            const dealersList = this.state.dealersList.map(dealer => {
                if (dealer.id === Number(id)) {
                    dealer.isSelected = true;

                    this.setState({
                        dni: dealer.dni,
                        name: dealer.name,
                        email: dealer.email,
                        phone: dealer.phone,
                        address: dealer.address,
                        contact: dealer.contact,
                        website: dealer.website,
                        status: dealer.status === 1 ? true : false
                    });

                    return dealer;
                } else {
                    return dealer;
                }
            });

            this.setState({
                dealersList,
                editing: true,
                dealerListScrollTop: wrapper.scrollTop(wrapper.find('.trow.selected').offset().top - 200)
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
        const btnAddNewDealerClasses = classNames({
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

        const btnRefreshDealerListClasses = classNames({
            'btn-refresh-dealer-list': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });

        const tblDealersClasses = classNames({
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
                                    {this.state.adding ? 'Nuevo Dealer' : this.state.editing ? 'Editar Dealer' : ''}
                                </div>

                                <form className="" onSubmit={this.onSubmit}>

                                    <div className={inputBoxClasses}>
                                        <input type="text" name={'dni-' + this.props.pid} id={'dni-' + this.props.pid} pattern="[0-9]*" onInput={this.handleInputChange} onChange={this.handleInputChange} value={this.state.dni} required />
                                        <label htmlFor={'dni-' + this.props.pid}>Cédula de Identidad / Rif</label>
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
                                        <input data-type="name" type="text" name={'contact-' + this.props.pid} id={'contact-' + this.props.pid} onChange={this.handleInputChange} value={this.state.contact} required />
                                        <label htmlFor={'contact-' + this.props.pid}>Contacto</label>
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
                                        <input data-type="email" type="text" name={'website-' + this.props.pid} id={'website-' + this.props.pid} onChange={this.handleInputChange} value={this.state.website} required />
                                        <label htmlFor={'website-' + this.props.pid}>Sitio Web</label>
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
                            <span >Dealers <span className="counter">{this.state.dealersShown}</span>
                                <div className={this.state.loaderClass} id={'loader' + this.props.pid}>
                                    <FontAwesomeIcon className="fas fa-spin" icon={faSpinner} />
                                </div>
                            </span>
                            <FontAwesomeIcon className={btnAddNewDealerClasses} icon={faPlus} id="btn-new-dealer" title="Agregar Nuevo Dealer" onClick={this.btnAddNewDealerClick} />
                            <div className="border-bottom"></div>
                        </div>

                        <div className="content">
                            <div className={this.state.msgClass}>
                                {this.state.msgText}
                            </div>

                            <div className="dealers-list">
                                <div className="search-container">
                                    <div className={inputBoxSearchClasses}>
                                        <input type="search" name={'search-' + this.props.pid} id={'search-' + this.props.pid} onInput={this.inputSearchChange} onChange={this.inputSearchChange} onKeyUp={this.onKeyUpSearch} value={this.state.searchText} required />
                                        <label htmlFor={'search-' + this.props.pid}>Buscar</label>
                                        <FontAwesomeIcon className="search-icon" icon={faSearch} onClick={this.handleInputSearch} />
                                        <FontAwesomeIcon onClick={this.onClearSearch} className={btnClearSearchClasses} icon={faTimes} title="Limpiar Búsqueda" />
                                    </div>
                                    <FontAwesomeIcon title="Recargar lista de dealers" className={btnRefreshDealerListClasses} icon={faSyncAlt} onClick={this.onRefreshDealerList} />
                                </div>

                                <div className="dealers-list-content">
                                    <div className={tblDealersClasses} id="tbl-dealers">
                                        <div className="thead">
                                            <div className="trow">
                                                <div className="tcol id hidden">Id</div>
                                                <div className="tcol dni">Cédula / Rif</div>
                                                <div className="tcol name">Nombre</div>
                                                <div className="tcol email ">Email</div>
                                                <div className="tcol phone ">Teléfono</div>
                                                <div className="tcol contact hidden">Contacto</div>
                                                <div className="tcol address hidden">Direcióon</div>
                                                <div className="tcol website hidden">Sitio Web</div>
                                                <div className="tcol status hidden">Status</div>
                                                <div className="tcol action"></div>
                                            </div>
                                        </div>
                                        <div className="tbody">
                                            <div className="wrapper">
                                                {
                                                    this.state.dealersList.map(dealer => {
                                                        /* #region ROW CLASSES */
                                                        const dealerRowClasses = classNames({
                                                            'trow': true,
                                                            'active': dealer.status === 1,
                                                            'inactive': dealer.status === 0,
                                                            'selected': dealer.isSelected
                                                        });

                                                        const btnEditDealerClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-edit-dealer': true
                                                        });

                                                        const btnDeleteDealerClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-delete-dealer': true
                                                        });
                                                        /* #endregion */
                                                        return (
                                                            <div className={dealerRowClasses} id={dealer.id} key={dealer.id}>
                                                                <div className="tcol id hidden">{dealer.id}</div>
                                                                <div className="tcol dni">{dealer.dni}</div>
                                                                <div className="tcol name">{dealer.name}</div>
                                                                <div className="tcol email ">{dealer.email}</div>
                                                                <div className="tcol phone ">{dealer.phone}</div>
                                                                <div className="tcol contact hidden">{dealer.contact}</div>
                                                                <div className="tcol address hidden">{dealer.address}</div>
                                                                <div className="tcol website hidden">{dealer.website}</div>
                                                                <div className="tcol status hidden">{dealer.status}</div>
                                                                <div className="tcol action">
                                                                    <FontAwesomeIcon onClick={this.btnEditClick} title="Editar" className={btnEditDealerClasses} id={'btn-edit-dealer-' + this.props.pid} icon={faPencilAlt} />
                                                                    <FontAwesomeIcon onClick={this.btnDeleteClick} title="Eliminar" className={btnDeleteDealerClasses} id={'btn-delete-dealer-' + this.props.pid} icon={faTrashAlt} />
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