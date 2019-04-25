import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { VARIABLES } from '../../common/variables';
import { Svg, Circle } from 'react-native-svg';
import { COLORS } from '../../common/colors';
import { FONTS } from '../../common/fonts';

export interface IProps {
  percent: number;
  size: number;
  strokeWidth: number;
  color: string;
}

export class Progress extends React.PureComponent<IProps> {
  render() {
    const { percent, size, color, strokeWidth } = this.props;
    const diameter = size;
    const radius = diameter / 2;
    const radiusWithoutStroke = radius - strokeWidth / 2;
    const circleLength = 2 * Math.PI * radiusWithoutStroke;
    const dashOffset = (circleLength + strokeWidth / 2) * (1 - percent / 100);

    return (
      <View style={[styles.container, { width: diameter, height: diameter }]}>
        <View style={styles.graphics}>
          <View style={styles.textContainer}>
            <Text style={[styles.text]}>{percent}%</Text>
          </View>
          <Svg height={diameter} width={diameter}>
            <Circle
              cx={radius}
              cy={radius}
              r={radiusWithoutStroke}
              rotation={-90}
              origin={`${radius},${radius}`}
              strokeWidth={strokeWidth}
              stroke={COLORS.GRAY_PALE_LIGHT.toString()}
              fill='transparent'
              strokeLinecap='round'
            />
            <Circle
              cx={radius}
              cy={radius}
              r={radiusWithoutStroke}
              rotation={-90}
              origin={`${radius},${radius}`}
              strokeWidth={strokeWidth}
              stroke={color}
              fill='transparent'
              strokeLinecap='round'
              strokeDasharray={[circleLength]}
              strokeDashoffset={dashOffset}
            />
          </Svg>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0.5,
    fontSize: VARIABLES.FONT_SIZE_TINY,
  },

  graphics: {},

  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },

  text: {
    fontFamily: FONTS.BOLD,
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    textAlign: 'center',
  },
});
