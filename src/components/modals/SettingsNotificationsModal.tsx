import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  NavigationContainerProps,
  SafeAreaView,
  ScrollView,
  NavigationEvents,
} from 'react-navigation';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { EHeaderTheme, Header } from '../common/Header';
import { GLOBAL_STYLES } from '../../common/styles';
import { localeManager } from '../../managers/LocaleManager';
import firebase from 'react-native-firebase';
import { Notification } from 'react-native-firebase/notifications';
import { firebaseManager } from '../../managers/FirebaseManager';

interface IState {
  notifications: Notification[];
}

export class SettingsNotificationsModal extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    notifications: [],
  };

  async componentDidMount() {
    const notifications = await firebase.notifications().getScheduledNotifications();

    this.setState({
      notifications,
    });
  }

  render() {
    return (
      <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <NavigationEvents
          onDidFocus={() => {
            firebaseManager.loadAds();
          }}
        />
        <View style={styles.contentContainer}>
          <Header
            title={localeManager.t('COMMON.BACK')}
            next={{
              title: 'Clear',
              action: () => {
                firebase.notifications().removeAllDeliveredNotifications();
              },
            }}
            theme={EHeaderTheme.Dark}
          />

          <ScrollView>
            <View style={styles.content}>
              {this.state.notifications.map(notification => {
                return (
                  <View
                    style={{
                      paddingVertical: 10,
                    }}
                  >
                    <Text>{notification.notificationId}</Text>
                    <Text>{notification.body}</Text>
                    <Text>{JSON.stringify(notification.data)}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
  },

  contentContainer: {
    position: 'relative',
    flex: 1,
  },

  content: {
    paddingLeft: VARIABLES.PADDING_BIG,
    paddingRight: VARIABLES.PADDING_BIG,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
