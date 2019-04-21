import React from 'react';
import DropdownAlert from 'react-native-dropdownalert';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { View, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Constants } from 'expo';

export enum ENotificationType {
  Error = 'error',
}

export class Notifications extends React.PureComponent {
  dropDown: DropdownAlert | null = null;

  componentDidMount() {
    NotificationsHandler.setDropDown(this.dropDown);
  }

  render() {
    return (
      <DropdownAlert
        updateStatusBar={false}
        errorColor={COLORS.RED.toString()}
        errorImageSrc={undefined}
        sensitivity={100}
        renderImage={() => {
          return (
            <View style={styles.iconView}>
              <Icon name='ios-arrow-back' size={32} color={COLORS.WHITE.toString()} />
            </View>
          );
        }}
        defaultContainer={styles.defaultContainer}
        titleStyle={styles.titleStyle}
        messageStyle={styles.messageStyle}
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

const styles = StyleSheet.create({
  iconView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },

  defaultContainer: {
    marginHorizontal: VARIABLES.PADDING_BIG,
    marginTop: Constants.statusBarHeight + 2,
    paddingTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
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
    color: COLORS.WHITE.alpha(0.75).toString(),
    fontWeight: '600',
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    marginBottom: 2,
  },

  messageStyle: {
    color: COLORS.WHITE.toString(),
    fontSize: VARIABLES.FONT_SIZE_SMALL,
  },
});
