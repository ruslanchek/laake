import React from 'react';
import { NavigationContainerProps, NavigationEvents, ScrollView } from 'react-navigation';
import { StyleSheet, SafeAreaView, View, Text, Animated } from 'react-native';
import { Title } from '../ui/Title';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import firebase from 'react-native-firebase';
import { Notification } from 'react-native-firebase/notifications';
import { SummaryItem } from '../ui/SummaryItem';
import { Progress } from '../ui/Progress';
import { FONTS } from '../../common/fonts';
import { Label } from '../ui/Label';

interface IState {}

export class SettingsScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {};

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <CustomStatusBar barStyle='dark-content' />
        <NavigationEvents
          onDidFocus={async () => {
            const notifications = await firebase.notifications().getScheduledNotifications();

            this.setState({
              notifications,
            });
          }}
        />

        <ScrollView style={styles.scroll}>
          <Title
            color={COLORS.BLACK.toString()}
            text='Settings'
            backgroundColor={COLORS.GRAY_ULTRA_LIGHT.toString()}
          />
        </ScrollView>
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
    flex: 1,
  },

  scroll: {
    width: '100%',
  },
});
