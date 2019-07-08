import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
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
import { firebaseManager, channel } from '../../managers/FirebaseManager';
import { FormButton, EFormButtonTheme } from '../ui/FormButton';

interface IState {
  notifications: Notification[];
}

export class SettingsNotificationsModal extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    notifications: [],
  };

  componentDidMount() {
    this.getNotifications();
    this.checkPermission();
  }

  async checkPermission() {
    let enabled = await firebase.messaging().hasPermission();

    console.log('laakelog', enabled);
  }

  async getNotifications() {
    const notifications = await firebase.notifications().getScheduledNotifications();

    console.log('laakelog', notifications);

    this.setState({
      notifications,
    });
  }

  generateNotification() {
    const id = Math.random().toString();
    const notification = new firebase.notifications.Notification()
      .setNotificationId(id)
      .setTitle(id)
      .setBody(id)
      .setSound('default');

    if (Platform.OS === 'android' && channel) {
      notification.android.priority = firebase.notifications.Android.Priority.High;
      notification.android.setChannelId(channel.channelId);
    }

    firebase.notifications().scheduleNotification(notification, {
      fireDate: Date.now() + 10000,
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

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: VARIABLES.PADDING_MEDIUM,
            }}
          >
            <FormButton
              customStyles={{
                flex: 0.48,
              }}
              title='Generate'
              theme={EFormButtonTheme.Blue}
              isDisabled={false}
              isLoading={false}
              onPress={() => {
                this.generateNotification();
              }}
            />
            <FormButton
              customStyles={{
                flex: 0.48,
              }}
              title='Refresh'
              theme={EFormButtonTheme.Gray}
              isDisabled={false}
              isLoading={false}
              onPress={() => {
                this.getNotifications();
              }}
            />
          </View>

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

const styles: { [key: string]: any } = StyleSheet.create({
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
