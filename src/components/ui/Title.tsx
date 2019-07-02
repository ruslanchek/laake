import React from 'react';
import { Text, StyleSheet, View, Platform } from 'react-native';
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
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.text, { color }]}>{text}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: VARIABLES.PADDING_MEDIUM,
    paddingHorizontal: VARIABLES.PADDING_BIG,
    top: 0,
    height: 65,
    justifyContent: 'flex-end',
    width: '100%',
  },

  text: {
    fontSize: VARIABLES.FONT_SIZE_GIANT,
    fontFamily: FONTS.BOLD,
  },
});
