import React from 'react';
import { Alert, Image, ImageBackground, StyleSheet, Text, View, Dimensions } from 'react-native';
import { NavigationContainerProps, SafeAreaView, NavigationEvents } from 'react-navigation';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { EHeaderTheme, Header } from '../common/Header';
import { followStore } from 'react-stores';
import { createCourseStore, ECourseEditMode } from '../../stores/createCourseStore';
import { GLOBAL_STYLES } from '../../common/styles';
import { EFormButtonTheme, FormButton } from '../ui/FormButton';
import { localeManager } from '../../managers/LocaleManager';
import { ICourse } from '../../common/course';
import { PILLS, PILLS_MAP } from '../../common/pills';
import { periodTypeNames } from '../../common/periods';
import { commonStore } from '../../stores/commonStore';
import { timesPerNames } from '../../common/times';
import { ERouteName } from '../../enums/ERouteName';
import { courseManager } from '../../managers/CourseManager';
import { FONTS } from '../../common/fonts';
import { BGS } from '../../common/bgs';
import { Progress } from '../ui/Progress';
import { Appear, EAppearType } from '../common/Appear';
import { CommonService } from '../../services/CommonService';
import { CheckButton } from '../ui/CheckButton';
import { StatisticsInfoBlock } from '../ui/StatisticsInfoBlock';
import { ICONS } from '../../common/icons';
import { differenceInDays } from 'date-fns';
import { ImageWithPreload } from '../ui/ImageWithPreload';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import { firebaseManager } from '../../managers/FirebaseManager';
import { AdBanner } from '../ui/AdBanner';

interface IState {
  loading: boolean;
  deleteLoading: boolean;
  notificationsLoading: boolean;
}

const IMAGE_BORDER_RADIUS = VARIABLES.BORDER_RADIUS_BIG * 1.5;
const { height } = Dimensions.get('window');

@followStore(commonStore)
@followStore(createCourseStore)
export class CourseSummaryModal extends React.Component<
  NavigationContainerProps<{ courseEditMode: ECourseEditMode }>,
  IState
