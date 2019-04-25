import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { FONTS } from '../../common/fonts';

interface IProps {
  icon: React.ReactNode;
  title: string;
  body: string;
}

export class StatisticsInfoBlock extends React.PureComponent<IProps> {
  render() {
    const { icon, title, body } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.icon}>{icon}</View>

        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.5,
  },

  icon: {
    marginRight: VARIABLES.PADDING_MEDIUM,
    top: 1,
  },

  title: {
    fontSize: VARIABLES.FONT_SIZE_TINY,
    color: COLORS.GRAY_LIGHT.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  body: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    fontFamily: FONTS.BOLD,
  },
});
