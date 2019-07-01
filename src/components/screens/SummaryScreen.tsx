import React from 'react';
import { NavigationContainerProps, NavigationEvents, ScrollView } from 'react-navigation';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
import { Title } from '../ui/Title';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import { SummaryItem } from '../ui/SummaryItem';
import { Progress } from '../ui/Progress';
import { Label } from '../ui/Label';
import { followStore } from 'react-stores';
import { courseStore } from '../../stores/courseStore';
import { ICourse } from '../../common/course';
import { isBefore, isAfter, isSameDay } from 'date-fns';
import Icon from 'react-native-vector-icons/Ionicons';
import { SummaryItemCourse } from '../ui/SummaryItemCourse';
import { localeManager } from '../../managers/LocaleManager';
import { FONTS } from '../../common/fonts';
import { firebaseManager } from '../../managers/FirebaseManager';
import { AdBanner } from '../ui/AdBanner';

interface IState {
  overallProgress: number;
  actualCourses: ICourse[];
  pastCourses: ICourse[];
  completedCourses: ICourse[];
  medicationTakenOverall: number;
  medicationTakesOverall: number;
}

@followStore(courseStore)
export class SummaryScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    overallProgress: 0,
    actualCourses: [],
    pastCourses: [],
    completedCourses: [],
    medicationTakenOverall: 0,
    medicationTakesOverall: 0,
  };

  getActualCourses(): ICourse[] {
    const today = new Date();

    return Array.from(courseStore.state.courses.values()).filter(course => {
      return isAfter(course.endDate, today) || isSameDay(course.endDate, today);
    });
  }

  getPastCourses(): ICourse[] {
    const today = new Date();

    return Array.from(courseStore.state.courses.values()).filter(course => {
      return isBefore(course.endDate, today);
    });
  }

  getCompletedCourses(): ICourse[] {
    return Array.from(courseStore.state.courses.values()).filter(course => {
      return course.takenPercent === 100;
    });
  }

  countStats() {
    const actualCourses = this.getActualCourses();
    const pastCourses = this.getPastCourses();
    const completedCourses = this.getCompletedCourses();
    const overallPercents = actualCourses.length * 100;

    let overallPercentCompleted = 0;
    let medicationTakenOverall = 0;
    let medicationTakesOverall = 0;

    actualCourses.forEach(course => {
      overallPercentCompleted += course.takenPercent;
    });

    courseStore.state.courses.forEach(course => {
      medicationTakenOverall += course.timesTaken;
      medicationTakesOverall += course.timesTotal;
    });

    let overallProgress = Math.round((overallPercentCompleted / overallPercents) * 100);

    if (overallProgress > 100) {
      overallProgress = 100;
    }

    if (isNaN(overallProgress)) {
      overallProgress = 0;
    }

    this.setState({
      overallProgress,
      pastCourses,
      actualCourses,
      completedCourses,
      medicationTakenOverall,
    });
  }

  render() {
    const {
      overallProgress,
      pastCourses,
      actualCourses,
      completedCourses,
      medicationTakenOverall,
      medicationTakesOverall,
    } = this.state;

    const courses = Array.from(courseStore.state.courses.values());

    courses.sort((a, b) => {
      return b.startDate - a.startDate;
    });

    return (
      <SafeAreaView style={styles.container}>
        <CustomStatusBar barStyle='dark-content' />

        <NavigationEvents
          onDidFocus={() => {
            firebaseManager.loadAds();
          }}
        />

        <ScrollView style={styles.scroll}>
          <Title
            color={COLORS.BLACK.toString()}
            text={localeManager.t('SUMMARY.TITLE')}
            backgroundColor={COLORS.GRAY_ULTRA_LIGHT.toString()}
          />

          <View style={styles.content}>
            <Text style={styles.groupTitle}>{localeManager.t('SUMMARY.GROUP_TITLE_STATS')}</Text>

            <SummaryItem
              icon={
                <Icon
                  style={{ top: 0.5 }}
                  name={'ios-ribbon'}
                  size={24}
                  color={COLORS.RED.toString()}
                />
              }
              title={localeManager.t('SUMMARY_FEATURES.FEATURE_1.TITLE')}
              subtitle={localeManager.t('SUMMARY_FEATURES.FEATURE_1.SUBTITLE')}
              right={
                <View style={styles.rightContainer}>
                  <Progress
                    strokeWidth={3}
                    size={38}
                    color={COLORS.RED.toString()}
                    percent={overallProgress}
                    showPercentage={true}
                  />
                </View>
              }
            />
            <SummaryItem
              icon={
                <Icon style={{}} name={'ios-podium'} size={23} color={COLORS.GREEN.toString()} />
              }
              title={localeManager.t('SUMMARY_FEATURES.FEATURE_2.TITLE')}
              subtitle={localeManager.t('SUMMARY_FEATURES.FEATURE_2.SUBTITLE')}
              right={<Label>{courseStore.state.courses.size}</Label>}
            />
            <SummaryItem
              icon={
                <Icon
                  style={{ top: -4 }}
                  name={'ios-done-all'}
                  size={32}
                  color={COLORS.GREEN.toString()}
                />
              }
              title={localeManager.t('SUMMARY_FEATURES.FEATURE_3.TITLE')}
              subtitle={localeManager.t('SUMMARY_FEATURES.FEATURE_3.SUBTITLE')}
              right={<Label>{completedCourses.length}</Label>}
            />
            <SummaryItem
              icon={
                <Icon
                  style={{ top: -1 }}
                  name={'ios-medical'}
                  size={24}
                  color={COLORS.GREEN.toString()}
                />
              }
              title={localeManager.t('SUMMARY_FEATURES.FEATURE_4.TITLE')}
              subtitle={localeManager.t('SUMMARY_FEATURES.FEATURE_4.SUBTITLE')}
              right={<Label>{medicationTakenOverall}</Label>}
            />

            {courses.length > 0 && (
              <React.Fragment>
                <View style={styles.dots}>
                  <Icon name={'ios-more'} size={32} color={COLORS.GRAY.toString()} />
                </View>

                <Text style={styles.groupTitle}>
                  {localeManager.t('SUMMARY.GROUP_TITLE_COURSES')}
                </Text>

                {courses.map((course, i) => {
                  return <SummaryItemCourse course={course} key={i} />;
                })}
              </React.Fragment>
            )}
          </View>
        </ScrollView>
        <AdBanner />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  rightContainer: {
    height: 38,
    width: 38,
    margin: 6,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  content: {
    paddingHorizontal: VARIABLES.PADDING_BIG,
    flex: 1,
  },

  scroll: {
    width: '100%',
  },

  dots: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
  },

  groupTitle: {
    marginBottom: 5,
    color: COLORS.GRAY.toString(),
    fontFamily: FONTS.MEDIUM,
  },
});
