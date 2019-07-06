import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';
import { mergeWithShadow } from '../../common/styles';

interface IProps {
  title: string;
  subtitle: string;
  right: React.ReactNode;
  icon: React.ReactNode;
}

export class SummaryItem extends React.PureComponent<IProps> {
  render() {
    const { title, subtitle, right, icon } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.left}>
          <View style={styles.titleBlock}>
            <View style={styles.icon}>{icon}</View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    );
  }
}

const styles: { [key: string]: any } = StyleSheet.create({
  container: mergeWithShadow({
    paddingVertical: VARIABLES.PADDING_SMALL,
    paddingLeft: VARIABLES.PADDING_MEDIUM,
    paddingRight: VARIABLES.PADDING_SMALL,
    backgroundColor: COLORS.WHITE.toString(),
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
    width: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: VARIABLES.PADDING_BIG,
  }),

  left: {},

  right: {},

  titleBlock: {
    flexDirection: 'row',
  },

  icon: {
    width: 26,
    height: 26,
  },

  title: {
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    fontFamily: FONTS.BOLD,
    color: COLORS.BLACK.toString(),
  },

  subtitle: {
    fontSize: VARIABLES.FONT_SIZE_TINY,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.GRAY.toString(),
  },
});
