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
        <View style={[
          styles.container, 
          {
            backgroundColor: this.props.color,
            width: this.props.size,
            height: this.props.size,
            borderRadius: this.props.size / 2,
          }
        ]}>
          <Text style={{color:'white', fontSize: this.props.fontSize}}>{this.props.displayText}</Text>
        </View>
      </TouchableElement>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'navy',
    position: 'absolute',
    bottom: 20,
    right: 5,
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
