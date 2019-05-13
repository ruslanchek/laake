import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';

export interface IProps {
  text: string;
  color: string;
}

export class Title extends React.PureComponent<IProps> {
  render() {
    const { text, color } = this.props;

    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color }]}>{text}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0.5,
    fontSize: VARIABLES.FONT_SIZE_TINY,
  },

  text: {
    fontSize: VARIABLES.FONT_SIZE_GIANT,
    fontFamily: FONTS.BOLD,
  },
});
