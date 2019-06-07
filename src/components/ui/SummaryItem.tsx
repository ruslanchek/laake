import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';

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

const styles = StyleSheet.create({
  container: {
    shadowColor: COLORS.GRAY_PALE_LIGHT.toString(),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    padding: VARIABLES.PADDING_BIG,
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
  },

  left: {},

  right: {},

  titleBlock: {
    flexDirection: 'row',
  },

  icon: {
    width: 26,
  },

  title: {
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    fontFamily: FONTS.BOLD,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.GRAY.toString(),
  },
});
