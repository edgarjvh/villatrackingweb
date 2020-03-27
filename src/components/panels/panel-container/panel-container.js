import React, { Component } from 'react'
import './panel-container.css'
import $ from 'jquery'
import 'jquery-ui-dist/jquery-ui'
import 'jquery-ui-dist/jquery-ui.css'
import UsersPanel from './../users/users';
import DealersPanel from './../dealers/dealers';
import SimcardsPanel from './../simcards/simcards';
import DevicesPanel from './../devices/devices';
import ClientsPanel from './../clients/clients';
import VehiclesPanel from './../vehicles/vehicles';
import DevicesModelsPanel from '../devices_models/devices_models';
import GeofencesPanel from '../geofences/geofences';

const INITIAL_STATE = {    

    panels: [

    ]
}

export default class PanelContainer extends Component {

    constructor(props) {
        super(props)
        let _ = this;
        this.state = {
            isShowingGeofences:this.props.isShowingGeofences,
            panels: [

            ]
        }

        function setMainPanelResizable() {
            let containerWidth = $(window).width();

            $('.main-panel-container')
                .resizable({
                    handles: "e",
                    containment: "parent",
                    maxWidth: containerWidth * 0.95,
                    minWidth: containerWidth * 0.1
                });
        }

        $(document).ready(function () {
            setMainPanelResizable();
            _.setPanelsDraggable();
            _.reorderPanels();

            $(document).on('click', '.gutter', function () {
                let mainContainer = $(this).closest('.main-panel-container');
                let panelContainer = $(this).closest('.panel-container');
                let count = panelContainer.find('.panel').length;

                mainContainer.css('overflow', 'hidden');

                for (let i = 0; i < count; i++) {
                    let panel = panelContainer.find('.panel').eq(i);

                    panel.css('padding-left', '0');
                    panel.find('.panel-not-focused').fadeOut(100);
                    panel.find('.panel-selection-handler').show();
                    panel.animate({
                        left: ((100 / count) * i) + '%'
                    }, 100);
                }
                _.setPanelsDraggableVertical();
            });

            $(document).on('click', '.panel-selection-handler', function () {
                _.panelToFront($(this).closest('.panel').attr('id'));
            });
        });
    }

    getState = () => {
        return this.state;
    }

    panelToFront = id => {
        let mainContainer = $('#main-panel-container');
        let panelContainer = mainContainer.find('.panel-container');
        let panel = mainContainer.find('#' + id);

        panel.appendTo(panelContainer);
        this.reorderPanels();
    }

    addPanel = panel => {
        this.setState(state => {
            const panels = state.panels.concat(panel);

            return {
                panels
            }
        });
    }

    removePanel = id => {
        console.log('removing ' + id);
        this.setState(state => {
            const panels = state.panels.filter(item => item.id !== id);

            return {
                panels
            }
        })
    }

    reorderPanels = () => {
        let mainContainer = $(document).find('.main-panel-container');
        let panelCount = mainContainer.find('.panel-container .panel').length;
        let gutter = mainContainer.find('.gutter');

        if (panelCount > 0) {
            gutter.css('width', ((panelCount - 1) * 10) + 'px');
        }

        for (let i = 0; i < panelCount; i++) {
            let panel = mainContainer.find('.panel-container .panel').eq(i);
            let offset = i * 10;

            panel.css('padding-left', offset + 'px');
            panel.animate({
                left: '-' + offset + 'px'
            }, 100);

            panel.animate({
                top: '0'
            }, 100);

            if (i === (panelCount - 1)) {
                panel.find('.panel-not-focused').fadeOut(100);
            } else {
                panel.find('.panel-not-focused').fadeIn(100);
            }
            panel.find('.panel-selection-handler').hide();
        }

        setTimeout(function () {
            mainContainer.css('overflow', 'initial');
        }, (panelCount + 1) * 100);


        this.setPanelsDraggable();
    }

