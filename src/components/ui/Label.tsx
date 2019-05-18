import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { FONTS } from '../../common/fonts';

export interface IProps {}

export class Label extends React.PureComponent<IProps> {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.content}>{this.props.children}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0.5,
    fontSize: VARIABLES.FONT_SIZE_TINY,
    backgroundColor: COLORS.GRAY.alpha(0.2).toString(),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: VARIABLES.PADDING_BIG,
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
  },

  content: {
    color: COLORS.BLACK.toString(),
    fontFamily: FONTS.BOLD,
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
  },
});
