import React, { createRef, Component } from 'react'
import './RotatedMarker';
import { Map, Popup, ZoomControl, LayersControl, Polygon, Circle, Marker } from 'react-leaflet'
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
import classNames from 'classnames';
import L from 'leaflet';
import './map.css'
import { LatLng } from 'leaflet';
import moment from 'moment';

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
  lookForInside: false,
  devicesShown: [],
  maptype: 'roadmap'
}

export default class MainMap extends Component {
  state = INITIAL_STATE;

  mapRef = createRef(Map);
  polygonRef = createRef(Polygon);
  circleRef = createRef(Circle);

  setMapCenter = (lat, lng) => {
    setTimeout(this.setMapView(lat,lng),1000);
  }

  refreshMarkers = devicesShown => {
    this.setState({
      devicesShown
    })
  }

  setMapView = (lat, lng) => {
    this.mapRef.current.leafletElement.setView(new LatLng(lat, lng), this.mapRef.current.leafletElement.getZoom());
  }

  mapClick = async (e) => {

    let coord = e.latlng;

    if (this.state.lookForInside) {
      if (this.state.isDrawingPolygon) {
        console.log(this.isInsidePolygon(coord));
      } else if (this.state.isDrawingCircle) {
        if (this.state.radius > 0) {
          console.log(this.state.center.distanceTo(coord) <= this.state.radius);
        }
      }
    } else {
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


            this.mapRef.current.leafletElement.setView(center, this.mapRef.current.leafletElement.getZoom());
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

      var intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  updateState = async state => {
    await this.setState(state);

    if (this.state.showPolygon) {
      this.mapRef.current.leafletElement.fitBounds(this.polygonRef.current.leafletElement.getBounds());
    }
    if (this.state.showCircle) {
      this.mapRef.current.leafletElement.fitBounds(this.circleRef.current.leafletElement.getBounds());
    }
  }

  resetState = () => {
    this.setState(INITIAL_STATE);
  }

  changeMapType = maptype => {
    this.setState({
      maptype: maptype
    });
  }

  render() {
    // const position = [this.state.lat, this.state.lng]

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
            <Polygon classNames={showingPolygonClasses} positions={this.state.points} color={this.state.color} fillColor={this.state.fillColor} opacity={this.state.opacity} ref={this.polygonRef} /> :
            ''
        }

        {
          this.state.showCircle ?
            <Circle classNames={showingCircleClasses} center={this.state.center} radius={this.state.radius} color={this.state.color} fillColor={this.state.fillColor} opacity={this.state.opacity} ref={this.circleRef} /> :
            ''
        }


        <ZoomControl position="topright" />

        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Carretera" checked={this.state.maptype === 'roadmap' ? true : ''}>
            <ReactLeafletGoogleLayer
              googleMapsLoaderConf={{ KEY: 'AIzaSyA3aZ3j-w2s2lwzMLA4qudEGEQ1zzDE_7I', VERSION: 'weekly' }}
              type={'roadmap'}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satelite" checked={this.state.maptype === 'satellite' ? true : ''}>
            <ReactLeafletGoogleLayer
              googleMapsLoaderConf={{ KEY: 'AIzaSyA3aZ3j-w2s2lwzMLA4qudEGEQ1zzDE_7I', VERSION: 'weekly' }}
              type={'satellite'}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Hibrido" checked={this.state.maptype === 'hybrid' ? true : ''}>
            <ReactLeafletGoogleLayer
              googleMapsLoaderConf={{ KEY: 'AIzaSyA3aZ3j-w2s2lwzMLA4qudEGEQ1zzDE_7I', VERSION: 'weekly' }}
              type={'hybrid'}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {
          this.state.devicesShown.map((marker) => {
            if (marker.shown && marker.location) {
              return (
                <Marker
                  position={[marker.location.latitude, marker.location.longitude]}
                  key={marker.imei}
                  icon={marker.location.speed > 0 ?
                    new L.Icon({
                      iconUrl: require('./../../marker-icons/' + marker.vehicle.icon_type + 'move.svg'),
                      iconSize: [marker.vehicle.icon_size_w, marker.vehicle.icon_size_h]
                    }) :
                    new L.Icon({
                      iconUrl: require('./../../marker-icons/' + marker.vehicle.icon_type + 'stop.svg'),
                      iconSize: [marker.vehicle.icon_size_w, marker.vehicle.icon_size_h]
                    })
                  }
                  title={marker.imei}
                  rotationAngle={marker.location.orientation}
                  rotationOrigin={'center'}
                >
                  <Popup closeOnClick={false} closeOnEscapeKey={false}>
                    <div className="popup-bg">

                      <div className="popup-device-imei">
                        <div className="popup-title">Imei / ID:</div>
                        <div className="popup-data">{marker.imei}</div>
                      </div>

                      <div className="popup-client-info">
                        <div className="popup-client-name">{marker.vehicle.client.name}</div>
                        <div className="popup-license-plate">{marker.vehicle.license_plate}</div>
                      </div>
                      <div className="popup-device-info">

                        <div className="popup-location-row row">

                          <div className="popup-latitude-row row">

                            <div className="popup-latitude-icon icon">
                              <img src={require('./../../marker-icons/lat.png')} alt="latitude" />
                            </div>

                            <div className="popup-latitude col">
                              <div className="popup-title">Latitud</div>
                              <div className="popup-data">{marker.location.latitude}</div>
                            </div>

                          </div>

                          <div className="popup-longitude-row row">

                            <div className="popup-longitude-icon icon">
                              <img src={require('./../../marker-icons/lng.png')} alt="longitude" />
                            </div>

                            <div className="popup-longitude col">
                              <div className="popup-title">Longitud</div>
                              <div className="popup-data">{marker.location.longitude}</div>
                            </div>

                          </div>

                        </div>

                        <div className="popup-datetime-row row">

                          <div className="popup-date-row row">

                            <div className="popup-date-icon icon">
                              <img src={require('./../../marker-icons/date.png')} alt="date" />
                            </div>

                            <div className="popup-date col">
                              <div className="popup-title">Fecha</div>
                              <div className="popup-data">
                                {moment(marker.location.date_time, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY')}
                              </div>
                            </div>

                          </div>

                          <div className="popup-time-row row">

                            <div className="popup-time-icon icon">
                              <img src={require('./../../marker-icons/time.png')} alt="time" />
                            </div>

                            <div className="popup-time col">
                              <div className="popup-title">Hora</div>
                              <div className="popup-data">
                                {moment(marker.location.date_time, 'YYYY-MM-DD HH:mm:ss').format('hh:mm:ss a')}
                              </div>
                            </div>

                          </div>

                        </div>

                        <div className="popup-gps-row row">
                          <div className="popup-speed-row row">
                            <div className="popup-speed-icon icon">
                              <img src={require('./../../marker-icons/speedometer.png')} alt="speed" />
                            </div>

                            <div className="popup-speed col">
                              <div className="popup-title">Velocidad</div>
                              <div className="popup-data">{marker.location.speed.toString() + ' Km/h'}</div>
                            </div>
                          </div>

                          <div className="popup-odometer-row row">
                            <div className="popup-odometer-icon icon">
                              <img src={require('./../../marker-icons/odometer.png')} alt="odometer" />
                            </div>
                            <div className="popup-odometer col">
                              <div className="popup-title">Odómetro</div>
                              <div className="popup-data">N/A</div>
                            </div>
                          </div>

                        </div>

                        <div className="popup-sensor-row row">
                          <div className="popup-fuel-row row">
                            <div className="popup-fuel-icon icon">
                              <img src={require('./../../marker-icons/fuel.png')} alt="fuel" />
                            </div>
                            <div className="popup-fuel col">
                              <div className="popup-title">Combustible</div>
                              <div className="popup-data">N/A</div>
                            </div>
                          </div>

                          <div className="popup-temperature-row row">
                            <div className="popup-temperature-icon icon">
                              <img src={require('./../../marker-icons/thermometer.png')} alt="temperature" />
                            </div>
                            <div className="popup-temperature col">
                              <div className="popup-title">Temperatura</div>
                              <div className="popup-data">N/A</div>
                            </div>
                          </div>

                        </div>

                        <div className="popup-address col">
                          <div className="popup-title">Dirección</div>
                          <div className="popup-data">N/A</div>
                        </div>
                      </div>

                      <div className="popup-command-row">
                        <div className="command-resume-engine btn" title="Habilitar Ignición">
                          <img src={require('./../../marker-icons/carunlocked.png')} alt="unlock car" />
                        </div>
                        <div className="command-stop-engine btn" title="Deshabilitar Ignición">
                          <img src={require('./../../marker-icons/carlocked.png')} alt="lock car" />
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            } else {
              return false;
            }
          })
        }
      </Map>
    )
  }
}