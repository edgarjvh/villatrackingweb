import React, { Component } from 'react'
import './map_controls.css';
import classNames from 'classnames';

export default class MapTypeControls extends Component {

    constructor(){
        super();

        this.state = {
            maptype: 'roadmap'
        }
    }

    roadMapClick = () => {
        this.setState({
            maptype: 'roadmap'
        });

        window.mainMap.changeMapType('roadmap');
    }

    satelliteClick = () => {
        this.setState({
            maptype: 'satellite'
        });

        window.mainMap.changeMapType('satellite');
    }

    hybridClick = () => {
        this.setState({
            maptype: 'hybrid'
        });

        window.mainMap.changeMapType('hybrid');
    }

    render(){
        const roadmapClasses = classNames({
            'maptype-roadmap': true,
            'maptype': true,
            'active': this.state.maptype === 'roadmap'
        });
        const satelliteClasses = classNames({
            'maptype-satellite': true,
            'maptype': true,
            'active': this.state.maptype === 'satellite'
        });
        const hybridClasses = classNames({
            'maptype-hybrid': true,
            'maptype': true,
            'active': this.state.maptype === 'hybrid'
        });

        return(
            <div className="maptype-container">
                <div className={roadmapClasses} onClick={this.roadMapClick}>
                    Carretera
                </div>
                <div className={satelliteClasses} onClick={this.satelliteClick}>
                    Satélite
                </div>
                <div className={hybridClasses} onClick={this.hybridClick}>
                    Híbrido
                </div>
            </div>
        )
    }
}