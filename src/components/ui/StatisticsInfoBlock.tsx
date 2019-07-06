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
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.body}>
            {body}
          </Text>
        </View>
      </View>
    );
  }
}

const styles : {[key: string]: any} = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: VARIABLES.PADDING_BIG * 1.5,
    paddingHorizontal: VARIABLES.PADDING_BIG * 1.5,
  },

  icon: {
    marginRight: VARIABLES.PADDING_MEDIUM,
    top: 1,
  },

  title: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    color: COLORS.GRAY_LIGHT.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  body: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    fontFamily: FONTS.MEDIUM,
  },
});