> {
  static navigationOptions = {
    header: null,
  };

  state: IState = {
    loading: false,
    deleteLoading: false,
    notificationsLoading: false,
  };

  render() {
    const { loading, deleteLoading, notificationsLoading } = this.state;
    const { currentLocale } = commonStore.state;
    const { courseEditMode } = createCourseStore.state;
    const course: ICourse = {
      uploadedImage: createCourseStore.state.uploadedImage,
      id: createCourseStore.state.currentCourseId || '',
      title: createCourseStore.state.title,
      pillId: createCourseStore.state.currentPill.id,
      periodType: createCourseStore.state.periodType,
      period: createCourseStore.state.period,
      times: createCourseStore.state.times,
      timesPer: createCourseStore.state.timesPer,
      takes: createCourseStore.state.takes,
      startDate: createCourseStore.state.startDate,
      endDate: createCourseStore.state.endDate,
      notificationsEnabled: createCourseStore.state.notificationsEnabled,
      takenPercent: createCourseStore.state.takenPercent,
      timesToTake: createCourseStore.state.timesToTake,
      timesTaken: createCourseStore.state.timesTaken,
      timesTotal: createCourseStore.state.timesTotal,
      unitsTaken: createCourseStore.state.unitsTaken,
      unitsToTake: createCourseStore.state.unitsToTake,
      unitsTotal: createCourseStore.state.unitsTotal,
    };
    const pill = PILLS_MAP.get(course.pillId) || PILLS[0];
    const periodTitle = localeManager.t(periodTypeNames.get(course.periodType) || '', {
      count: course.period,
    });
    const timesTitle = `${localeManager.t('TIMES.TIMES', {
      value: course.times.toLocaleString(currentLocale),
      count: course.times,
    })} ${localeManager.t(timesPerNames.get(course.timesPer) || '')}`;
    const unitsTotal = CommonService.formatDosageTotal(course.unitsTotal);
    const unitsTaken = CommonService.formatDosageTotal(course.unitsTaken);

    let imageSize = 75;
    let topHeight = 260;
    let titleSize = VARIABLES.FONT_SIZE_BIG;

    if (height < 700) {
      imageSize = 42;
      topHeight = 210;
      titleSize = VARIABLES.FONT_SIZE_REGULAR;
    }

    let imageBorderRadius = imageSize * 0.3;
    let imagePadding = imageSize * 0.1;

    const pillBorderRadius = imageBorderRadius * 0.68;

    return (
      <View style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <CustomStatusBar barStyle='light-content' color={COLORS.BLUE.toString()} translucent />
        <NavigationEvents
          onDidFocus={() => {
            firebaseManager.loadAds();
          }}
        />
        <SafeAreaView
          style={[
            styles.top,
            {
              height: topHeight,
            },
          ]}
        >
          <ImageBackground source={BGS.BLUE} style={{ width: '100%', height: '100%' }}>
            <Header
              title={localeManager.t(
                courseEditMode === ECourseEditMode.Create ? 'COMMON.EDIT' : 'COMMON.BACK',
              )}
              next={null}
              theme={EHeaderTheme.Light}
            />

            <View style={[styles.content, styles.contentTop]}>
              <View style={styles.heading}>
                <Appear
                  show={true}
                  delay={200}
                  type={EAppearType.Spring}
                  customStyles={[
                    styles.pillContainer,
                    {
                      borderRadius: imageBorderRadius,
                      padding: imagePadding,
                    },
                  ]}
                >
                  <ImageWithPreload
                    source={course.uploadedImage ? { uri: course.uploadedImage } : pill.image}
                    style={[
                      styles.pill,
                      {
                        borderRadius: pillBorderRadius,
                        width: imageSize,
                        height: imageSize,
                      },
                    ]}
                    width={imageSize}
                    height={imageSize}
                  />
                </Appear>

                <View style={styles.titleContainer}>
                  <View>
                    <Appear show={true} delay={250} type={EAppearType.Spring}>
                      <Text style={[styles.title, { fontSize: titleSize }]}>{course.title}</Text>
                    </Appear>
                    <Appear show={true} delay={300} type={EAppearType.Spring}>
                      <Text style={styles.subtitle}>
                        {course.period} {periodTitle}, {timesTitle}
                      </Text>
                    </Appear>
                  </View>
                </View>

                <Appear show={true} delay={200} type={EAppearType.Drop}>
                  <CheckButton
                    text={localeManager.t('COURSE_SUMMARY_MODAL.RECEIVE_REMINDERS')}
                    isChecked={course.notificationsEnabled}
                    isLoading={notificationsLoading}
                    onPress={this.handleNotifications}
                  />
                </Appear>
              </View>
            </View>
          </ImageBackground>
        </SafeAreaView>

        <View style={styles.bottom}>
          <View style={styles.content}>
            <View>
              <Text style={styles.headerText}>
                {localeManager.t('COURSE_SUMMARY_MODAL.HEADER')}
              </Text>
              <Text style={styles.subHeaderText}>
                {localeManager.t('COURSE_SUMMARY_MODAL.DESCRIPTION')}
              </Text>
              <View style={styles.infoBlock}>
                <View style={styles.infoBlockRow}>
                  <StatisticsInfoBlock
                    icon={
                      <Progress
                        strokeWidth={4}
                        size={35}
                        color={COLORS.RED.toString()}
                        percent={course.takenPercent}
                        showPercentage={false}
                      />
                    }
                    title={localeManager.t('COURSE_SUMMARY_MODAL.COMPLETION')}
                    body={`${course.takenPercent}%`}
                  />

                  <StatisticsInfoBlock
                    icon={
                      <Image
                        style={styles.infoIcon}
                        resizeMode='contain'
                        source={ICONS.SMALL_LIST}
                      />
                    }
                    title={localeManager.t('COURSE_SUMMARY_MODAL.TAKES')}
                    body={`${course.timesTaken} / ${course.timesTotal}`}
                  />
                </View>

                <View style={styles.infoBlockRow}>
                  <StatisticsInfoBlock
                    icon={
                      <Image
                        style={styles.infoIcon}
                        resizeMode='contain'
                        source={ICONS.SMALL_TABLETS}
                      />
                    }
                    title={localeManager.t('COURSE_SUMMARY_MODAL.UNITS_TAKEN')}
                    body={`${unitsTaken} / ${unitsTotal}`}
                  />

                  <StatisticsInfoBlock
                    icon={
                      <Image
                        style={styles.infoIcon}
                        resizeMode='contain'
                        source={ICONS.SMALL_DAYS}
                      />
                    }
                    title={localeManager.t('COURSE_SUMMARY_MODAL.DAYS_PAST')}
                    body={`${differenceInDays(Date.now(), course.startDate) +
                      1} / ${differenceInDays(course.endDate, course.startDate) + 1}`}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={GLOBAL_STYLES.MODAL_BUTTON_HOLDER}>
            {courseEditMode === ECourseEditMode.View ? (
              <View style={styles.actions}>
                <FormButton
                  customStyles={styles.actionsButton}
                  onPress={this.handleDelete}
                  isDisabled={false}
                  isLoading={deleteLoading}
                  isSmall
                  theme={EFormButtonTheme.RedLight}
                  title={localeManager.t('COMMON.DELETE_COURSE')}
                />

                <FormButton
                  customStyles={styles.actionsButton}
                  onPress={this.handleEdit}
                  isDisabled={deleteLoading}
                  isLoading={false}
                  isSmall
                  theme={EFormButtonTheme.Gray}
                  title={localeManager.t('COMMON.EDIT_COURSE')}
                />
              </View>
            ) : (
              <>
                <View style={styles.notice}>
                  <Text style={styles.noticeText}>
                    {localeManager.t('COURSE_SUMMARY_MODAL.DISCLAIMER')}
                  </Text>
                </View>

                <FormButton
                  isLoading={loading}
                  theme={EFormButtonTheme.Red}
                  isDisabled={false}
                  onPress={this.handleSave}
                  title={localeManager.t(
                    courseEditMode === ECourseEditMode.Create
                      ? 'COMMON.CREATE_COURSE'
                      : 'COMMON.SAVE_COURSE',
                  )}
                />
              </>
            )}
          </View>
        </View>
        <AdBanner isPro={commonStore.state.isPro} />
      </View>
    );
  }

  handleEdit = () => {
    if (this.props.navigation) {
      this.props.navigation.navigate(ERouteName.TodayCreateCourseScreen);

      setTimeout(() => {
        createCourseStore.setState({
          courseEditMode: ECourseEditMode.Edit,
        });
      }, 380);
    }
  };

  handleDelete = () => {
    Alert.alert(
      localeManager.t('COMMON.DELETE_COURSE'),
      localeManager.t('COMMON.DELETE_CONFIRM'),
      [
        {
          text: localeManager.t('COMMON.CANCEL'),
          style: 'cancel',
        },
        {
          text: localeManager.t('COMMON.OK'),
          onPress: async () => {
            this.setState(
              {
                deleteLoading: true,
              },
              async () => {
                await courseManager.deleteCourse(createCourseStore.state.currentCourseId);

                if (this.props.navigation) {
                  this.props.navigation.navigate(ERouteName.Today);
                }
              },
            );
          },
        },
      ],
      { cancelable: false },
    );
  };

  handleNotifications = () => {
    CommonService.haptic();

    this.setState(
      {
        notificationsLoading: true,
      },
      async () => {
        await courseManager.updateNotificationsEnabled();

        this.setState({
          notificationsLoading: false,
        });
      },
    );
  };

  handleSave = () => {
    this.setState(
      {
        loading: true,
      },
      async () => {
        if (createCourseStore.state.courseEditMode === ECourseEditMode.Create) {
          await courseManager.createCourse();
        } else {
          await courseManager.updateCourse();
        }

        if (this.props.navigation) {
          this.props.navigation.navigate(ERouteName.Today);
        }
      },
    );
  };
}