    setPanelsDraggable = () => {
        let _ = this;

        $('.panel')
            .draggable({
                axis: 'x',
                handle: '.drag-handler',
                stop: function (e, u) {
                    if (u.position.left < 0) {
                        $(this).animate({
                            left: '-100%'
                        }, 100, async function () {
                            _.removePanel($(this).attr('id'));
                            _.reorderPanels();
                        });
                    } else if (u.position.left > 100) {
                        _.reorderPanels();
                    } else {
                        _.reorderPanels();
                    }
                }
            });
    }

    setPanelsDraggableVertical = () => {
        let _ = this;

        $('.panel')
            .draggable({
                axis: 'y',
                handle: '.panel-selection-handler',
                stop: function (e, u) {
                    let panelContainer = $(this).closest('.panel-container');

                    if (u.position.top < -100) {

                        $(this).animate({
                            top: '-100%'
                        }, 100, async function () {
                            _.removePanel($(this).attr('id'));

                            let count = panelContainer.find('.panel').length;

                            if (count > 1) {
                                for (let i = 0; i < count; i++) {
                                    let panel = panelContainer.find('.panel').eq(i);

                                    panel.find('.panel-not-focused').fadeOut(100);
                                    panel.find('.panel-selection-handler').show();
                                    panel.animate({
                                        left: ((100 / count) * i) + '%'
                                    }, 100);
                                }

                            }
                            _.reorderPanels();
                        });

                    } else if (u.position.top > 100) {

                        $(this).animate({
                            top: '100%'
                        }, 100, async function () {
                            _.removePanel($(this).attr('id'));

                            let count = panelContainer.find('.panel').length;

                            if (count > 1) {
                                for (let i = 0; i < count; i++) {
                                    let panel = panelContainer.find('.panel').eq(i);

                                    panel.find('.panel-not-focused').fadeOut(100);
                                    panel.find('.panel-selection-handler').show();
                                    panel.animate({
                                        left: ((100 / count) * i) + '%'
                                    }, 100);
                                }
                            }
                            _.reorderPanels();
                        });
                    } else {
                        let count = panelContainer.find('.panel').length;

                        for (let i = 0; i < count; i++) {
                            let panel = panelContainer.find('.panel').eq(i);

                            panel.animate({
                                top: '0'
                            }, 100);
                        }
                    }
                }
            });
    }

    render() {
        return (
            <div className={this.props.isShowingGeofences ? 'main-panel-container hidden' : this.state.panels.length > 0 ? 'main-panel-container shown' : 'main-panel-container hidden'} id="main-panel-container">
                <div className="panel-container">
                    <div className="gutter"></div>

                    {
                        (this.state.panels || []).map((item) => (
                            item.type === 'users' ? <UsersPanel key={item.id} pid={item.id} uid={item.uid} ref={(users) => { window.users = users }} /> :
                                item.type === 'dealers' ? <DealersPanel key={item.id} pid={item.id} did={item.did} ref={(dealers) => { window.dealers = dealers }} /> :
                                    item.type === 'simcards' ? <SimcardsPanel key={item.id} pid={item.id} sid={item.sid} ref={(simcards) => { window.simcards = simcards }} /> :
                                        item.type === 'devices' ? <DevicesPanel key={item.id} pid={item.id} did={item.did} ref={(devices) => { window.devices = devices }} /> :
                                            item.type === 'clients' ? <ClientsPanel key={item.id} pid={item.id} cid={item.cid} ref={(clients) => { window.clients = clients }} /> :
                                                item.type === 'vehicles' ? <VehiclesPanel key={item.id} pid={item.id} ref={(vehicles) => { window.vehicles = vehicles }} vid={item.vid} /> :
                                                    item.type === 'devices-models' ? <DevicesModelsPanel key={item.id} pid={item.id} ref={(devices_models) => { window.devices_models = devices_models }} mid={item.mid} /> :
                                                        item.type === 'geofences' ? <GeofencesPanel key={item.id} pid={item.id} ref={(geofences) => { window.geofences = geofences }} gid={item.gid} /> :
                                                            ''
                        ))
                    }
                </div>
            </div>
        )
    }
}