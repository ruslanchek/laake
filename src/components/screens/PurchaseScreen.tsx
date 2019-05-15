import React from 'react';
import { NavigationContainerProps, SafeAreaView, ScrollView } from 'react-navigation';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Image,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { GLOBAL_STYLES } from '../../common/styles';
import { COLORS } from '../../common/colors';
import { BGS } from '../../common/bgs';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';
import { Appear, EAppearType } from '../common/Appear';
import { firebaseManager } from '../../managers/FirebaseManager';
import { CommonService } from '../../services/CommonService';
import { FormButton, EFormButtonTheme } from '../ui/FormButton';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import { localeManager } from '../../managers/LocaleManager';

enum ESKU {
  Month = 'laakepromonth',
  Annual = 'laakeproannual',
}

const items = Platform.select({
  ios: [ESKU.Month, ESKU.Annual],
  android: [ESKU.Month, ESKU.Annual],
});

interface IState {
  logoAnimation: Animated.Value;
  wavesAnimation: Animated.Value;
  animationTrigger: boolean;
  subscriptions: RNIap.Subscription<any>[];
  loading: boolean;
  processingProduct: ESKU | null;
}

export class PurchaseScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    logoAnimation: new Animated.Value(0),
    wavesAnimation: new Animated.Value(0),
    animationTrigger: false,
    subscriptions: [],
    loading: true,
    processingProduct: null,
  };

  async componentDidMount() {
    RNIap.initConnection();

    try {
      const subscriptions = await RNIap.getSubscriptions(items);

      subscriptions.sort((a, b) => {
        return parseFloat(a.price) - parseFloat(b.price);
      });

      this.setState({
        subscriptions,
        loading: false,
      });

      this.startAnimations();
    } catch (e) {
      firebaseManager.logError(293837, e);
    }
  }

  componentWillUnmount() {
    RNIap.endConnection();
  }

  render() {
    const {
      logoAnimation,
      wavesAnimation,
      animationTrigger,
      loading,
      subscriptions,
      processingProduct,
    } = this.state;

    return (
      <ImageBackground source={BGS.DEEP_PURPLE} style={styles.container}>
        <CustomStatusBar barStyle='light-content' />
        <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
          {loading ? (
            <ActivityIndicator color={COLORS.WHITE.toString()} size='large' />
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollViewContainer}
              style={styles.scrollView}
              horizontal={false}
            >
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

              <Appear
                customStyles={styles.texts}
                show={animationTrigger}
                type={EAppearType.Drop}
                delay={400}
              >
                <Text style={styles.title}>Subscribe to get more from Läke Pro</Text>

                <View style={styles.textPartsHolder}>
                  <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_1')}</Text>
                  <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_2')}</Text>
                  <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_3')}</Text>
                  <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_4')}</Text>
                  <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_5')}</Text>
                  <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_6')}</Text>
                </View>
              </Appear>

              <Appear
                show={animationTrigger}
                type={EAppearType.Drop}
                delay={450}
                customStyles={styles.buttons}
              >
                {subscriptions.map(product => {
                  switch (product.productId) {
                    case ESKU.Month: {
                      return (
                        <FormButton
                          customStyles={styles.button}
                          theme={EFormButtonTheme.Blue}
                          isDisabled={processingProduct === ESKU.Annual}
                          isLoading={processingProduct === ESKU.Month}
                          onPress={this.handlePurchase.bind(this, ESKU.Month)}
                        >
                          <Text style={styles.buttonText}>
                            {localeManager.t('SUBSCRIPTION.MONTHLY')}
                          </Text>
                          <View style={styles.buttonPrice}>
                            <Text style={styles.buttonPriceText}>{product.localizedPrice}</Text>
                          </View>
                        </FormButton>
                      );
                    }

                    case ESKU.Annual: {
                      return (
                        <FormButton
                          customStyles={styles.button}
                          theme={EFormButtonTheme.Purple}
                          isDisabled={processingProduct === ESKU.Month}
                          isLoading={processingProduct === ESKU.Annual}
                          onPress={this.handlePurchase.bind(this, ESKU.Annual)}
                        >
                          <Text style={styles.buttonText}>
                            {localeManager.t('SUBSCRIPTION.ANNUAL')}
                          </Text>
                          <View style={styles.buttonPrice}>
                            <Text style={styles.buttonPriceText}>{product.localizedPrice}</Text>
                          </View>
                        </FormButton>
                      );
                    }
                  }
                })}
              </Appear>

              <Appear show={animationTrigger} type={EAppearType.Drop} delay={500}>
                <TouchableOpacity style={styles.restore} onPress={this.handleRestorePurchases}>
                  <Text style={styles.restoreText}>
                    {localeManager.t('SUBSCRIPTION.RESTORE_PURCHASES')}
                  </Text>
                </TouchableOpacity>
              </Appear>
            </ScrollView>
          )}
        </SafeAreaView>
      </ImageBackground>
    );
  }

  startAnimations() {
    Animated.timing(this.state.logoAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(this.state.wavesAnimation, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start();

    this.setState({
      animationTrigger: true,
    });
  }

  async handlePurchase(sku: ESKU) {
    if (!this.state.processingProduct) {
      CommonService.haptic();

      this.setState({
        processingProduct: sku,
      });

      try {
        const result = await RNIap.buySubscription(sku);

        Alert.alert(JSON.stringify(result));
      } catch (e) {
        firebaseManager.logError(421335, e);
        Alert.alert(e.message);
      }

      this.setState({
        processingProduct: null,
      });
    }
  }

  handleRestorePurchases = async () => {
    CommonService.haptic();

    try {
      const purchases = await RNIap.getAvailablePurchases();
      const restoredTitles: string[] = [];

      purchases.forEach(purchase => {
        if (purchase.productId === ESKU.Annual) {
          restoredTitles.push('Annual');
        } else if (purchase.productId === ESKU.Month) {
          restoredTitles.push('Month');
        }
      });

      Alert.alert(
        'Restore Successful',
        'You successfully restored the following purchases: ' + restoredTitles.join(', '),
      );
    } catch (e) {
      Alert.alert(e.message);
    }
  };
}

const LOGO_HOLDER_SIZE = 320;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  scrollView: {
    width: '100%',
  },

  scrollViewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  waves: {
    width: LOGO_HOLDER_SIZE,
    height: LOGO_HOLDER_SIZE,
  },

  logoHolder: {
    width: LOGO_HOLDER_SIZE,
    height: LOGO_HOLDER_SIZE,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
  },

  bg: { width: '100%', height: '100%' },

  logo: {
    width: LOGO_HOLDER_SIZE * 0.34,
    height: LOGO_HOLDER_SIZE * 0.49,
  },

  logoContainer: {
    position: 'absolute',
    width: LOGO_HOLDER_SIZE * 0.34,
    height: LOGO_HOLDER_SIZE * 0.49,
    top: 104,
  },

  texts: {
    paddingHorizontal: VARIABLES.PADDING_BIG,
    marginTop: LOGO_HOLDER_SIZE,
  },

  title: {
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.BOLD,
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    textAlign: 'center',
    marginBottom: VARIABLES.PADDING_MEDIUM,
  },

  textPartsHolder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  textPart: {
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.MEDIUM,
    marginBottom: 3,
  },

  restore: {
    marginVertical: VARIABLES.PADDING_BIG * 2,
  },

  restoreText: {
    color: COLORS.WHITE.alpha(0.5).toString(),
    fontFamily: FONTS.BOLD,
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    textAlign: 'center',
  },

  buttons: {
    marginTop: VARIABLES.PADDING_BIG * 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    marginHorizontal: VARIABLES.PADDING_MEDIUM,
    width: '42%',
  },

  buttonBlue: {
    backgroundColor: COLORS.BLUE.toString(),
  },

  buttonPurple: {
    backgroundColor: COLORS.PURPLE.toString(),
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
