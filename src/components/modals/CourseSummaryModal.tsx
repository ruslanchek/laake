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
} from 'react-native';
import { NavigationContainerProps, NavigationEvents, SafeAreaView } from 'react-navigation';
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
import { Haptic } from 'expo';
import { ERouteName } from '../../enums/ERouteName';
import { courseManager } from '../../managers/CourseManager';
import { FONTS } from '../../common/fonts';
import { BGS } from '../../common/bgs';
import { Progress } from '../ui/Progress';
import { Appear, EAppearType } from '../common/Appear';

interface IState {
  loading: boolean;
  deleteLoading: boolean;
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
    const { loading, deleteLoading } = this.state;
    const { currentLocale } = commonStore.state;
    const { t } = localeManager;
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
    };
    const pill = PILLS_MAP.get(course.pillId) || PILLS[0];
    const periodTitle = t(periodTypeNames.get(course.periodType) || '');
    const timesTitle = `${t('TIMES.TIMES', {
      value: course.times.toLocaleString(currentLocale),
      count: course.times,
    })} ${t(timesPerNames.get(course.timesPer) || '')}`;

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
              </View>
            </View>
          </ImageBackground>
        </SafeAreaView>

        <View style={styles.bottom}>
          <View style={styles.content}>
            <Text style={styles.headerText}>Summary</Text>
            <Text style={GLOBAL_STYLES.INPUT_LABEL}>Information about the course</Text>
            <View style={styles.takeListView}>
              <Progress />
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
                  theme={EFormButtonTheme.Red}
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
    if (Platform.OS === 'ios') {
      Haptic.selection();
    }

    if (this.props.navigation) {
      this.props.navigation.navigate(ERouteName.TodayCreateCourseScreen);
    }
  };

  handleDelete = () => {
    if (Platform.OS === 'ios') {
      Haptic.selection();
    }

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
            await courseManager.deleteCourse(createCourseStore.state.currentCourseId);

            if (this.props.navigation) {
              this.props.navigation.navigate(ERouteName.Today);
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  handleSave = async () => {
    if (Platform.OS === 'ios') {
      Haptic.selection();
    }

    this.setState({
      loading: true,
    });

    if (this.courseEditMode === ECourseEditMode.Create) {
      await courseManager.createCourse();
    } else {
      await courseManager.updateCourse();
    }

    if (this.props.navigation) {
      this.props.navigation.navigate(ERouteName.Today);
    }
  };
}

const styles = StyleSheet.create({
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

  takeListView: {
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
    padding: VARIABLES.PADDING_MEDIUM,
  },

  takeListItem: {
    borderTopColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
    borderTopWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: VARIABLES.PADDING_MEDIUM,
    height: VARIABLES.INPUT_HEIGHT,
  },

  takeListItemFirst: {
    borderTopWidth: 0,
  },

  takeListItemString: {
    marginRight: VARIABLES.PADDING_MEDIUM / 3,
    flexShrink: 1,
  },

  labels: {
    flexDirection: 'row',
  },

  content: {
    flex: 1,
    padding: VARIABLES.PADDING_BIG,
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
