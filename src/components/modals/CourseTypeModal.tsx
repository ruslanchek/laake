import React from 'react';
import { Animated, Dimensions, StyleSheet, View, Text } from 'react-native';
import {
  NavigationContainerProps,
  SafeAreaView,
  ScrollView,
  NavigationEvents,
} from 'react-navigation';
import { IPill, PILLS } from '../../common/pills';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { EHeaderTheme, Header } from '../common/Header';
import { followStore } from 'react-stores';
import { createCourseStore } from '../../stores/createCourseStore';
import { CommonService } from '../../services/CommonService';
import { GLOBAL_STYLES } from '../../common/styles';
import { localeManager } from '../../managers/LocaleManager';
import { firebaseManager } from '../../managers/FirebaseManager';
import { ENotificationType, NotificationsHandler } from '../common/Notifications';
import { EFormButtonTheme, FormButton } from '../ui/FormButton';
import { ICONS } from '../../common/icons';
import { ModalHeader } from '../blocks/ModalHeader';
import Permissions from 'react-native-permissions';
import { PillBrick } from '../ui/PillBrick';
import ImagePicker, { Image } from 'react-native-image-crop-picker';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import { Progress } from '../ui/Progress';
import { FONTS } from '../../common/fonts';
import { Appear, EAppearType } from '../common/Appear';
import { courseManager } from '../../managers/CourseManager';
import { courseStore } from '../../stores/courseStore';
import { AdBanner } from '../ui/AdBanner';

interface IState {
  scrollTop: Animated.Value;
  customImageSource: string | null;
  uploading: boolean;
  uploadingPercent: number;
  loading: boolean;
}

