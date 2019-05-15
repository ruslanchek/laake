import React from 'react';
import { NavigationContainerProps, NavigationEvents } from 'react-navigation';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { Title } from '../ui/Title';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { CustomStatusBar } from '../ui/CustomStatusBar';

interface IState {}

export class SummaryScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {};

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <CustomStatusBar barStyle='dark-content' />
        <NavigationEvents
          onDidFocus={() => {
            this.forceUpdate();
          }}
        />
        <Title color={COLORS.BLACK.toString()} text='Summary' />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  content: {
    paddingVertical: VARIABLES.PADDING_BIG,
    paddingHorizontal: VARIABLES.PADDING_BIG,
  },
});
