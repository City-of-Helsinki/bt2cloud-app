import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';

class FloatingActionButton extends Component {

  constructor(props, context) {
    super(props);
  }

  render() {

    var TouchableElement = TouchableWithoutFeedback;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }

    return (
      <TouchableElement onPress={this.props.onPress}>
        <View style={[styles.container, {backgroundColor: this.props.color}]}>
          <Text style={{color:'white', fontSize: this.props.size}}>{this.props.displayText}</Text>
        </View>
      </TouchableElement>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: 'navy',
    position: 'absolute',
    bottom: 8,
    right: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#FFF',
        shadowOffset: {width: 1, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  icon: {
    height: 30,
    width: 30
  }
});


export default FloatingActionButton;
