import React from 'react';
import { NavigationContainerProps, SafeAreaView, NavigationEvents } from 'react-navigation';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Image,
  Animated,
  TouchableHighlight,
} from 'react-native';
import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Header, EHeaderTheme } from '../common/Header';
import { GLOBAL_STYLES } from '../../common/styles';
import { COLORS } from '../../common/colors';
import { BGS } from '../../common/bgs';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';
import { Appear, EAppearType } from '../common/Appear';

const items = Platform.select({
  ios: ['laakeproannual', 'laakepromonth'],
  android: ['com.fyramedia.laakeproannual', 'com.fyramedia.laakepromonth'],
});

interface IState {
  logoAnimation: Animated.Value;
  wavesAnimation: Animated.Value;
  animationTrigger: boolean;
}

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
  state: IState = {
    logoAnimation: new Animated.Value(0),
    wavesAnimation: new Animated.Value(0),
    animationTrigger: false,
  };

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
    const { logoAnimation, wavesAnimation, animationTrigger } = this.state;

    return (
      <ImageBackground source={BGS.DEEP_PURPLE} style={styles.container}>
        <NavigationEvents
          onDidBlur={this.handleNavigationBLur}
          onDidFocus={this.handleNavigationFocus}
        />
        <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
          <View style={styles.logoHolder}>
            <Animated.View
              style={{
                opacity: wavesAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
              }}
            >
              <Image source={BGS.WAVES} style={styles.waves} />
            </Animated.View>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: logoAnimation,
                  transform: [
                    {
                      scale: logoAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1.05, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image source={BGS.LOGO} style={styles.logo} />
            </Animated.View>
          </View>
          <Appear show={animationTrigger} type={EAppearType.Drop} delay={400}>
            <Text style={styles.title}>Subscribe to get more from Läke Pro</Text>
            <Text style={styles.textPart}>– Get notified by reminders</Text>
            <Text style={styles.textPart}>– Mediction avatars by photo them</Text>
            <Text style={styles.textPart}>– Medication package text</Text>
            <Text style={styles.textPart}>– Backup your courses in Läke Cloud</Text>
          </Appear>

          <Appear
            show={animationTrigger}
            type={EAppearType.Drop}
            delay={450}
            customStyles={styles.buttons}
          >
            <TouchableHighlight
              underlayColor={COLORS.BLUE.lighten(0.1).toString()}
              style={styles.button}
              onPress={this.handlePurchase}
            >
              <>
                <Text style={styles.buttonText}>Month</Text>
                <View style={styles.buttonPrice}>
                  <Text style={styles.buttonPriceText}>£4.49</Text>
                </View>
              </>
            </TouchableHighlight>

            <TouchableHighlight
              underlayColor={COLORS.BLUE.lighten(0.1).toString()}
              style={styles.button}
              onPress={this.handlePurchase}
            >
              <>
                <Text style={styles.buttonText}>Year</Text>
                <View style={styles.buttonPrice}>
                  <Text style={styles.buttonPriceText}>£44.49</Text>
                </View>
              </>
            </TouchableHighlight>
          </Appear>

          <Appear show={animationTrigger} type={EAppearType.Drop} delay={500}>
            <TouchableOpacity style={styles.restore} onPress={this.handleRestorePurchases}>
              <Text style={styles.restoreText}>Restore purchases</Text>
            </TouchableOpacity>
          </Appear>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  handlePurchase = () => {};

  handleRestorePurchases = () => {};

  handleNavigationBLur = () => {
    this.state.logoAnimation.setValue(0);
    this.state.wavesAnimation.setValue(0);

    this.setState({
      animationTrigger: false,
    });
  };

  handleNavigationFocus = () => {
    Animated.timing(this.state.logoAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(this.state.wavesAnimation, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start();

    this.setState({
      animationTrigger: true,
    });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },

  waves: { width: 380, height: 380 },

  logoHolder: {
    width: 380,
    height: 380,
    alignItems: 'center',
  },

  bg: { width: '100%', height: '100%' },

  logo: {
    width: 134,
    height: 193,
  },

  logoContainer: {
    position: 'absolute',
    width: 134,
    height: 193,
    top: 123,
  },

  title: {
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.BOLD,
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    textAlign: 'center',
    marginBottom: VARIABLES.PADDING_MEDIUM,
  },

  textPart: {
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  restore: {
    marginTop: VARIABLES.PADDING_BIG * 2,
  },

  restoreText: {
    color: COLORS.WHITE.alpha(0.5).toString(),
    fontFamily: FONTS.BOLD,
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    textAlign: 'center',
  },

  buttons: {
    marginTop: VARIABLES.PADDING_BIG * 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    backgroundColor: COLORS.BLUE.toString(),
    height: VARIABLES.BUTTON_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
    paddingHorizontal: VARIABLES.PADDING_BIG,
    marginHorizontal: VARIABLES.PADDING_MEDIUM,
  },

  buttonText: {
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.BOLD,
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
  },

  buttonPrice: {
    backgroundColor: COLORS.BLACK.alpha(0.15).toString(),
    paddingVertical: 1,
    paddingHorizontal: VARIABLES.PADDING_SMALL,
    borderRadius: 5,
    marginLeft: VARIABLES.PADDING_SMALL,
  },

  buttonPriceText: {
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.BOLD,
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
  },
});
