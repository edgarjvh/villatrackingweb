import React, {createRef, Component } from 'react'
import { Map, TileLayer, Popup, Marker, ZoomControl, LayersControl, Polygon, Circle, Icon } from 'react-leaflet'
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import classNames from 'classnames';
import L from 'leaflet-geometryutil'
import './map.css'
import { LatLng } from 'leaflet';

const INITIAL_STATE = {
  lat: 10.405126,
  lng: -71.450166,
  zoom: 16,
  isDrawing: false,
  isDrawingPolygon: false,
  isDrawingCircle: false,
  points: [],
  center: new LatLng(0, 0),
  radius: 0,
  color: 'blue',
  fillColor: 'blue',
  opacity: 0.5,
  showPolygon: false,
  showCircle: false,
  geofences: [],
  lookForInside: false
}
export default class MainMap extends Component {
  state = INITIAL_STATE;

  mapRef = createRef(Map);

  constructor() {
    super()
  }  

  mapClick = async (e) => {    

    let coord = e.latlng;

    if (this.state.lookForInside){
      if(this.state.isDrawingPolygon){
        console.log(this.isInsidePolygon(coord));
      }else if(this.state.isDrawingCircle){
        if (this.state.radius > 0){
          console.log(this.state.center.distanceTo(coord) <= this.state.radius);
        }
      }
    }else{
      if (this.state.isDrawingPolygon) {
        await this.setState(state => {
          const points = [...state.points, new LatLng(coord.lat, coord.lng)];
          window.geofencesBar.updateState({ points, showPolygon: true });
          return { points, showPolygon: true };
        });        
      }
  
      if (this.state.isDrawingCircle) {
        await this.setState(state => {
          if (!state.center || (state.center.lat === 0 || state.center.lng === 0)) {
            const center = coord;
            window.geofencesBar.updateState({ center });


            this.mapRef.current.leafletElement.setView(center,this.mapRef.current.leafletElement.getZoom());
            return { center };
          } else {
            const radius = state.center.distanceTo([coord.lat, coord.lng]);
            window.geofencesBar.updateState({ radius, showCircle: true });
            return { radius, showCircle: true };
          }
        });
      }
    }
  }

  isInsidePolygon = (point) => {
    var polyPoints = this.state.points;
    var x = point.lat, y = point.lng;

    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
      var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
      var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

      var intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  updateState = async state => {
    await this.setState(state);

    if(this.state.showCircle && (this.state.center.lat !== 0 && this.state.center.lng !== 0)){
      this.mapRef.current.leafletElement.setView(this.state.center,this.mapRef.current.leafletElement.getZoom());
    }
  }

  resetState = () => {
    this.setState(INITIAL_STATE);
  }

  render() {
    const position = [this.state.lat, this.state.lng]

    const showingPolygonClasses = classNames({
      'hidden': !this.showPolygon
    });
    const showingCircleClasses = classNames({
      'hidden': !this.showCircle
    });

    return (
      <Map center={new LatLng(this.state.lat, this.state.lng)} zoom={this.state.zoom} zoomControl={false} onclick={this.mapClick} ref={this.mapRef} >

        {
          this.state.showPolygon ? 
          <Polygon classNames={showingPolygonClasses} positions={this.state.points} color={this.state.color} fillColor={this.state.fillColor} opacity={this.state.opacity} /> :
          ''
        }

        {
          this.state.showCircle ?
          <Circle classNames={showingCircleClasses} center={this.state.center} radius={this.state.radius} color={this.state.color} fillColor={this.state.fillColor} opacity={this.state.opacity} /> :
          ''
        }


        <ZoomControl position="bottomright" />

        <LayersControl position="bottomright">
          <LayersControl.BaseLayer name="Carretera" checked>
            <ReactLeafletGoogleLayer
              googleMapsLoaderConf={{KEY: 'AIzaSyA3aZ3j-w2s2lwzMLA4qudEGEQ1zzDE_7I'}}
              type={'roadmap'}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satelite">
            <ReactLeafletGoogleLayer
              type={'satellite'}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Hibrido">
            <ReactLeafletGoogleLayer
              type={'hybrid'}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker> */}
      </Map>
    )
  }
}