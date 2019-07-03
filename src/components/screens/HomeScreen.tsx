import React from 'react';
import { NavigationContainerProps, SafeAreaView, NavigationEvents } from 'react-navigation';
import {
  ActivityIndicator,
  Animated,
  SectionList,
  SectionListData,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ERouteName } from '../../enums/ERouteName';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { followStore } from 'react-stores';
import { commonStore } from '../../stores/commonStore';
import Icon from 'react-native-vector-icons/Ionicons';
import { GLOBAL_STYLES } from '../../common/styles';
import { CalendarHeader } from '../common/CalendarHeader';
import { courseManager } from '../../managers/CourseManager';
import { localeManager } from '../../managers/LocaleManager';
import { courseStore, createTakeTimeIndex } from '../../stores/courseStore';
import { CourseCard } from '../blocks/CourseCard';
import { ITake, ITakeTime } from '../../common/take';
import { ICourse } from '../../common/course';
import { createCourseManager } from '../../managers/CreateCourseManager';
import { FONTS } from '../../common/fonts';
import { Appear, EAppearType } from '../common/Appear';
import { CommonService } from '../../services/CommonService';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import { firebaseManager } from '../../managers/FirebaseManager';
import { AdBanner } from '../ui/AdBanner';

interface IState {
  scrollTop: Animated.Value;
}

interface ISectionData {
  take: ITake;
  course: ICourse;
  takeTime?: ITakeTime;
}

@followStore(commonStore)
@followStore(courseStore)
export class HomeScreen extends React.Component<NavigationContainerProps, IState> {
  static navigationOptions = {
    header: null,
  };

  state: IState = {
    scrollTop: new Animated.Value(0),
  };

  render() {
    const { loadingCourses, loadingTakeTimes } = courseStore.state;
    const daysDifference = courseManager.daysDifference(commonStore.state.today);
    const todayWords = localeManager.t(daysDifference.word, {
      count: daysDifference.difference,
    });

    const dateWords = localeManager.formatDate(commonStore.state.today, 'dddd, D MMMM YYYY');
    const { scrollTop } = this.state;
    const sections = this.sections;

    return (
      <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <CustomStatusBar barStyle='light-content' color={COLORS.RED.toString()} />

        <NavigationEvents
          onDidFocus={() => {
            firebaseManager.loadAds();
          }}
        />

        <View style={styles.inner}>
          <CalendarHeader
            todayWords={todayWords}
            dateWords={dateWords}
            scrollTop={this.state.scrollTop}
          />

          <SectionList
            stickySectionHeadersEnabled={true}
            refreshing={loadingCourses || loadingTakeTimes}
            ListHeaderComponent={
              <>
                <View style={styles.headerSpacer} />
                <View style={styles.header}>
                  <View style={styles.titles}>
                    <Text style={styles.title}>{todayWords}</Text>
                    <Text style={styles.subtitle}>
                      {CommonService.capitalizeFirstWord(dateWords)}
                    </Text>
                  </View>

                  {sections.length > 0 && (
                    <TouchableOpacity onPress={this.handleNewCourse}>
                      <View style={styles.add}>
                        <Icon name='ios-add' size={64} color={COLORS.RED.toString()} />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            }
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.groupTitle}>
                {localeManager.t(courseManager.getTakeNumber(title))}
              </Text>
            )}
            renderItem={({ item, index, section }) => {
              return (
                <CourseCard
                  key={index}
                  course={item.course}
                  takeTime={item.takeTime}
                  take={item.take}
                />
              );
            }}
            initialNumToRender={1000}
            keyExtractor={(item, index) => item.course.id + item.take.index}
            sections={sections}
            contentContainerStyle={styles.scrollViewContainer}
            style={styles.scrollView}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollTop } } }])}
            scrollEventThrottle={1}
            ListEmptyComponent={
              <>
                {loadingCourses || loadingTakeTimes ? (
                  <Appear type={EAppearType.Fade} show={true} customStyles={styles.centered}>
                    <ActivityIndicator size='large' color={COLORS.GRAY.toString()} />
                  </Appear>
                ) : (
                  <Appear type={EAppearType.Fade} show={true} customStyles={styles.centered}>
                    <TouchableOpacity onPress={this.handleNewCourse}>
                      <View style={styles.add}>
                        <Icon name='ios-add' size={64} color={COLORS.RED.toString()} />
                      </View>
                    </TouchableOpacity>

                    <View style={styles.listEmpty}>
                      <Text style={styles.listEmptyText}>
                        {localeManager.t('COMMON.NO_COURSES')}
                      </Text>
                    </View>
                  </Appear>
                )}
              </>
            }
          />
          <AdBanner />
        </View>
      </SafeAreaView>
    );
  }

  get sections(): SectionListData<ISectionData>[] {
    const sections: SectionListData<ISectionData>[] = [];
    const { today } = commonStore.state;

    courseStore.state.courses.forEach(course => {
      if (courseManager.isCourseValidForDate(course, today)) {
        course.takes.forEach(take => {
          const section = sections.find(section => section.title === take.index);
          const data: ISectionData = {
            take,
            takeTime: courseStore.state.takeTimes.get(
              createTakeTimeIndex(
                course.id,
                take.index,
                courseManager.getDayIndex(commonStore.state.today),
              ),
            ),
            course,
          };

          if (section) {
            section.data.push(data);
          } else {
            sections.push({
              title: take.index,
              data: [data],
            });
          }
        });
      }
    });

    sections.forEach(section => {
      section.data.sort((a: ISectionData, b: ISectionData) => {
        return a.course.title.localeCompare(b.course.title, commonStore.state.currentLocale);
      });
    });

    return sections;
  }

  handleNewCourse = () => {
    createCourseManager.setDefaults();

    if (this.props.navigation) {
      this.props.navigation.navigate(ERouteName.TodayCreateCourseScreen);
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.RED.toString(),
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  listEmpty: {
    paddingTop: VARIABLES.PADDING_BIG,
    width: '50%',
  },

  listEmptyText: {
    textAlign: 'center',
    color: COLORS.GRAY.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  scrollView: {
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
    flexGrow: 1,
  },

  scrollViewContainer: {
    flexGrow: 1,
  },

  inner: {
    flexGrow: 1,
    flex: 1,
    alignSelf: 'stretch',
  },

  headerSpacer: {
    height: 95,
  },

  header: {
    marginTop: VARIABLES.PADDING_BIG,
    marginBottom: VARIABLES.PADDING_BIG,
    marginHorizontal: VARIABLES.PADDING_BIG,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
  },

  add: {
    height: 64,
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.RED.alpha(0.075).toString(),
    borderRadius: VARIABLES.PADDING_BIG,
  },

  titles: {
    flexGrow: 1,
  },

  title: {
    color: COLORS.BLACK.toString(),
    fontSize: VARIABLES.FONT_SIZE_GIANT,
    fontFamily: FONTS.BOLD,
  },

  subtitle: {
    marginTop: 5,
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    color: COLORS.GRAY.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 100,
    bottom: 0,
    flex: 1,
  },

  groupTitle: {
    marginHorizontal: VARIABLES.PADDING_BIG,
    marginBottom: 5,
    marginTop: 10,
    color: COLORS.GRAY.toString(),
    fontFamily: FONTS.MEDIUM,
  },
});
