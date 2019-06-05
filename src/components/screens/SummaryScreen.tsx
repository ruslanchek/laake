import React from 'react';
import { NavigationContainerProps, NavigationEvents, ScrollView } from 'react-navigation';
import { StyleSheet, SafeAreaView, View, Text, Animated } from 'react-native';
import { Title } from '../ui/Title';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import firebase from 'react-native-firebase';
import { Notification } from 'react-native-firebase/notifications';
import { SummaryItem } from '../ui/SummaryItem';
import { Progress } from '../ui/Progress';
import { FONTS } from '../../common/fonts';
import { Label } from '../ui/Label';
import { followStore } from 'react-stores';
import { courseStore } from '../../stores/courseStore';
import { ICourse } from '../../common/course';
import { isBefore, isAfter, isSameDay } from 'date-fns';

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

    const overallProgress = Math.round((overallPercentCompleted / overallPercents) * 100);

    this.setState({
      overallProgress,
      pastCourses,
      actualCourses,
      completedCourses,
      medicationTakenOverall,
    });

    console.log(overallPercentCompleted);
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

    return (
      <SafeAreaView style={styles.container}>
        <CustomStatusBar barStyle='dark-content' />

        <NavigationEvents
          onDidFocus={() => {
            this.countStats();
          }}
        />

        <ScrollView style={styles.scroll}>
          <Title
            color={COLORS.BLACK.toString()}
            text='Summary'
            backgroundColor={COLORS.GRAY_ULTRA_LIGHT.toString()}
          />

          <View style={styles.content}>
            <SummaryItem
              title='Overall progress'
              subtitle='Through all your courses'
              right={
                <Progress
                  strokeWidth={4}
                  size={50}
                  color={COLORS.RED.toString()}
                  percent={overallProgress}
                  showPercentage={true}
                />
              }
            />

            <SummaryItem
              title='Courses'
              subtitle='Total'
              right={<Label>{courseStore.state.courses.size}</Label>}
            />

            <SummaryItem
              title='Courses'
              subtitle='Completed'
              right={<Label>{completedCourses.length}</Label>}
            />

            <SummaryItem
              title='Medication taken'
              subtitle='All time'
              right={<Label>{medicationTakenOverall}</Label>}
            />

            <SummaryItem
              title='Skipped'
              subtitle='Medication takes'
              right={<Label>{medicationTakesOverall}</Label>}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  content: {
    paddingVertical: VARIABLES.PADDING_BIG,
    paddingHorizontal: VARIABLES.PADDING_BIG,
    flex: 1,
  },

  scroll: {
    width: '100%',
  },
});
