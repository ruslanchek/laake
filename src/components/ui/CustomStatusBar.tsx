import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationEvents } from 'react-navigation';

export interface IProps {
  barStyle: 'light-content' | 'dark-content';
}

export class CustomStatusBar extends React.PureComponent<IProps> {
  render() {
    const { barStyle } = this.props;

    return (
      <NavigationEvents
        onWillFocus={() => {
          StatusBar.setBarStyle(barStyle, true);
        }}
      />
    );
  }
}
