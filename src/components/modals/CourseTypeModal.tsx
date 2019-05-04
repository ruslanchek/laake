import React from 'react';
import { Animated, Dimensions, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainerProps, SafeAreaView, ScrollView } from 'react-navigation';
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

interface IState {
  scrollTop: Animated.Value;
  customImageSource: string | null;
}

@followStore(createCourseStore)
export class CourseTypeModal extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    scrollTop: new Animated.Value(0),
    customImageSource: createCourseStore.state.uploadedImage,
  };

  render() {
    const sizeThird = Dimensions.get('window').width / 3 - VARIABLES.PADDING_BIG * 1.33;
    const { scrollTop, customImageSource } = this.state;

    return (
      <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <StatusBar
          animated={true}
          backgroundColor={COLORS.WHITE.toString()}
          barStyle='dark-content'
        />
        <Header title={localeManager.t('COMMON.BACK')} next={null} theme={EHeaderTheme.Dark} />
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
            {customImageSource && (
              <PillBrick
                title={localeManager.t('COURSE_TYPE_MODAL.CUSTOM_IMAGE')}
                selected={true}
                size={sizeThird}
                imageSource={{
                  uri: customImageSource,
                }}
                handleSelect={this.handleSelectCustom.bind(this)}
              />
            )}

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
          </View>
        </ScrollView>
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
    const filename: string = Date.now().toString();
    const uploadResult = await firebaseManager.uploadFile(filename, uri);

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
  }

  handleSelect(currentPill: IPill) {
    CommonService.haptic();
    createCourseStore.setState({
      currentPill,
      uploadedImage: null,
    });
    CommonService.goBackAfterSelect(this.props.navigation);
  }

  handleSelectCustom() {
    CommonService.haptic();
    createCourseStore.setState({
      uploadedImage: this.state.customImageSource,
    });
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
});
