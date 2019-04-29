import React from 'react';
import { NavigationContainerProps } from 'react-navigation';
import { StyleSheet, View, Text } from 'react-native';
import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { ScrollView } from 'react-native-gesture-handler';

const items = Platform.select({
  ios: ['com.fyramedia.laakepromonthly'],
  android: ['com.fyramedia.laakepromonthly'],
});

interface IState {
  log: any;
}

export class PurchaseScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    log: null,
  };

  componentDidMount() {
    RNIap.prepare();
    RNIap.getProducts(items)
      .then(products => {
        this.setState({
          log: products,
        });
      })
      .catch(error => {
        this.setState({
          log: error.message,
        });
      });
  }

  render() {
    return (
      <ScrollView>
        <View style={{ height: 100 }} />
        <Text>{JSON.stringify(this.state.log)}</Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({});
