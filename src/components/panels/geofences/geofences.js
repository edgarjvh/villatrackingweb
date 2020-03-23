import React, { Component } from 'react';
import './geofences.css';
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

    // geofences info    
    name: '',
    description: '',
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