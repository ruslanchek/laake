import React from 'react';
import { NavigationContainerProps, SafeAreaView } from 'react-navigation';
import { StyleSheet, View, Text, ImageBackground, Image } from 'react-native';
import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { ScrollView } from 'react-native-gesture-handler';
import { Header, EHeaderTheme } from '../common/Header';
import { GLOBAL_STYLES } from '../../common/styles';
import { COLORS } from '../../common/colors';
import { BGS } from '../../common/bgs';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';

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
      <ImageBackground source={BGS.DEEP_PURPLE} style={{ width: '100%', height: '100%' }}>
        <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
          <View style={{ width: 380, height: 380, alignItems: 'center' }}>
            <Image source={BGS.WAVES} style={{ width: 380, height: 380 }} />
            <Image
              source={BGS.LOGO}
              style={{
                position: 'absolute',
                width: 134,
                height: 193,
                top: 123,
              }}
            />
          </View>
          <View>
            <Text
              style={{
                color: COLORS.WHITE.toString(),
                fontFamily: FONTS.BOLD,
                fontSize: VARIABLES.FONT_SIZE_REGULAR,
                textAlign: 'center',
                marginBottom: VARIABLES.PADDING_MEDIUM,
              }}
            >
              Subscribe to get more from Läke
            </Text>

            <Text
              style={{
                color: COLORS.WHITE.toString(),
                fontFamily: FONTS.MEDIUM,
              }}
            >
              – Get notified by reminders
            </Text>

            <Text
              style={{
                color: COLORS.WHITE.toString(),
                fontFamily: FONTS.MEDIUM,
              }}
            >
              – Mediction avatars by photo them
            </Text>

            <Text
              style={{
                color: COLORS.WHITE.toString(),
                fontFamily: FONTS.MEDIUM,
              }}
            >
              – Medication package text
            </Text>
            <Text
              style={{
                color: COLORS.WHITE.toString(),
                fontFamily: FONTS.MEDIUM,
              }}
            >
              – Backup your courses in Läke Cloud
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});
