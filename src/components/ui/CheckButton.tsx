import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';
import Icon from 'react-native-vector-icons/Ionicons';
import { Appear, EAppearType } from '../common/Appear';

interface IProps {
  isChecked: boolean;
  isLoading: boolean;
  text: string;
  onPress: () => void;
}

interface IState {
  animated: Animated.Value;
}

export class CheckButton extends React.PureComponent<IProps, IState> {
  state = {
    animated: new Animated.Value(this.props.isChecked ? 1 : 0),
  };

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.isChecked || nextProps.isLoading) {
      this.in();
    } else if (!nextProps.isChecked && !nextProps.isLoading) {
      this.out();
    }
  }

  in() {
    Animated.timing(this.state.animated, {
      toValue: 1,
      duration: 200,
    }).start();
  }

  out() {
    Animated.timing(this.state.animated, {
      toValue: 0,
      duration: 200,
    }).start();
  }

  render() {
    const { isChecked, isLoading, text, onPress } = this.props;
    const { animated } = this.state;

    return (
      <TouchableHighlight
        underlayColor={COLORS.WHITE.alpha(0.075).toString()}
        style={styles.button}
        onPress={onPress.bind(this)}
      >
        <>
          <Text style={styles.buttonText}>{text}</Text>

          <Animated.View
            style={{
              width: animated.interpolate({
                inputRange: [0, 1],
                outputRange: [VARIABLES.PADDING_MEDIUM, 32],
              }),
            }}
          >
            <Appear
              type={EAppearType.Spring}
              show={isChecked && !isLoading}
              customStyles={styles.iconContainer}
            >
              <Icon
                name='ios-checkmark'
                size={32}
                style={styles.icon}
                color={COLORS.WHITE.toString()}
              />
            </Appear>

            <Appear
              type={EAppearType.Spring}
              show={isLoading}
              customStyles={styles.loadingContainer}
            >
              <ActivityIndicator size='small' color={COLORS.WHITE.toString()} />
            </Appear>
          </Animated.View>
        </>
      </TouchableHighlight>
    );
  }
}

const styles : {[key: string]: any} = StyleSheet.create({
  button: {
    backgroundColor: COLORS.WHITE.alpha(0.125).toString(),
    paddingLeft: VARIABLES.PADDING_MEDIUM,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: COLORS.WHITE.alpha(0.1).toString(),
    overflow: 'hidden',
  },

  buttonText: {
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.MEDIUM,
    fontSize: VARIABLES.FONT_SIZE_SMALL,
  },

  icon: {},

  iconContainer: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContainer: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
});