@followStore(createCourseStore)
@followStore(courseStore)
export class CourseTypeModal extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    scrollTop: new Animated.Value(0),
    customImageSource: createCourseStore.state.uploadedImage,
    uploading: false,
    uploadingPercent: 0,
    loading: false,
  };

  uploadCancelHandler: () => void = () => {};

  async componentDidMount() {
    this.setState({
      loading: true,
    });

    await courseManager.getCourseImages();

    this.setState({
      loading: false,
    });
  }

  render() {
    const sizeThird = Dimensions.get('window').width / 3 - VARIABLES.PADDING_BIG * 1.33;
    const { scrollTop, customImageSource } = this.state;
    const customImages = Array.from(courseStore.state.courseImages.values());
    const totalCount = PILLS.length + customImages.length;
    let needEqualifierCell = false;

    if (totalCount % 3 !== 0) {
      needEqualifierCell = true;
    }

    return (
      <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <NavigationEvents
          onDidFocus={() => {
            firebaseManager.loadAds();
          }}
        />
        <View style={styles.contentContainer}>
          <CustomStatusBar barStyle='dark-content' />
          <Header title={localeManager.t('COMMON.BACK')} next={null} theme={EHeaderTheme.Dark} />

          {this.state.uploading && (
            <Appear type={EAppearType.Fade} show={true} customStyles={styles.uploadContainer}>
              <Appear type={EAppearType.Spring} show={this.state.uploading}>
                <View style={styles.upload}>
                  <Text style={styles.uploadTitle}>
                    {localeManager.t('COURSE_TYPE_MODAL.UPLOAD_TITLE')}
                  </Text>
                  <View style={styles.uploadProgress}>
                    <Progress
                      size={100}
                      percent={this.state.uploadingPercent}
                      strokeWidth={2}
                      showPercentage={true}
                      color={COLORS.GRAY.toString()}
                    />
                  </View>
                </View>
              </Appear>
            </Appear>
          )}

          <ScrollView
            scrollEventThrottle={1}
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
                title={localeManager.t('COURSE_TYPE_MODAL.SELECT_PICTURE')}
              />
              <FormButton
                theme={EFormButtonTheme.Gray}
                isDisabled={false}
                isLoading={false}
                isSmall
                onPress={this.handleCapturePicture}
                customStyles={{ flex: 0.48 }}
                title={localeManager.t('COURSE_TYPE_MODAL.TAKE_PICTURE')}
              />
            </View>
            <View style={styles.content}>
              {customImages.map((image, i) => (
                <PillBrick
                  key={i}
                  title={localeManager.t('COURSE_TYPE_MODAL.CUSTOM_IMAGE')}
                  selected={customImageSource === image.downloadURL}
                  size={sizeThird}
                  imageSource={{
                    uri: image.downloadURL,
                  }}
                  handleSelect={this.handleSelectCustom.bind(this, image.downloadURL)}
                />
              ))}

              {PILLS.map((pill, i) => {
                return (
                  <PillBrick
                    key={i}
                    title={localeManager.t(pill.title)}
                    selected={
                      createCourseStore.state.currentPill.id === pill.id && !customImageSource
                    }
                    size={sizeThird}
                    imageSource={pill.image}
                    handleSelect={this.handleSelect.bind(this, pill)}
                  />
                );
              })}

              {needEqualifierCell && (
                <View style={[styles.dummyCell, { width: sizeThird, height: sizeThird }]} />
              )}
            </View>
          </ScrollView>
        </View>
        <AdBanner />
      </SafeAreaView>
    );
  }

  handleSelectPicture = async () => {
    let status = await Permissions.check('photo');

    if (status !== 'authorized') {
      status = await Permissions.request('photo');
    }

    if (status === 'authorized') {
      const response: Image = (await ImagePicker.openPicker({
        width: 256,
        height: 256,
        cropping: true,
        avoidEmptySpaceAroundImage: true,
        compressImageMaxWidth: 256,
        compressImageMaxHeight: 256,
        compressImageQuality: 0.9,
        cropperToolbarTitle: localeManager.t('IMAGE_CROPPING.SELECT_AREA'),
        loadingLabelText: localeManager.t('IMAGE_CROPPING.PROCESSING'),
        forceJpg: true,
        cropperChooseText: localeManager.t('IMAGE_CROPPING.CHOOSE'),
        cropperCancelText: localeManager.t('IMAGE_CROPPING.CANCEL'),
      })) as Image;

      if (response && response.path) {
        this.handleUpload(response.path);
      }
    }
  };

  handleCancelUpload = () => {
    this.setState({
      uploading: false,
    });

    this.uploadCancelHandler();
  };

  handleCapturePicture = async () => {
    let status = await Permissions.check('camera');

    if (status !== 'authorized') {
      status = await Permissions.request('camera');
    }

    if (status === 'authorized') {
      const response: Image = (await ImagePicker.openCamera({
        width: 256,
        height: 256,
        cropping: true,
        avoidEmptySpaceAroundImage: true,
        compressImageMaxWidth: 256,
        compressImageMaxHeight: 256,
        compressImageQuality: 0.9,
        cropperToolbarTitle: localeManager.t('IMAGE_CROPPING.SELECT_AREA'),
        loadingLabelText: localeManager.t('IMAGE_CROPPING.PROCESSING'),
        forceJpg: true,
        cropperChooseText: localeManager.t('IMAGE_CROPPING.CHOOSE'),
        cropperCancelText: localeManager.t('IMAGE_CROPPING.CANCEL'),
      })) as Image;

      if (response && response.path) {
        this.handleUpload(response.path);
      }
    }
  };

  async handleUpload(uri: string) {
    this.setState({
      uploading: true,
    });

    const filename: string = Date.now().toString();
    const uploadResult = await firebaseManager.uploadFile(
      filename,
      uri,
      progress => {
        this.setState({
          uploadingPercent: progress,
        });
      },
      uploadCancelHandler => {
        // this.uploadCancelHandler = uploadCancelHandler;
      },
    );

    if (uploadResult.error || !uploadResult.uri) {
      NotificationsHandler.alertWithType(
        ENotificationType.Error,
        localeManager.t('NOTIFICATIONS.UPLOAD_ERROR.TITLE'),
        localeManager.t('NOTIFICATIONS.UPLOAD_ERROR.MESSAGE'),
      );
    } else {
      createCourseStore.setState({
        uploadedImage: uploadResult.uri,
      });

      CommonService.goBackAfterSelect(this.props.navigation);
    }

    this.setState({
      uploading: false,
      uploadingPercent: 100,
    });
  }

  handleSelect(currentPill: IPill) {
    CommonService.haptic();
    createCourseStore.setState({
      currentPill,
      uploadedImage: null,
    });
    CommonService.goBackAfterSelect(this.props.navigation);
  }

  handleSelectCustom(url: string) {
    CommonService.haptic();
    createCourseStore.setState({
      uploadedImage: url,
    });
    CommonService.goBackAfterSelect(this.props.navigation);
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

  uploadContainer: {
    height: '100%',
    width: '100%',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.alpha(0.75).toString(),
    position: 'absolute',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  uploadTitle: {
    fontFamily: FONTS.BOLD,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 15,
    textAlign: 'center',
  },

  uploadProgress: {
    width: 100,
    height: 100,
    marginTop: 20,
  },

  upload: {
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
    width: 175,
    height: 175,
    backgroundColor: COLORS.WHITE.toString(),
    elevation: 1,
    shadowColor: COLORS.GRAY_PALE_LIGHT.toString(),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  uploadCancel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 15,
  },

  uploadCancelText: {
    color: COLORS.RED.toString(),
    fontFamily: FONTS.BOLD,
    textAlign: 'center',
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

  dummyCell: {},
});
