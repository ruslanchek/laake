import React from 'react';
import { NavigationContainerProps, SafeAreaView, ScrollView } from 'react-navigation';
import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { COLORS } from '../../common/colors';
import { EHeaderTheme, Header } from '../common/Header';
import { ERouteName } from '../../enums/ERouteName';
import { localeManager } from '../../managers/LocaleManager';
import { GLOBAL_STYLES } from '../../common/styles';
import { NotificationsHandler, ENotificationType } from '../common/Notifications';
import { followStore } from 'react-stores';
import { createCourseStore, ECourseEditMode } from '../../stores/createCourseStore';
import { commonStore } from '../../stores/commonStore';
import { periodTypeNames } from '../../common/periods';
import { VARIABLES } from '../../common/variables';
import { FormRow } from '../ui/FormRow';
import { FormCol } from '../ui/FormCol';
import { FormTextInput } from '../ui/FormTextInput';
import { FormEntitiesInput } from '../ui/FormEntitiesInput';
import { timesPerNames } from '../../common/times';
import { createCourseManager } from '../../managers/CreateCourseManager';
import { Haptic } from 'expo';
import { courseManager } from '../../managers/CourseManager';
import { ICONS } from '../../common/icons';
import { ModalHeader } from '../blocks/ModalHeader';

interface IState {
  scrollTop: Animated.Value;
  error: boolean;
}

@followStore(createCourseStore)
@followStore(commonStore)
export class CreateCourseScreen extends React.Component<NavigationContainerProps> {
  state: IState = {
    scrollTop: new Animated.Value(0),
    error: false,
  };

