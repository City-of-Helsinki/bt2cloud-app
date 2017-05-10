import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';

class Button extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    var TouchableElement = TouchableWithoutFeedback;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }

    return (
      <TouchableElement onPress={this.props.onPress}>
        <View style={this.props.style}>
          {this.props.children}
        </View>
      </TouchableElement>
    );
  }
}

module.exports = Button