const styles = StyleSheet.create({
  infoBlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 35,
    height: 35,
  },

  top: {
    backgroundColor: COLORS.BLUE.toString(),
    justifyContent: 'center',
  },

  bottom: {
    justifyContent: 'center',
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  actionsButton: {
    flex: 0.48,
  },

  notice: {
    paddingBottom: VARIABLES.PADDING_BIG,
    paddingHorizontal: VARIABLES.PADDING_BIG * 3,
    flexShrink: 0,
  },

  noticeText: {
    textAlign: 'center',
    color: COLORS.GRAY.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  takeList: {
    minHeight: VARIABLES.INPUT_HEIGHT,
  },

  takeListContainer: {
    minHeight: VARIABLES.INPUT_HEIGHT,
  },

  infoBlock: {
    elevation: 1,
    backgroundColor: COLORS.WHITE.toString(),
    shadowColor: COLORS.GRAY_PALE_LIGHT.toString(),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    marginTop: VARIABLES.PADDING_SMALL,
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  labels: {
    flexDirection: 'row',
  },

  content: {
    flex: 1,
    padding: VARIABLES.PADDING_BIG,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerText: {
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    color: COLORS.GRAY.toString(),
    textTransform: 'uppercase',
    fontFamily: FONTS.BOLD,
  },

  subHeaderText: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    color: COLORS.GRAY.toString(),
    fontFamily: FONTS.MEDIUM,
    marginBottom: VARIABLES.PADDING_SMALL,
  },

  contentTop: {
    paddingTop: 0,
    justifyContent: 'center',
    paddingBottom: VARIABLES.PADDING_BIG,
  },

  heading: {
    alignItems: 'center',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: VARIABLES.PADDING_BIG,
  },

  title: {
    marginBottom: 3,
    textAlign: 'center',
    fontFamily: FONTS.BOLD,
    color: COLORS.WHITE.toString(),
  },

  subtitle: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    textAlign: 'center',
    fontFamily: FONTS.MEDIUM,
    color: COLORS.WHITE.alpha(0.75).toString(),
  },

  pill: {
    overflow: 'hidden',
  },

  pillContainer: {
    overflow: 'hidden',
    backgroundColor: COLORS.WHITE.alpha(0.33).toString(),
    marginBottom: 10,
  },
});
