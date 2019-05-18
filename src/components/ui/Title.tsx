import React from 'react';
import { Text, StyleSheet, View, Animated } from 'react-native';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';

export interface IProps {
  text: string;
  color: string;
  backgroundColor: string;
}

export class Title extends React.PureComponent<IProps> {
  render() {
    const { text, color, backgroundColor } = this.props;

    return (
      <Animated.View style={[styles.container, { backgroundColor }]}>
        <Animated.Text style={[styles.text, { color }]}>{text}</Animated.Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: VARIABLES.PADDING_MEDIUM,
    paddingHorizontal: VARIABLES.PADDING_BIG,
    top: 0,
    height: 58,
    justifyContent: 'flex-end',
    width: '100%',
  },

  text: {
    fontSize: VARIABLES.FONT_SIZE_GIANT,
    fontFamily: FONTS.BOLD,
  },
});
