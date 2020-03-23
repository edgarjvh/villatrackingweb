import React, { Component } from 'react';
import './modal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import $ from 'jquery';

export default class Modal extends Component {
    constructor() {
        super();

        this.state = {
            title: '',
            target: '',
            style: '',
            headers: [],
            data: []
        }

        $(document).ready(() => {
            $(document).on('click', '#btn-close-modal', (e) => {
                let btn = $(e.target);

                btn.closest('.modal').fadeOut();
            });
        });
    }

    setData = (data) => {
        this.setState({
            title: data.title,
            target: data.target,
            style: data.style,
            headers: data.headers,
            data: data.data
        });
    }

    show = () => {
        $(document).find('.modal').fadeIn();
    }

    render() {
        if (this.state.style === 'row') {
            return (
                <div className="modal row-style">
                    <div className="modal-wrapper">
                        <div className="modal-container">
                            <div className="modal-title">
                                <div className="title">{this.state.title + ' (' + this.state.target + ')'}</div>
                                <FontAwesomeIcon id="btn-close-modal" className="btn-close-modal" icon={faTimes} />
                            </div>

                            <div className="modal-content">
                                <div className="modal-content-wrapper">

                                    {
                                        this.state.headers.map((item, index) => {
                                            return (
                                                <div key={index} className="modal-row">
                                                    <div key={index} className="modal-col left">{item + ':'}</div>
                                                    <div key={index} className="modal-col right">{this.state.data[index]}</div>
                                                </div>)
                                        })
                                    }

                                </div>
                                <div className="modal-index"></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="modal col-style">
                    <div className="modal-wrapper">
                        <div className="modal-container">
                            <div className="modal-title">
                                <div className="title">{this.state.title + ' (' + this.state.target + ') ' + this.state.data.length}</div>
                                <FontAwesomeIcon id="btn-close-modal" className="btn-close-modal" icon={faTimes} />
                            </div>

                            <div className="modal-content">
                                <div className="modal-content-wrapper">
                                    <table cellPadding="0" cellSpacing="0">
                                        <thead>
                                            <tr>
                                                {
                                                    this.state.headers.map((item, index) => {
                                                        return (
                                                            <td key={index}>{item}</td>
                                                        )
                                                    })
                                                }
                                            </tr>
                                        </thead>

                                        <tbody>
                                                {
                                                    this.state.data.map((item, index) => {
                                                        console.log(item);
                                                        return (
                                                            <tr key={index}>
                                                                <td>{item.licensePlate}</td>
                                                                <td>{item.brand}</td>
                                                                <td>{item.model}</td>
                                                                <td>{item.type}</td>
                                                                <td>{item.year}</td>
                                                                <td>{item.color}</td>
                                                                <td>{item.status}</td>
                                                            </tr>                                                            
                                                        )
                                                    })
                                                }
                                        </tbody>

                                    </table>
                                </div>
                                <div className="modal-index"></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}