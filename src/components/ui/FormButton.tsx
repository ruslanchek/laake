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
}

export enum EFormButtonTheme {
  Red,
  Gray,
  RedLight,
}

export class FormButton extends React.PureComponent<IProps> {
  render() {
    const { children, onPress, isDisabled, isLoading, customStyles, isSmall } = this.props;

    return (
      <TouchableHighlight
        activeOpacity={1}
        underlayColor={this.underlayColor.darken(0.1).toString()}
        disabled={isDisabled}
        style={[
          styles.button,
          isDisabled ? styles.disabled : null,
          {
            backgroundColor: this.underlayColor.toString(),
          },
          customStyles ? customStyles : null,
        ]}
        onPress={() => {
          onPress();
        }}
      >
        <View style={styles.inner}>
          {isLoading ? (
            <ActivityIndicator
              style={styles.loading}
              size='small'
              color={COLORS.WHITE.toString()}
            />
          ) : (
            <Text
              style={[
                styles.buttonText,
                {
                  color: this.textColor.toString(),
                },
                isSmall ? styles.isSmall : styles.isLarge,
              ]}
            >
              {children}
            </Text>
          )}
        </View>
      </TouchableHighlight>
    );
  }

  get underlayColor(): Color {
    switch (this.props.theme) {
      case EFormButtonTheme.Red: {
        return COLORS.RED;
      }

      case EFormButtonTheme.RedLight: {
        return COLORS.RED.lighten(0.8);
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

      case EFormButtonTheme.Gray:
      default: {
        return COLORS.GRAY;
      }
    }
  }
}

const styles = StyleSheet.create({
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
    paddingHorizontal: VARIABLES.PADDING_SMALL,
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
  },
});
