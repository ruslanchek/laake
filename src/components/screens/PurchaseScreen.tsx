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
  TouchableOpacity,
} from 'react-native';
import * as RNIap from 'react-native-iap';
import { GLOBAL_STYLES } from '../../common/styles';
import { COLORS } from '../../common/colors';
import { BGS } from '../../common/bgs';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';
import { Appear, EAppearType } from '../common/Appear';
import { firebaseManager, ECollectionName } from '../../managers/FirebaseManager';
import { CommonService } from '../../services/CommonService';
import { FormButton, EFormButtonTheme } from '../ui/FormButton';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import { localeManager } from '../../managers/LocaleManager';
import { commonStore } from '../../stores/commonStore';
import { followStore } from 'react-stores';
import firebase from 'react-native-firebase';

const SKU = 'laakepronoads';

interface IState {
  logoAnimation: Animated.Value;
  wavesAnimation: Animated.Value;
  animationTrigger: boolean;
  products: RNIap.Product<any>[];
  purchases: RNIap.ProductPurchase[];
  loading: boolean;
  processingProduct: string | null;
}

@followStore(commonStore)
export class PurchaseScreen extends React.Component<NavigationContainerProps, IState> {
  static navigationOptions = {};

  state: IState = {
    logoAnimation: new Animated.Value(0),
    wavesAnimation: new Animated.Value(0),
    animationTrigger: false,
    products: [],
    purchases: [],
    loading: true,
    processingProduct: null,
  };

  async componentDidMount() {
    try {
      RNIap.initConnection();

      const products = await RNIap.getProducts([SKU]);

      this.setState({
        loading: false,
        products,
      });

      this.startAnimations();
    } catch (e) {
      firebaseManager.logError(293837, e);

      firebaseManager
        .getCollection([ECollectionName.Debug])
        .doc()
        .set({
          name: 293837,
          value: JSON.stringify(e),
        });
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
      processingProduct,
      products,
    } = this.state;

    try {
      return (
        <ImageBackground source={BGS.DEEP_RED} style={styles.container}>
          <CustomStatusBar barStyle='light-content' color={COLORS.RED.toString()} translucent />

          <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
            <View style={styles.content}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={COLORS.WHITE.toString()} size='large' />
                </View>
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
                                outputRange: [1.1, 1.0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Image source={BGS.LOGO} resizeMode='contain' style={styles.logo} />
                    </Animated.View>
                  </View>

                  <Appear
                    customStyles={styles.texts}
                    show={animationTrigger}
                    type={EAppearType.Drop}
                    delay={400}
                  >
                    <Text style={styles.title}>
                      {localeManager.t(
                        commonStore.state.isPro ? 'PRO.TITLE' : 'SUBSCRIPTION.TITLE',
                      )}
                    </Text>

                    <View style={styles.textPartsHolder}>
                      <Text style={styles.textPart}>
                        {localeManager.t(
                          commonStore.state.isPro ? 'PRO.FEATURE_1' : 'SUBSCRIPTION.FEATURE_1',
                        )}
                      </Text>
                      {/* <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_2')}</Text>
                    <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_3')}</Text>
                    <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_4')}</Text>
                    <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_5')}</Text>
                    <Text style={styles.textPart}>{localeManager.t('SUBSCRIPTION.FEATURE_6')}</Text> */}
                    </View>
                  </Appear>

                  {!commonStore.state.isPro && (
                    <Appear
                      show={animationTrigger}
                      type={EAppearType.Drop}
                      delay={450}
                      customStyles={styles.buttons}
                    >
                      <FormButton
                        customStyles={styles.button}
                        theme={EFormButtonTheme.Red}
                        isDisabled={processingProduct === SKU}
                        isLoading={processingProduct === SKU}
                        onPress={this.handlePurchase.bind(this, SKU)}
                      >
                        <Text style={styles.buttonText}>{localeManager.t('SUBSCRIPTION.PRO')}</Text>
                        <View style={styles.buttonPrice}>
                          <Text style={styles.buttonPriceText}>{products[0].localizedPrice}</Text>
                        </View>
                      </FormButton>

                      <TouchableOpacity
                        style={styles.restore}
                        onPress={this.handleRestorePurchases}
                      >
                        <Text style={styles.restoreText}>
                          {localeManager.t('SUBSCRIPTION.RESTORE_PURCHASES')}
                        </Text>
                      </TouchableOpacity>
                    </Appear>
                  )}
                </ScrollView>
              )}
            </View>
          </SafeAreaView>
        </ImageBackground>
      );
    } catch (e) {
      return <Text>{e.message}</Text>;
      firebaseManager
        .getCollection([ECollectionName.Debug])
        .doc()
        .set({
          name: 324562,
          value: JSON.stringify(e),
        });
    }
  }

  startAnimations() {
    Animated.timing(this.state.logoAnimation, {
      toValue: 1,
      duration: 1100,
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

  async handlePurchase(sku: string) {
    if (!this.state.processingProduct) {
      CommonService.haptic();

      this.setState({
        processingProduct: sku,
      });

      try {
        const result = await RNIap.buySubscription(sku);

        if (result.productId === SKU) {
          firebaseManager.setPro(true);
        }

        console.log(result);
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
      let isPro = false;

      if (purchases.length > 0) {
        purchases.forEach(purchase => {
          restoredTitles.push(purchase.productId);

          if (purchase.productId === SKU) {
            isPro = true;
          }
        });

        Alert.alert(
          localeManager.t('SUBSCRIPTION.RESTORE.TITLE'),
          localeManager.t('SUBSCRIPTION.RESTORE.DESCRIPTION', {
            titles: restoredTitles.join(', '),
          }),
        );

        firebaseManager.setPro(isPro);
      } else {
        Alert.alert(
          localeManager.t('SUBSCRIPTION.RESTORE_FAILED.TITLE'),
          localeManager.t('SUBSCRIPTION.RESTORE_FAILED.DESCRIPTION', {
            titles: restoredTitles.join(', '),
          }),
        );
      }
    } catch (e) {
      Alert.alert(e.message);
    }
  };
}

const LOGO_HOLDER_SIZE = 320;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexShrink: 0,
    width: '100%',
  },

  loadingContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },

  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollView: {
    width: '100%',
    height: '100%',
    flex: 1,
  },

  scrollViewContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  waves: {
    width: LOGO_HOLDER_SIZE,
    height: LOGO_HOLDER_SIZE,
  },

  logoHolder: {
    height: LOGO_HOLDER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexGrow: 0,
  },

  bg: {
    width: '100%',
    height: '100%',
  },

  logo: {
    width: 148,
    height: 164,
  },

  logoContainer: {
    width: 148,
    height: 164,
    position: 'absolute',
    top: 103,
  },

  texts: {
    paddingHorizontal: VARIABLES.PADDING_BIG,
    textAlign: 'center',
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
    textAlign: 'center',
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
    flexDirection: 'column',
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
