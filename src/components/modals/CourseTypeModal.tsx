import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationContainerProps, SafeAreaView, ScrollView } from 'react-navigation';
import { IPill, PILLS } from '../../common/pills';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { EHeaderTheme, Header } from '../common/Header';
import { followStore } from 'react-stores';
import { createCourseStore } from '../../stores/createCourseStore';
import ImagePicker from 'react-native-image-picker';
import { CommonService } from '../../services/CommonService';
import { createCourseManager } from '../../managers/CreateCourseManager';
import { GLOBAL_STYLES } from '../../common/styles';
import { localeManager } from '../../managers/LocaleManager';
import { firebaseManager } from '../../managers/FirebaseManager';
import { ENotificationType, NotificationsHandler } from '../common/Notifications';
import { FONTS } from '../../common/fonts';
import { EFormButtonTheme, FormButton } from '../ui/FormButton';
import { ICONS } from '../../common/icons';
import { ModalHeader } from '../blocks/ModalHeader';

interface IState {
  scrollTop: Animated.Value;
}

@followStore(createCourseStore)
export class CourseTypeModal extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    scrollTop: new Animated.Value(0),
  };

  render() {
    const sizeThird = Dimensions.get('window').width / 3 - VARIABLES.PADDING_BIG * 1.33;
    const { scrollTop } = this.state;

    return (
      <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <StatusBar
          animated={true}
          backgroundColor={COLORS.WHITE.toString()}
          barStyle='dark-content'
        />
        <Header title={localeManager.t('COMMON.BACK')} next={null} theme={EHeaderTheme.Dark} />
        <ScrollView
          scrollEventThrottle={8}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollTop } } }])}
        >
          <ModalHeader
            scrollTop={scrollTop}
            icon={ICONS.PILL}
            title={localeManager.t('COURSE_TYPE_MODAL.HEADER')}
            description={localeManager.t('COURSE_TYPE_MODAL.DESCRIPTION')}
          />
          <View style={styles.buttons}>
            <FormButton
              theme={EFormButtonTheme.Gray}
              isDisabled={false}
              isLoading={false}
              isSmall
              onPress={this.handleSelectPicture}
              customStyles={{ flex: 0.48 }}
            >
              {localeManager.t('COURSE_TYPE_MODAL.SELECT_PICTURE')}
            </FormButton>
            <FormButton
              theme={EFormButtonTheme.Gray}
              isDisabled={false}
              isLoading={false}
              isSmall
              onPress={this.handleCapturePicture}
              customStyles={{ flex: 0.48 }}
            >
              {localeManager.t('COURSE_TYPE_MODAL.TAKE_PICTURE')}
            </FormButton>
          </View>
          <View style={styles.content}>
            {PILLS.map((pill, i) => {
              return (
                <TouchableOpacity
                  onPress={this.handleSelect.bind(this, pill)}
                  key={i}
                  style={{ width: sizeThird }}
                >
                  <View style={[styles.pillInner, { width: sizeThird, height: sizeThird }]}>
                    {createCourseStore.state.currentPill.id === pill.id && (
                      <View style={styles.selected} />
                    )}

                    <Image
                      style={[styles.pillImage, { width: sizeThird, height: sizeThird }]}
                      resizeMode='contain'
                      source={pill.image}
                    />

                    <View style={styles.subTitle}>
                      <Text
                        style={[
                          styles.subTitleText,
                          createCourseStore.state.currentPill.id === pill.id
                            ? styles.subTitleTextSelected
                            : null,
                        ]}
                      >
                        {localeManager.t(pill.title)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  handleSelectPicture = async () => {
    // const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    // if (status === 'granted') {
    //   ImagePicker.showImagePicker(options, response => {
    //     console.log('Response = ', response);
    //     if (response.didCancel) {
    //       console.log('User cancelled image picker');
    //     } else if (response.error) {
    //       console.log('ImagePicker Error: ', response.error);
    //     } else if (response.customButton) {
    //       console.log('User tapped custom button: ', response.customButton);
    //     } else {
    //       const source = { uri: response.uri };
    //       // You can also display the image using data:
    //       // const source = { uri: 'data:image/jpeg;base64,' + response.data };
    //       this.setState({
    //         avatarSource: source,
    //       });
    //     }
    //   });
    //   const result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: 'Images',
    //     allowsEditing: true,
    //     aspect: [1, 1],
    //     quality: 1,
    //     exif: false,
    //   });
    //   if (!result.cancelled && result.uri) {
    //     this.handleUpload(result.uri);
    //   }
    // }
  };

  handleCapturePicture = async () => {
    // const { status } = await Permissions.askAsync(Permissions.CAMERA);
    // if (status === 'granted') {
    //   const result = await ImagePicker.launchCameraAsync({
    //     allowsEditing: true,
    //     aspect: [1, 1],
    //     quality: 1,
    //     exif: false,
    //   });
    //   if (!result.cancelled && result.uri) {
    //     this.handleUpload(result.uri);
    //   }
    // }
  };

  async handleUpload(uri: string) {
    const uploadResult = await firebaseManager.uploadFile(Date.now().toString(), uri);

    if (!uploadResult.error) {
      CommonService.goBackAfterSelect(this.props.navigation);
    } else {
      NotificationsHandler.alertWithType(
        ENotificationType.Error,
        localeManager.t('NOTIFICATIONS.UPLOAD_ERROR.TITLE'),
        localeManager.t('NOTIFICATIONS.UPLOAD_ERROR.MESSAGE'),
      );
    }
  }

  handleSelect(pill: IPill) {
    CommonService.haptic();
    createCourseManager.selectCurrentPill(pill);
    CommonService.goBackAfterSelect(this.props.navigation);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: VARIABLES.PADDING_BIG,
    paddingRight: VARIABLES.PADDING_BIG,
    marginBottom: VARIABLES.PADDING_BIG * 1.5,
  },

  content: {
    paddingLeft: VARIABLES.PADDING_BIG,
    paddingRight: VARIABLES.PADDING_BIG,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  selectedImage: {
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
  },

  subTitle: {
    paddingHorizontal: 5,
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
    backgroundColor: COLORS.WHITE.alpha(0.8).toString(),
    position: 'absolute',
    bottom: 5,
  },

  subTitleText: {
    fontSize: VARIABLES.FONT_SIZE_TINY,
    color: COLORS.GRAY.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  subTitleTextSelected: {
    color: COLORS.GRAY.toString(),
  },

  title: {
    color: COLORS.GRAY.toString(),
    fontSize: VARIABLES.FONT_SIZE_TINY,
  },

  customButton: {
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
    marginBottom: VARIABLES.PADDING_SMALL,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: VARIABLES.INPUT_HEIGHT,
  },

  customButtonText: {
    marginLeft: 10,
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    color: COLORS.BLACK.toString(),
  },

  pillInner: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
    marginBottom: VARIABLES.PADDING_MEDIUM,
    backgroundColor: COLORS.WHITE.toString(),
    elevation: 1,
    shadowColor: COLORS.GRAY_PALE_LIGHT.toString(),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
  },

  checkMarkIcon: {
    top: -2,
    left: 0,
  },

  selected: {
    borderWidth: 2,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
    borderColor: COLORS.GRAY_LIGHT.toString(),
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
  },

  add: {
    width: 75,
    height: 75,
    borderRadius: 50,
    backgroundColor: COLORS.GRAY.alpha(0.1).toString(),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },

  addIcon: {
    top: 2,
  },

  pillImage: {
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
  },
});
