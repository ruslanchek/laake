import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import Color from 'color';
import { FONTS } from '../../common/fonts';

interface IProps {
  onPress: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  theme: EFormButtonTheme;
  isSmall?: boolean;
  customStyles?: ViewStyle;
  title?: string;
}

export enum EFormButtonTheme {
  Red,
  Gray,
  RedLight,
  Blue,
  Purple,
}

export class FormButton extends React.PureComponent<IProps> {
  render() {
    const { children, isDisabled, isLoading, customStyles, isSmall, title } = this.props;

    return (
      <TouchableHighlight
        activeOpacity={1}
        underlayColor={this.backgroundColor.darken(0.1).toString()}
        disabled={isDisabled}
        style={[
          styles.button,
          isDisabled ? styles.disabled : null,
          {
            backgroundColor: this.backgroundColor.toString(),
          },
          customStyles ? customStyles : null,
        ]}
        onPress={this.handlePress}
      >
        <View style={styles.inner}>
          {isLoading ? (
            <ActivityIndicator
              style={styles.loading}
              size='small'
              color={this.textColor.toString()}
            />
          ) : (
            <>
              {title ? (
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: this.textColor.toString(),
                    },
                    isSmall ? styles.isSmall : styles.isLarge,
                  ]}
                >
                  {title}
                </Text>
              ) : (
                children
              )}
            </>
          )}
        </View>
      </TouchableHighlight>
    );
  }

  get backgroundColor(): Color {
    switch (this.props.theme) {
      case EFormButtonTheme.Red: {
        return COLORS.RED;
      }

      case EFormButtonTheme.RedLight: {
        return COLORS.GRAY_PALE_LIGHT;
      }

      case EFormButtonTheme.Blue: {
        return COLORS.BLUE;
      }

      case EFormButtonTheme.Purple: {
        return COLORS.PURPLE;
      }

      case EFormButtonTheme.Gray:
      default: {
        return COLORS.GRAY_PALE_LIGHT;
      }
    }
  }

  get textColor(): Color {
    switch (this.props.theme) {
      case EFormButtonTheme.Red: {
        return COLORS.WHITE;
      }

      case EFormButtonTheme.RedLight: {
        return COLORS.RED;
      }

      case EFormButtonTheme.Blue: {
        return COLORS.WHITE;
      }

      case EFormButtonTheme.Purple: {
        return COLORS.WHITE;
      }

      case EFormButtonTheme.Gray:
      default: {
        return COLORS.GRAY;
      }
    }
  }

  handlePress = () => {
    const { onPress, isDisabled, isLoading } = this.props;

    if (!isDisabled && !isLoading) {
      onPress();
    }
  };
}

const styles : {[key: string]: any} = StyleSheet.create({
  isSmall: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
  },

  isLarge: {
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
  },

  button: {
    height: VARIABLES.BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
    paddingHorizontal: VARIABLES.PADDING_BIG,
  },

  inner: {
    flexDirection: 'row',
  },

  loading: {},

  disabled: {
    opacity: 0.5,
  },

  buttonText: {
    textTransform: 'uppercase',
    fontFamily: FONTS.BOLD,
    textAlign: 'center',
  },
});
