import React from 'react';
import { NavigationContainerProps } from 'react-navigation';
import { StyleSheet, View, Text } from 'react-native';
import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { ScrollView } from 'react-native-gesture-handler';
import firebase from 'react-native-firebase';
import { Notification } from 'react-native-firebase/notifications';

const items = Platform.select({
  ios: ['com.fyramedia.laakepromonthly'],
  android: ['com.fyramedia.laakepromonthly'],
});

interface IState {
  log: any;
  notifications: Notification[];
}

export class PurchaseScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    log: null,
    notifications: [],
  };

  async componentDidMount() {
    // RNIap.prepare();
    // RNIap.getProducts(items)
    //   .then(products => {
    //     this.setState({
    //       log: products,
    //     });
    //   })
    //   .catch(error => {
    //     this.setState({
    //       log: error.message,
    //     });
    //   });

    const notifications = await firebase.notifications().getScheduledNotifications();

    console.log('notifications', notifications);

    this.setState({
      notifications,
    });
  }

  render() {
    return (
      <ScrollView>
        <View style={{ height: 50 }} />

        {this.state.notifications.map(n => {
          return (
            <View style={{ padding: 10 }}>
              <Text>{n.notificationId}</Text>
              <Text>{n.title}</Text>
              <Text>{n.body}</Text>
            </View>
          );
        })}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({});
