import React, { Component } from 'react';
import {
	View,
	StyleSheet,
	Image,
	ActivityIndicator,
} from 'react-native';

import logo from '../img/logo192.png';

class SplashScreen extends Component {
	render() {
	  return (
	    <View style={{flex:1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',}}>
	    	<Image source={logo} style={{width: 192, height: 192,}}/>
	    	<ActivityIndicator color='navy' size={50} />
	    </View>
	  );
	}
}

export default SplashScreen;