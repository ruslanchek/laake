import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationEvents } from 'react-navigation';

export interface IProps {
  barStyle: 'light-content' | 'dark-content';
  color: string;
  translucent?: boolean;
}

export class CustomStatusBar extends React.PureComponent<IProps> {
  render() {
    const { barStyle, color, translucent } = this.props;

    return (
      <NavigationEvents
        onWillFocus={() => {
          if (Platform.OS === 'ios') {
            StatusBar.setBarStyle(barStyle, true);
          } else {
            StatusBar.setBarStyle(barStyle, false);
            StatusBar.setBackgroundColor(color, false);
            StatusBar.setTranslucent(translucent ? true : false);
          }
        }}
      />
    );
  }
}
