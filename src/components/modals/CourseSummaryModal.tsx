import React from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainerProps, SafeAreaView } from 'react-navigation';
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

interface IState {
  loading: boolean;
  deleteLoading: boolean;
  notificationsLoading: boolean;
}

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

  get courseEditMode(): ECourseEditMode {
    if (
      this.props.navigation &&
      this.props.navigation.state &&
      this.props.navigation.state.params &&
      (this.props.navigation.state.params.courseEditMode === 0 ||
        this.props.navigation.state.params.courseEditMode)
    ) {
      return this.props.navigation.state.params.courseEditMode;
    } else {
      return ECourseEditMode.Create;
    }
  }

  render() {
    const { loading, deleteLoading, notificationsLoading } = this.state;
    const { currentLocale } = commonStore.state;
    const course: ICourse = {
      id: '',
      title: createCourseStore.state.title,
      pillId: createCourseStore.state.currentPill.id,
      periodType: createCourseStore.state.periodType,
      period: createCourseStore.state.period,
      times: createCourseStore.state.times,
      timesPer: createCourseStore.state.timesPer,
      takes: createCourseStore.state.takes,
      startDate: 0,
      endDate: 0,
      notificationsEnabled: createCourseStore.state.notificationsEnabled,
      takenPercent: createCourseStore.state.takenPercent,
      timesToTake: createCourseStore.state.timesToTake,
      timesTaken: createCourseStore.state.timesTaken,
      timesTotal: createCourseStore.state.timesTotal,
    };
    const pill = PILLS_MAP.get(course.pillId) || PILLS[0];
    const periodTitle = localeManager.t(periodTypeNames.get(course.periodType) || '');
    const timesTitle = `${localeManager.t('TIMES.TIMES', {
      value: course.times.toLocaleString(currentLocale),
      count: course.times,
    })} ${localeManager.t(timesPerNames.get(course.timesPer) || '')}`;

    return (
      <View style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <StatusBar
          animated={true}
          backgroundColor={COLORS.WHITE.toString()}
          barStyle='light-content'
        />

        <SafeAreaView style={styles.top}>
          <ImageBackground source={BGS.BLUE} style={{ width: '100%', height: '100%' }}>
            <Header
              title={localeManager.t(
                this.courseEditMode === ECourseEditMode.Create ? 'COMMON.EDIT' : 'COMMON.BACK',
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
                  customStyles={styles.pillContainer}
                >
                  <Image style={styles.pill} source={pill.image} />
                </Appear>

                <View style={styles.titleContainer}>
                  <View>
                    <Appear show={true} delay={250} type={EAppearType.Spring}>
                      <Text style={styles.title}>{course.title}</Text>
                    </Appear>
                    <Appear show={true} delay={300} type={EAppearType.Spring}>
                      <Text style={styles.subtitle}>
                        {course.period} {periodTitle}, {timesTitle}
                      </Text>
                    </Appear>
                  </View>
                </View>

                <CheckButton
                  text='Receive reminders'
                  isChecked={course.notificationsEnabled}
                  isLoading={notificationsLoading}
                  onPress={this.handleNotifications}
                />
              </View>
            </View>
          </ImageBackground>
        </SafeAreaView>

        <View style={styles.bottom}>
          <View style={styles.content}>
            <View>
              <Text style={styles.headerText}>Summary</Text>
              <Text style={GLOBAL_STYLES.INPUT_LABEL}>Information about the course</Text>
              <View style={styles.infoBlock}>
                <View style={styles.infoBlockRow}>
                  <StatisticsInfoBlock
                    icon={
                      <Progress
                        strokeWidth={3}
                        size={30}
                        color={COLORS.RED.toString()}
                        percent={course.takenPercent}
                        showPercentage={false}
                      />
                    }
                    title='Completion'
                    body={`${course.takenPercent}%`}
                  />

                  <View style={styles.infoBlockSeparatorVertical} />

                  <StatisticsInfoBlock
                    icon={
                      <Image
                        style={styles.infoIcon}
                        resizeMode='contain'
                        source={ICONS.SMALL_TABLETS}
                      />
                    }
                    title='Takes'
                    body={`${course.timesTaken} / ${course.timesTotal}`}
                  />
                </View>

                <View style={styles.infoBlockSeparatorHorizontal} />

                <View style={styles.infoBlockRow}>
                  <StatisticsInfoBlock
                    icon={
                      <Image
                        style={styles.infoIcon}
                        resizeMode='contain'
                        source={ICONS.SMALL_LIST}
                      />
                    }
                    title='Takes'
                    body={`${course.timesTaken} / ${course.timesTotal}`}
                  />

                  <View style={styles.infoBlockSeparatorVertical} />

                  <StatisticsInfoBlock
                    icon={
                      <Image
                        style={styles.infoIcon}
                        resizeMode='contain'
                        source={ICONS.SMALL_LIST}
                      />
                    }
                    title='Takes'
                    body={`${course.timesTaken} / ${course.timesTotal}`}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={GLOBAL_STYLES.MODAL_BUTTON_HOLDER}>
            {this.courseEditMode === ECourseEditMode.View ? (
              <View style={styles.actions}>
                <FormButton
                  customStyles={styles.actionsButton}
                  onPress={this.handleDelete}
                  isDisabled={false}
                  isLoading={deleteLoading}
                  isSmall
                  theme={EFormButtonTheme.RedLight}
                >
                  {localeManager.t('COMMON.DELETE_COURSE')}
                </FormButton>

                <FormButton
                  customStyles={styles.actionsButton}
                  onPress={this.handleEdit}
                  isDisabled={deleteLoading}
                  isLoading={false}
                  isSmall
                  theme={EFormButtonTheme.Gray}
                >
                  {localeManager.t('COMMON.EDIT_COURSE')}
                </FormButton>
              </View>
            ) : (
              <>
                <View style={styles.notice}>
                  <Text style={styles.noticeText}>
                    {localeManager.t('COURSE_SUMMARY_MODAL.DESCRIPTION')}
                  </Text>
                </View>

                <FormButton
                  isLoading={loading}
                  theme={EFormButtonTheme.Red}
                  isDisabled={false}
                  onPress={this.handleSave}
                >
                  {localeManager.t(
                    this.courseEditMode === ECourseEditMode.Create
                      ? 'COMMON.CREATE_COURSE'
                      : 'COMMON.SAVE_COURSE',
                  )}
                </FormButton>
              </>
            )}
          </View>
        </View>
      </View>
    );
  }

  handleEdit = () => {
    CommonService.haptic();

    if (this.props.navigation) {
      this.props.navigation.navigate(ERouteName.TodayCreateCourseScreen);
    }
  };

  handleDelete = () => {
    CommonService.haptic();

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
    CommonService.haptic();

    this.setState(
      {
        loading: true,
      },
      async () => {
        if (this.courseEditMode === ECourseEditMode.Create) {
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

  infoBlockSeparatorVertical: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.GRAY_PALE_LIGHT.toString(),
  },

  infoBlockSeparatorHorizontal: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.GRAY_PALE_LIGHT.toString(),
    marginHorizontal: VARIABLES.PADDING_BIG,
  },

  infoIcon: {
    width: 30,
    height: 30,
  },

  top: {
    backgroundColor: COLORS.BLUE.toString(),
    justifyContent: 'center',
    flex: 0.4,
  },

  bottom: {
    justifyContent: 'center',
    flex: 0.6,
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
    marginTop: VARIABLES.PADDING_SMALL,
    shadowOpacity: 1,
    shadowRadius: 3,
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
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    color: COLORS.GRAY.toString(),
    textTransform: 'uppercase',
    fontFamily: FONTS.BOLD,
  },

  contentTop: {
    paddingTop: 0,
    justifyContent: 'center',
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
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    fontWeight: '600',
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
    width: 75,
    height: 75,
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL * 1.65,
  },

  pillContainer: {
    padding: VARIABLES.PADDING_SMALL,
    borderRadius: VARIABLES.BORDER_RADIUS_BIG * 1.5,
    overflow: 'hidden',
    backgroundColor: COLORS.WHITE.alpha(0.33).toString(),
    marginBottom: 10,
  },
});
