import React from 'react';
import { NavigationContainerProps } from 'react-navigation';
import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';

interface IState {}

export class LogScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {};

  render() {
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
