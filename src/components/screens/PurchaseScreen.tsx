import React from 'react';
import { NavigationContainerProps, SafeAreaView } from 'react-navigation';
import { StyleSheet, View, Text } from 'react-native';
import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { ScrollView } from 'react-native-gesture-handler';
import { Header, EHeaderTheme } from '../common/Header';
import { GLOBAL_STYLES } from '../../common/styles';
import { COLORS } from '../../common/colors';

const items = Platform.select({
  ios: ['laakeproannual', 'laakepromonth'],
  android: ['com.fyramedia.laakeproannual', 'com.fyramedia.laakepromonth'],
});

interface IState {}

interface IProduct {
  productId: string;
  subscriptionPeriodUnitIOS: 'MONTH' | 'YEAR';
  description: string;
  introductoryPrice: string;
  title: string;
  introductoryPriceSubscriptionPeriodIOS: string;
  introductoryPriceNumberOfPeriodsIOS: string;
  discounts: [];
  localizedPrice: string;
  introductoryPricePaymentModeIOS: string;
  price: string;
  currency: string;
  subscriptionPeriodNumberIOS: string;
}

export class PurchaseScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {};

  async componentDidMount() {
    RNIap.initConnection();
    RNIap.getProducts(items)
      .then(products => {
        console.log(products);
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <Header
          title={null}
          next={{ title: 'Restore purchases', action: () => {} }}
          theme={EHeaderTheme.Dark}
          onBack={() => {}}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE.toString(),
  },
});