  render() {
    const { scrollTop } = this.state;
    const { period, periodType, times, timesPer, takes, courseEditMode } = createCourseStore.state;
    const { currentLocale } = commonStore.state;
    const { t } = localeManager;
    const periodTypeName = periodTypeNames.get(periodType) || '';

    return (
      <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <StatusBar
          animated={true}
          backgroundColor={COLORS.WHITE.toString()}
          barStyle='dark-content'
        />
        <Header
          title={localeManager.t('COMMON.BACK')}
          next={{
            title: localeManager.t(
              courseEditMode === ECourseEditMode.Create ? 'COMMON.CREATE' : 'COMMON.SAVE',
            ),
            action: this.handleCreateCourse,
          }}
          onBack={this.handleBack}
          theme={EHeaderTheme.Dark}
        />
        <ScrollView
          scrollEventThrottle={8}
          contentContainerStyle={styles.scrollView}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollTop } } }])}
        >
          <ModalHeader
            scrollTop={scrollTop}
            icon={courseEditMode === ECourseEditMode.Create ? ICONS.CREATE : ICONS.EDIT}
            title={localeManager.t(
              courseEditMode === ECourseEditMode.Create ? 'CREATE_COURSE.TITLE' : 'EDIT_COURSE.TITLE',
            )}
            description={localeManager.t(
              courseEditMode === ECourseEditMode.Create ? 'CREATE_COURSE.DESCRIPTION' : 'EDIT_COURSE.DESCRIPTION',
            )}
          />

          <View style={styles.content}>
            <View>
              <FormRow>
                <FormCol width='100%'>
                  <FormTextInput
                    label={t('CREATE_COURSE.LABEL_NAME')}
                    value={createCourseStore.state.title}
                    onChange={title => {
                      createCourseStore.setState({
                        title,
                      });

                      this.setState({
                        error: false,
                      });
                    }}
                    onFocus={() => {
                      this.setState({
                        error: false,
                      });
                    }}
                    error={this.state.error}
                    placeholder='Aspirin'
                    suffix={null}
                    prefix={
                      <TouchableOpacity style={styles.pill} onPress={this.handleEditType}>
                        <Image
                          resizeMode='contain'
                          style={styles.pillImage}
                          source={createCourseStore.state.currentPill.image}
                        />
                      </TouchableOpacity>
                    }
                  />
                </FormCol>
              </FormRow>

              <FormRow>
                <FormCol width='100%'>
                  <FormEntitiesInput
                    border={false}
                    borderRadiusTop
                    borderRadiusBottom
                    useWrapper
                    onPress={this.handleEditDuration}
                    items={`${period} ${t(periodTypeName)}`}
                    label={t('CREATE_COURSE.LABEL_DURATION')}
                    placeholder='Select duration'
                  />
                </FormCol>
              </FormRow>

              <FormRow>
                <FormCol width='100%'>
                  <FormEntitiesInput
                    border={false}
                    useWrapper={true}
                    borderRadiusTop={true}
                    borderRadiusBottom={true}
                    onPress={this.handleEditOftenness}
                    items={`${t('TIMES.TIMES', {
                      value: times.toLocaleString(currentLocale),
                      count: times,
                    })} ${t(timesPerNames.get(timesPer) || '')}`}
                    label={t('CREATE_COURSE.LABEL_OFTENNESS')}
                    placeholder='Select duration'
                  />
                </FormCol>
              </FormRow>

              {takes.length > 0 && (
                <FormRow>
                  <FormCol width='100%'>
                    <View style={[GLOBAL_STYLES.INPUT_CONTAINER, GLOBAL_STYLES.CONTAINER_COLUMN]}>
                      {takes.map((take, i) => {
                        const isFirst = i === 0;
                        const isLast = i === takes.length - 1;

                        return (
                          <FormEntitiesInput
                            border={!isFirst}
                            borderRadiusTop={isFirst}
                            borderRadiusBottom={isLast}
                            useWrapper={false}
                            key={i}
                            onPress={this.handleEditTake.bind(this, i)}
                            items={createCourseManager.generateTakeStrings(take, currentLocale)}
                            label={localeManager.t(courseManager.getTakeNumber(take.index))}
                            placeholder={t('TAKE.PLACEHOLDER')}
                          />
                        );
                      })}
                    </View>
                  </FormCol>
                </FormRow>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  handleBack = () => {
    if (createCourseStore.state.courseEditMode === ECourseEditMode.Create) {
      createCourseManager.setDefaults();
    } else {
      if (createCourseStore.state.currentCourseId) {
        createCourseManager.setEditingCourseData(createCourseStore.state.currentCourseId);
      }
    }
  };

  handleEditType = () => {
    if (this.props.navigation) {
      this.props.navigation.navigate(ERouteName.CourseTypeModal);
    }

    if (Platform.OS === 'ios') {
      Haptic.selection();
    }
  };

  handleEditDuration = () => {
    if (this.props.navigation) {
      this.props.navigation.navigate(ERouteName.CourseDurationModal);
    }
  };

  handleEditOftenness = () => {
    if (this.props.navigation) {
      this.props.navigation.navigate(ERouteName.CourseOftennessModal);
    }
  };

  handleEditTake(i: number) {
    if (this.props.navigation) {
      this.props.navigation.navigate(ERouteName.CourseTakeModal, {
        takeIndex: i,
      });
    }
  }

  handleCreateCourse = () => {
    const error = createCourseManager.checkFormValidity();

    if (!error) {
      if (this.props.navigation) {
        this.props.navigation.navigate(ERouteName.CourseSummaryModal, {
          courseEditMode: createCourseStore.state.courseEditMode,
        });
      }
    } else {
      NotificationsHandler.alertWithType(
        ENotificationType.Error,
        localeManager.t(error.title),
        localeManager.t(error.message),
      );

      this.setState({
        error: true,
      });
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
  },

  scrollView: {},

  buttonHolder: {
    padding: VARIABLES.PADDING_BIG,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
  },

  text: {
    color: COLORS.WHITE.toString(),
    fontSize: VARIABLES.FONT_SIZE_GIANT,
    fontWeight: '600',
  },

  content: {
    paddingHorizontal: VARIABLES.PADDING_BIG,
    justifyContent: 'space-between',
  },

  pill: {
    borderBottomStartRadius: VARIABLES.BORDER_RADIUS_SMALL,
    borderTopStartRadius: VARIABLES.BORDER_RADIUS_SMALL,
    overflow: 'hidden',
    width: VARIABLES.INPUT_HEIGHT - 2,
    height: VARIABLES.INPUT_HEIGHT - 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  pillImage: {
    width: VARIABLES.INPUT_HEIGHT,
    height: VARIABLES.INPUT_HEIGHT,
  },
});
