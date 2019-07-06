import React from 'react';
import DropdownAlert from 'react-native-dropdownalert';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { StyleSheet, Text } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { FONTS } from '../../common/fonts';

export enum ENotificationType {
  Error = 'error',
  Info = 'info',
}

export class Notifications extends React.PureComponent {
  dropDown: DropdownAlert | null = null;

  componentDidMount() {
    NotificationsHandler.setDropDown(this.dropDown);
  }

  render() {
    return (
      <DropdownAlert
        useNativeDriver={true}
        updateStatusBar={false}
        errorColor={COLORS.RED.toString()}
        infoColor={COLORS.GRAY_ULTRA_LIGHT.toString()}
        successColor={COLORS.GREEN.toString()}
        imageSrc={undefined}
        sensitivity={100}
        renderTitle={(props, state: any) => {
          switch (state.type) {
            case 'error': {
              return <Text style={[styles.titleStyle, styles.titleStyleError]}>{state.title}</Text>;
            }

            default: {
              return <Text style={[styles.titleStyle, styles.titleStyleInfo]}>{state.title}</Text>;
            }
          }
        }}
        renderMessage={(props, state: any) => {
          switch (state.type) {
            case 'error': {
              return (
                <Text style={[styles.messageStyle, styles.messageStyleError]}>{state.message}</Text>
              );
            }

            default: {
              return (
                <Text style={[styles.messageStyle, styles.messageStyleInfo]}>{state.message}</Text>
              );
            }
          }
        }}
        renderImage={(props, state) => {
          return null;
        }}
        defaultContainer={styles.defaultContainer}
        ref={(ref: DropdownAlert) => (this.dropDown = ref)}
      />
    );
  }
}

export class NotificationsHandler {
  static dropDown: DropdownAlert | null = null;

  static setDropDown(dropDown: DropdownAlert | null) {
    this.dropDown = dropDown;
  }

  static getDropDown() {
    return this.dropDown;
  }

  static alertWithType(type: ENotificationType, title: string, message: string) {
    if (this.dropDown) {
      this.dropDown.alertWithType(type, title, message);
    }
  }
}

const styles : {[key: string]: any} = StyleSheet.create({
  iconView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },

  icon: {
    top: 1,
  },

  defaultContainer: {
    marginHorizontal: VARIABLES.PADDING_BIG,
    marginTop: getStatusBarHeight() + 2,
    paddingTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
    backgroundColor: COLORS.WHITE.toString(),
    shadowColor: COLORS.GRAY.toString(),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  titleStyle: {
    fontWeight: '800',
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    marginBottom: 3,
    fontFamily: FONTS.BOLD,
  },

  titleStyleError: {
    color: COLORS.WHITE.toString(),
  },

  titleStyleInfo: {
    color: COLORS.BLACK.toString(),
  },

  messageStyle: {
    color: COLORS.WHITE.toString(),
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    fontFamily: FONTS.MEDIUM,
  },

  messageStyleError: {
    color: COLORS.WHITE.toString(),
  },

  messageStyleInfo: {
    color: COLORS.BLACK.toString(),
  },
});
