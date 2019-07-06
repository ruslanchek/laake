import React from 'react';
import { View, Animated, StyleSheet, TextInput, TouchableWithoutFeedback } from 'react-native';
import { COLORS } from '../../common/colors';
import { GLOBAL_STYLES } from '../../common/styles';
import { VARIABLES } from '../../common/variables';

interface IProps {
  value: string;
  placeholder: string;
  label: string;
  suffix: React.ReactNode;
  prefix: React.ReactNode;
  onChange: (value: string) => void;
  onFocus: () => void;
  error: boolean;
}

interface IState {
  isFocused: boolean;
  animated: Animated.Value;
}

const SHAKE_KEYFRAME_DURATION = 50;

export class FormTextInput extends React.Component<IProps, IState> {
  state = {
    isFocused: false,
    animated: new Animated.Value(0),
  };

  textInput: TextInput | null = null;

  componentWillReceiveProps(nextProps: Readonly<IProps>, nextContext: any): void {
    if (nextProps.error) {
      this.shake();
    }
  }

  shake() {
    Animated.sequence([
      Animated.timing(this.state.animated, {
        toValue: -1,
        duration: SHAKE_KEYFRAME_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.animated, {
        toValue: 1,
        duration: SHAKE_KEYFRAME_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.animated, {
        toValue: -2,
        duration: SHAKE_KEYFRAME_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.animated, {
        toValue: 2,
        duration: SHAKE_KEYFRAME_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.animated, {
        toValue: -1,
        duration: SHAKE_KEYFRAME_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.animated, {
        toValue: -1,
        duration: SHAKE_KEYFRAME_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.animated, {
        toValue: 0,
        duration: SHAKE_KEYFRAME_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }

  render() {
    const { placeholder, label, prefix, suffix, onChange, onFocus, value, error } = this.props;

    return (
      <View style={GLOBAL_STYLES.INPUT_CONTAINER}>
        {prefix && <View style={styles.prefix}>{prefix}</View>}

        <TouchableWithoutFeedback
          onPress={() => {
            if (this.textInput) {
              this.textInput.focus();
            }
          }}
        >
          <View style={styles.inputContainer}>
            {label && (
              <Animated.Text
                style={[
                  GLOBAL_STYLES.INPUT_LABEL,
                  styles.inputLabel,
                  error ? styles.inputLabelError : null,
                  {
                    transform: [
                      {
                        translateX: this.state.animated.interpolate({
                          inputRange: [-1, 1],
                          outputRange: [-1, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {label}
              </Animated.Text>
            )}

            <TextInput
              ref={ref => {
                this.textInput = ref;
              }}
              numberOfLines={1}
              style={[GLOBAL_STYLES.INPUT, styles.input]}
              value={value}
              placeholder={placeholder}
              placeholderTextColor={COLORS.GRAY_LIGHT.toString()}
              onChangeText={text => {
                onChange(text);
              }}
              onFocus={() => {
                this.setState({
                  isFocused: true,
                });

                onFocus();
              }}
              onBlur={() => {
                this.setState({
                  isFocused: false,
                });
              }}
            />
          </View>
        </TouchableWithoutFeedback>

        {suffix && <View style={styles.suffix}>{suffix}</View>}
      </View>
    );
  }
}

const styles: { [key: string]: any } = StyleSheet.create({
  containerFocus: {},

  inputContainer: {
    flexShrink: 0,
    flexGrow: 1,
    flexDirection: 'column',
  },

  input: {
    paddingTop: 30,
    paddingBottom: VARIABLES.PADDING_MEDIUM - 4,
    color: COLORS.BLACK.toString(),
  },

  inputLabelError: {
    color: COLORS.RED.toString(),
  },

  inputLabel: {
    left: VARIABLES.PADDING_MEDIUM,
    top: VARIABLES.PADDING_MEDIUM - 3,
    position: 'absolute',
    marginBottom: 0,
  },

  suffix: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.GRAY_PALE_LIGHT.toString(),
  },

  prefix: {
    borderRightWidth: 2,
    borderRightColor: COLORS.GRAY_PALE_LIGHT.toString(),
  },
});
