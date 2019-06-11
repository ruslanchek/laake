import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { VARIABLES } from '../../common/variables';
import { Svg, Circle } from 'react-native-svg';
import { COLORS } from '../../common/colors';
import { FONTS } from '../../common/fonts';
import Icon from 'react-native-vector-icons/Ionicons';

export interface IProps {
  percent: number;
  size: number;
  strokeWidth: number;
  color: string;
  showPercentage: boolean;
}

export class Progress extends React.PureComponent<IProps> {
  render() {
    const { percent, size, color, strokeWidth, showPercentage } = this.props;

    if (percent >= 100) {
      return (
        <View style={[styles.completed, { width: size, height: size }]}>
          <Icon name={'ios-checkmark'} size={size} color={COLORS.WHITE.toString()} />
        </View>
      );
    }

    const diameter = size;
    const radius = diameter / 2;
    const radiusWithoutStroke = radius - strokeWidth / 2;
    const circleLength = 2 * Math.PI * radiusWithoutStroke;
    const dashOffset = circleLength * (1 - percent / 100);

    return (
      <View style={[styles.container, { width: diameter, height: diameter }]}>
        <View style={styles.graphics}>
          {showPercentage && (
            <View style={styles.textContainer}>
              <Text style={[styles.text]}>{percent}%</Text>
            </View>
          )}

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

  completed: {
    backgroundColor: COLORS.GREEN.toString(),
    borderRadius: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: VARIABLES.FONT_SIZE_TINY,
    textAlign: 'center',
    color: COLORS.GRAY_DARK.toString(),
  },
});
