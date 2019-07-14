import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import RaisedButton from './Button/RaisedButton';
import { success as mapSuccess } from '../actions/map';
import localitiesGeoJSON from '../assets/data/localidades.geojson';
import gmapsStyles from '../assets/data/gmaps-styles.json';
import directorioECAS from '../assets/data/directorio-ECAS.json';
import directorioARindexedByLoc from '../assets/data/directorio-AR-indexedByLoc.json';
import directorioECASindexedByLoc from '../assets/data/directorio-ECAS-indexedByLoc.json';
import directorioIETDHindexedByLoc from '../assets/data/directorio-IETDH-indexedByLoc.json';

const style = {
  width: '100%',
  height: '100%'
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyBYuNcKCVqlkr-le0gxLDYwq-EWBt5Jbvg';

export class MapComponent extends Component {
  state = {
    showingInfoWindow: false,
    positionInfoWindow: null,
    activeMarker: {},
    selectedPlace: {},
    directorioECAS,
    currentLocation: {
      coords: {
        latitude: 4.638179399999999,
        longitude: -74.0919361
      }
    }
  };

  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        currentLocation: position
      });
    });
  }

  // onMarkerClick = (props, marker, e) => {
  //   this.setState({
  //     selectedPlace: props,
  //     showingInfoWindow: true
  //   });
  // };

  onMapClicked = (props) => {
    if (this.state.showingInfoWindow) {
      this.state.selectedPlace._feature.setProperty('isClicked', false);
      this.setState({
        showingInfoWindow: false,
        selectedPlace: {}
      });
    }
  };

  onMapDragend = (mapProps, map) => {
    // ...
  };

  onInfoWindowClose = (...args) => {
    if (this.state.showingInfoWindow) {
      this.state.selectedPlace._feature.setProperty('isClicked', false);
      this.setState({
        showingInfoWindow: false,
        selectedPlace: {}
      });
    }
  };

  renderInfoWindowContent = () => {
    let loc = document.getElementById('loc-id').textContent;
    ReactDOM.render(
      <div>
        <div>{`${
          directorioARindexedByLoc[loc] ? directorioARindexedByLoc[loc].length : 0
        } Asociaciones de Recicladores`}</div>
        <div>{`${
          directorioECASindexedByLoc[loc] ? directorioECASindexedByLoc[loc].length : 0
        } Estaciones de Clasificación y Aprovechamiento de Residuos`}</div>
        <div>{`${
          directorioIETDHindexedByLoc[loc] ? directorioIETDHindexedByLoc[loc].length : 0
        } Instituciones de Educación para el Trabajo y el Desarrollo Humano`}</div>
        <RaisedButton onClick={this.onInfoWindowButtonClick}>Seleccionar</RaisedButton>
      </div>,
      document.getElementById('iw-content')
    );
  };

  onInfoWindowButtonClick = (event) => {
    console.log('onInfoWindowButtonClick()', event);
  };

  onReady = (mapProps, map) => {
    const { google } = mapProps;
    const distanceMatrixService = new google.maps.DistanceMatrixService();

    const coords = this.state.currentLocation.coords;
    const currentPosition = new google.maps.LatLng(coords.latitude, coords.longitude);
    const positions = this.state.directorioECAS.map(
      (ECA) => new google.maps.LatLng(ECA.Latitud, ECA.Longitud)
    );

    distanceMatrixService.getDistanceMatrix(
      {
        origins: [currentPosition],
        destinations: [...positions],
        travelMode: 'DRIVING'
      },
      (response, status) => {
        let nearestIndex = 0;
        let minValue = response.rows[0].elements[0].distance.value;

        response.rows[0].elements.forEach((element, index) => {
          if (element.distance.value < minValue) {
            minValue = element.distance.value;
            nearestIndex = index;
          }
        });

        directorioECAS[nearestIndex].isNearest = true;

        this.setState((prevState) => {
          prevState.directorioECAS[nearestIndex].isNearest = true;
          return { directorioECAS: prevState.directorioECAS };
        });
      }
    );

    this.props.dispatch(mapSuccess({ mapProps, map }));
    map.data.loadGeoJson(localitiesGeoJSON);
    map.data.setStyle((feature) => {
      let fillColor = '#00bcd4';
      let strokeColor = '#0097a7';
      let strokeWeight = 1;
      let fillOpacity;
      let zIndex;
      if (feature.getProperty('isOver')) {
        fillOpacity = 0.5;
        strokeWeight = 2;
        zIndex = 999;
      }
      if (feature.getProperty('isClicked')) {
        fillColor = '#0097a7';
        fillOpacity = 0.7;
        strokeWeight = 4;
        zIndex = 999;
      }
      return {
        fillColor,
        fillOpacity,
        strokeColor,
        strokeWeight,
        zIndex
      };
    });
    map.data.addListener('mouseover', (event) => {
      event.feature.setProperty('isOver', true);
    });
    map.data.addListener('mouseout', (event) => {
      event.feature.setProperty('isOver', false);
    });
    map.data.addListener('click', (event) => {
      if (this.state.selectedPlace._feature !== void 0) {
        this.state.selectedPlace._feature.setProperty('isClicked', false);
      }
      event.feature.setProperty('isClicked', true);
      this.setState(
        () => ({
          showingInfoWindow: true,
          positionInfoWindow: event.latLng,
          selectedPlace: {
            name: event.feature.getProperty('NOMBRE'),
            _feature: event.feature
          }
        }),
        this.renderInfoWindowContent
      );
    });
  };

  render() {
    const { currentLocation } = this.state;
    const { google } = this.props;
    return (
      <Map
        google={google}
        style={style}
        styles={gmapsStyles}
        initialCenter={{
          lat: 4.60971,
          lng: -74.08175
        }}
        zoom={10}
        onClick={this.onMapClicked}
        onDragend={this.onMapDragend}
        onReady={this.onReady}
      >
        <Marker
          title={'Localización actual'}
          name={'Industria X'}
          position={{ lat: currentLocation.coords.latitude, lng: currentLocation.coords.longitude }}
        />

        {this.state.directorioECAS.map((ECA, index) => (
          <Marker
            key={index}
            title={'ECA'}
            name={'ECA'}
            position={{
              lat: ECA.Latitud,
              lng: ECA.Longitud
            }}
            icon={{
              url: !ECA.isNearest
                ? 'https://cdn3.iconfinder.com/data/icons/map-markers-2-1/512/recycling-512.png'
                : 'https://cdn1.iconfinder.com/data/icons/basic-ui-elements-coloricon/21/06_1-512.png',
              anchor: !ECA.isNearest
                ? new google.maps.Point(36, 36)
                : new google.maps.Point(48, 48),
              scaledSize: !ECA.isNearest
                ? new google.maps.Size(36, 36)
                : new google.maps.Size(48, 48)
            }}
          />
        ))}
        <InfoWindow
          // marker={this.state.activeMarker}
          visible={this.state.showingInfoWindow}
          position={this.state.positionInfoWindow}
          onClose={this.onInfoWindowClose}
        >
          <div>
            <h3 id="loc-id">{this.state.selectedPlace.name}</h3>
            <div id="iw-content" />
          </div>
        </InfoWindow>
      </Map>
    );
  }
}

export default GoogleApiWrapper({ apiKey: GOOGLE_MAPS_API_KEY })(connect()(MapComponent));
