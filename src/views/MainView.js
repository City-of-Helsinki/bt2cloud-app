import React, { Component } from 'react';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from '../components/TabBar';

import { connect } from 'react-redux';
import BGTimer from 'react-native-background-timer';

import realm from '../realm';
import ScanView from './ScanView';
import BackendsView from './BackendsView';
import SettingsView from './SettingsView';
import Utils from '../utils/utils';
import Colors from '../colors';

import {
	FILE_TAG_GPS,
	GPS_OPTIONS,
} from '../constants';

class MainView extends Component {

	constructor(props) {
		super(props);
		this.setGPSTrigger = this.setGPSTrigger.bind(this);
	}

	componentDidMount(){
    this.watchID = navigator.geolocation.watchPosition((position) => {
    	console.log('successfully got watched location', position);
      this.lastPosition = position.coords;
    },
    (error) => {
    	console.log(error)
    }, GPS_OPTIONS);
    
    this.setGPSTrigger(this.props.settings.GPSInterval);		
	}

	setGPSTrigger(interval) {
    this.GPSTrigger = BGTimer.setInterval(()=>{
    	try {
    		if (this.lastPosition.latitude) {
	    		let gps = {
	    			lat: this.lastPosition.latitude,
	    			lon: this.lastPosition.longitude,
	    			acc: this.lastPosition.accuracy.toFixed(3),
	    			alt: this.lastPosition.altitude,
	    			time: new Date(),
	    		}
	    		Utils.writeToFile(gps, FILE_TAG_GPS);
    		}
    	}
    	catch(err) {
    		console.log('error writing GPS to file', err);
    	}	      
    }, interval * 1000);		
	}

	componentWillReceiveProps(newProps) {
		if (!newProps.settings || !newProps.settings.GPSInterval) return;
		
		if (newProps.settings.GPSInterval !== this.props.settings.GPSInterval) {
			if (this.GPSTrigger) BGTimer.clearInterval(this.GPSTrigger);
			this.setGPSTrigger(newProps.settings.GPSInterval);
		}
	}

	componentWillUnmount() {
		if (this.watchID) navigator.geolocation.clearWatch(this.watchID);
	}

	render() {
	  return (
	    <ScrollableTabView renderTabBar={() => <TabBar />}>
	      <ScanView tabLabel="Nearby devices" />
	      <BackendsView tabLabel="Backends" />
	      <SettingsView tabLabel="App Settings" />
	    </ScrollableTabView>
	  );
	}
}

function mapStateToProps(state) {
  return {
  	settings: state.settings,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainView);