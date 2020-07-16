import React, { Component } from 'react'
import './users.css'
import Config from './../../../config';
// import SimpleCrypto from 'simple-crypto-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSpinner, faSearch, faTimes, faSyncAlt, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import classNames from 'classnames'
import $ from 'jquery'

const serverURL = Config.prototype.serverURL();
// const secret = '_villasecret';
// let crypto = new SimpleCrypto(secret);
const INITIAL_STATE = {
    // basic actions
    editing: false,
    deleting: false,
    saving: false,
    adding: false,

    // user info
    dni: '',
    name: '',
    email: '',
    phone: '',
    permissionLevel: 1,
    status: false,
    editingUserId: 0,
    usersList: [],
    usersShown: 0,

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

export default class UsersPanel extends Component {
    /* #region MAIN */
    panel = null;

    constructor(props) {
        super(props)

        this.state = this.getInitialState();
    }

    getInitialState = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const loggedUserId = user.id;

        INITIAL_STATE.loggedUserId = loggedUserId;

        return INITIAL_STATE;
    }

    componentDidMount() {
        window.panelContainer.reorderPanels();
        this.panel = $('#' + this.props.pid);
        this.getUsers();
    }
    /* #endregion */

    /* #region GETTERS METHODS */
    getUsers = (callback = null, isLoaded = false) => {
        this.setState({
            loaderClass: classNames({
                'loader': true,
                'hidden': false
            })
        });

        setTimeout(async () => {
            await axios.get(serverURL + '/getUsers')
                .then(res => {
                    let wrapper = this.panel.find('#tbl-users .wrapper');

                    if (res.data.result === 'OK') {
                        this.setState({
                            usersList: res.data.users,
                            usersShown: res.data.users.length
                        });
                        this.handleInputSearch();
                    } else {
                        wrapper.html('<div class="no-records">No hay usuarios registrados</div>');
                        this.setState({ usersShown: 0 });
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

                    if(!isLoaded){
                        if (this.props.uid > 0) {
                            this.editFromAssociated(this.props.uid);
                        }else if (this.props.uid === 0){
                            this.addFromAssociated();
                        }
                    }
                });
        }, 200);
    }

    onRefreshUserList = () => {
        this.getUsers(null, true);
    }
    /* #endregion */

    /* #region HANDLELING FORM */
    inputSearchChange = async (e) => {        
        await this.setState({
            searchText: e.target.value.trim().toLowerCase()
        });

        if (this.state.searchText === ''){
            this.handleInputSearch();
        }
    }

    onKeyUpSearch = (e) => {
        if (e.keyCode === 27 || e.which === 27) {
            this.onClearSearch();
        }else if(e.keyCode === 13 || e.which === 13){
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
        let wrapper = this.panel.find('#tbl-users .wrapper');

        if (this.state.searchText.substring(0, 1) === '*') {
            if (this.state.searchText === '*s1') {
                wrapper.find('.trow.active').css('display', 'flex');
                wrapper.find('.trow.inactive').css('display', 'none');
                this.setState({ usersShown: wrapper.find('.trow.active').length });
            } else if (this.state.searchText === '*s0') {
                wrapper.find('.trow.active').css('display', 'none');
                wrapper.find('.trow.inactive').css('display', 'flex');
                this.setState({ usersShown: wrapper.find('.trow.inactive').length });
            } else {
                wrapper.find('.trow').css('display', 'flex');
                this.setState({ usersShown: wrapper.find('.trow').length });
            }
        }else if (this.state.searchText === '') {
            wrapper.find('.trow').css('display', 'flex');
            this.panel.find('#tbl-users .wrapper .trow:not(.current) .tcol').css('color', 'black');
            this.setState({ usersShown: wrapper.find('.trow').length });
        }else{
            let count = 0;
            for (let i = 0; i < wrapper.find('.trow').length; i++) {
                let row = wrapper.find('.trow').eq(i);
                let dni = row.find('.dni');
                let name = row.find('.name');
                let email = row.find('.email');
                let phone = row.find('.phone');
                
                let showRow = false;

                if (dni.text().toLowerCase().includes(this.state.searchText) ||
                    name.text().toLowerCase().includes(this.state.searchText) ||
                    email.text().toLowerCase().includes(this.state.searchText) ||
                    phone.text().toLowerCase().includes(this.state.searchText)) {
                    showRow = true;
                    count++;
                }

                if (!row.hasClass('current')) {
                    dni.css('color', dni.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                    name.css('color', name.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                    email.css('color', email.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                    phone.css('color', phone.text().toLowerCase().includes(this.state.searchText) ? 'red' : 'black');
                }

                row.css('display', showRow ? 'flex' : 'none');
            }

            this.setState({ usersShown: count });
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
            serverURL + '/saveUser',
            {
                id: this.state.editingUserId,
                dni: this.state.dni,
                name: this.state.name,
                email: this.state.email,
                phone: this.state.phone,
                permission_level: this.state.permissionLevel,
                status: this.state.status
            }
        )
            .then(res => {
                console.log(res.data);

                if (res.data.result === 'CREATED' || res.data.result === 'UPDATED') {
                    let msg = res.data.result === 'CREATED' ?
                        'El usuario ha sido ingresado exitosamente. Actualizando lista, por favor espere' :
                        'El usuario ha sido actualizado exitosamente. Actualizando lista, por favor espere';

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
                        this.setState(this.getInitialState());

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

                        this.getUsers(null, true);
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
                            msgText: 'Ya existe un usuario con la cédula ingresada',
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
                            msgText: 'Ya existe un usuario con el correo electrónico ingresado',
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

    btnAddNewUserClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();

        this.setState({
            adding: true,
            editingUserId: 0
        });
    }

    btnCancelClick = (e) => {
        this.setState(this.getInitialState());

        const usersList = this.state.usersList.map(user => {
            user.isSelected = false;
            return user;
        });

        this.setState({ usersList, usersShown: usersList.length });
        this.panel.find('.sub-panels').fadeOut();
    }

    btnEditClick = (e) => {
        this.panel.find('.sub-panels').fadeIn();
        let id = Number($(e.target).closest('.trow').attr('id'));

        const usersList = this.state.usersList.map(user => {
            if (user.id === id) {
                user.isSelected = true;

                this.setState({
                    editingUserId: id,
                    dni: user.dni,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    permissionLevel: user.permission_level,
                    status: user.status === 1 ? true : false
                });

                return user;
            } else {
                return user;
            }
        })

        this.setState({
            usersList,
            editing: true
        });
    }

    btnDeleteClick = async (e) => {
        let row = $(e.target).closest('.trow');
        let id = Number(row.find('.id').text());

        if (window.confirm(`
            Si elimina este usuario perderá todos los reportes asociados.\n\r
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

            await axios.post(serverURL + '/deleteUser', { id: id })
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
                                msgText: 'El usuario ha sido eliminado exitosamente. Actualizando lista, por favor espere',
                                msgClass: classNames({
                                    'panel-message': true,
                                    'hidden': false,
                                    'running': false,
                                    'success': true,
                                    'error': false
                                })
                            });

                            this.getUsers(null, true);
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
        let wrapper = this.panel.find('#tbl-users .wrapper');

        if(isOpened){
            this.setState(INITIAL_STATE);
            this.getUsers(() => {
                this.setState({                    
                    adding: true,
                    clientListScrollTop: wrapper.scrollTop(0)
                });
            });
        }else{
            this.setState({                    
                adding: true
            });
        }
    }

    editFromAssociated = (id, isOpened = false) => {
        this.panel.find('.sub-panels').fadeIn();
        let wrapper = this.panel.find('#tbl-users .wrapper');

        if (isOpened) {
            this.setState(INITIAL_STATE);
            this.getUsers(() => {

                const clientsList = this.state.clientsList.map(client => {
                    if (client.id === id) {
                        client.isSelected = true;

                        this.setState({
                            dni:client.dni,
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
                        dni:client.dni,
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

        const selectBoxClasses = classNames({
            'select-box-container': true,
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
        const btnAddNewUserClasses = classNames({
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

        const btnRefreshUserListClasses = classNames({
            'btn-refresh-user-list': true,
            'disabled': this.state.adding || this.state.editing || this.state.saving || this.state.deleting
        });

        const tblUsersClasses = classNames({
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
                                    {this.state.adding ? 'Nuevo Usuario' : this.state.editing ? 'Editar Usuario' : ''}
                                </div>

                                <form className="" onSubmit={this.onSubmit}>
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

                                    <div className={selectBoxClasses}>
                                        <select id={'permissionLevel-' + this.props.pid} name={'permissionLevel-' + this.props.pid} onChange={this.handleInputChange} value={this.state.permissionLevel} >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                        </select>
                                        <label htmlFor={'permissionLevel-' + this.props.pid}>Nivel de Permiso</label>
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
                            <span >Usuarios <span className="counter">{this.state.usersShown}</span>
                                <div className={this.state.loaderClass} id={'loader' + this.props.pid}>
                                    <FontAwesomeIcon className="fas fa-spin" icon={faSpinner} />
                                </div>
                            </span>
                            <FontAwesomeIcon className={btnAddNewUserClasses} icon={faPlus} id="btn-new-user" title="Agregar Nuevo Usuario" onClick={this.btnAddNewUserClick} />
                            <div className="border-bottom"></div>
                        </div>

                        <div className="content">
                            <div className={this.state.msgClass}>
                                {this.state.msgText}
                            </div>

                            <div className="users-list">
                                <div className="search-container">
                                    <div className={inputBoxSearchClasses}>
                                        <input type="search" name={'search-' + this.props.pid} id={'search-' + this.props.pid} onInput={this.inputSearchChange} onChange={this.inputSearchChange} onKeyUp={this.onKeyUpSearch} value={this.state.searchText} required />
                                        <label htmlFor={'search-' + this.props.pid}>Buscar</label>
                                        <FontAwesomeIcon className="search-icon" icon={faSearch} onClick={this.handleInputSearch} />
                                        <FontAwesomeIcon onClick={this.onClearSearch} className={btnClearSearchClasses} icon={faTimes} title="Limpiar Búsqueda" />
                                    </div>
                                    <FontAwesomeIcon title="Recargar lista de usuarios" className={btnRefreshUserListClasses} icon={faSyncAlt} onClick={this.onRefreshUserList} />
                                </div>

                                <div className="users-list-content">
                                    <div className={tblUsersClasses} id="tbl-users">
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
                                                    this.state.usersList.map(user => {                                                                                                 
                                                        /* #region ROW CLASSES */
                                                        const userRowClasses = classNames({
                                                            'trow': true,
                                                            'active': user.status === 1,
                                                            'inactive': user.status === 0,
                                                            'selected': user.isSelected,
                                                            'current': this.state.loggedUserId === user.id
                                                        });

                                                        const btnEditUserClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-edit-user': true
                                                        });

                                                        const btnDeleteUserClasses = classNames({
                                                            'btn-action': true,
                                                            'btn-delete-user': true
                                                        });
                                                        /* #endregion */
                                                        return (
                                                            <div key={user.id} className={userRowClasses} id={user.id}>
                                                                <div className="tcol id hidden">{user.id}</div>
                                                                <div className="tcol dni">{user.dni}</div>
                                                                <div className="tcol name">{user.name}</div>
                                                                <div className="tcol email ">{user.email}</div>
                                                                <div className="tcol phone ">{user.phone}</div>
                                                                <div className="tcol permission-level hidden">{user.permission_level}</div>
                                                                <div className="tcol status hidden">{user.status}</div>
                                                                <div className="tcol action">
                                                                    <FontAwesomeIcon onClick={this.btnEditClick} title="Editar" className={btnEditUserClasses} id={'btn-edit-user-' + this.props.pid} icon={faPencilAlt} />
                                                                    <FontAwesomeIcon onClick={this.btnDeleteClick} title="Eliminar" className={btnDeleteUserClasses} id={'btn-delete-user-' + this.props.pid} icon={faTrashAlt} />
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