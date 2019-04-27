import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { PILLS, PILLS_MAP } from '../../common/pills';
import { ICourse } from '../../common/course';
import { createCourseManager } from '../../managers/CreateCourseManager';
import { commonStore } from '../../stores/commonStore';
import { courseManager } from '../../managers/CourseManager';
import { ITake, ITakeTime } from '../../common/take';
import { withNavigation, NavigationInjectedProps } from 'react-navigation';
import { ERouteName } from '../../enums/ERouteName';
import { ECourseEditMode, createCourseStore } from '../../stores/createCourseStore';
import Icon from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../common/fonts';
import { CommonService } from '../../services/CommonService';

interface IProps extends NavigationInjectedProps {
  take: ITake;
  takeTime: ITakeTime;
  course: ICourse;
}

interface IState {
  loading: boolean;
}

const HEIGHT: number = 54;

class CourseCardClass extends React.Component<IProps, IState> {
  state = {
    loading: false,
  };

  render() {
    const { course, take, takeTime } = this.props;
    const { loading } = this.state;
    const { width } = Dimensions.get('window');
    const pill = PILLS_MAP.get(course.pillId) || PILLS[0];
    const takeStrings = createCourseManager.generateTakeStrings(
      take,
      commonStore.state.currentLocale,
    );
    const time = new Date();

    time.setHours(take.hours);
    time.setMinutes(take.minutes);

    return (
      <View
        style={[
          styles.container,
          // time.isTaken ? styles.containerTaken : null,
          { width: width - VARIABLES.PADDING_BIG * 2 },
        ]}
      >
        <TouchableOpacity onPress={this.handleEdit} style={styles.pillContainer}>
          <Image
            style={styles.pill}
            source={course.uploadedImage ? { uri: course.uploadedImage } : pill.image}
          />
        </TouchableOpacity>

        <View style={styles.center}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>
              {course.title}
            </Text>
          </View>

          <View style={styles.subtitles}>
            <View style={styles.label}>
              <Text numberOfLines={1} style={styles.labelText}>
                {new Date(time).toLocaleTimeString(commonStore.state.currentLocale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Text style={styles.subtitle}>
              – {takeStrings[1]}, {takeStrings[2]}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={this.handleCheck} style={styles.buttonContainer}>
          <View
            style={[
              styles.button,
              takeTime && takeTime.isTaken ? styles.buttonChecked : null,
              loading ? styles.buttonLoading : null,
            ]}
          >
            {loading ? (
              <ActivityIndicator size='small' color={COLORS.GRAY.toString()} />
            ) : (
              <>
                {takeTime && takeTime.isTaken ? (
                  <Icon name='ios-checkmark' size={39.5} color={COLORS.GREEN.toString()} />
                ) : (
                  <Icon
                    style={styles.addIcon}
                    name='ios-medical'
                    size={22}
                    color={COLORS.RED.toString()}
                  />
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  handleEdit = () => {
    CommonService.haptic();

    if (this.props.navigation) {
      createCourseManager.setEditingCourseData(this.props.course.id, ECourseEditMode.View);
      this.props.navigation.navigate(ERouteName.TodayEditCourseScreen);
    }
  };

  handleCheck = () => {
    const { take, takeTime, course } = this.props;

    CommonService.haptic();

    this.setState(
      {
        loading: true,
      },
      async () => {
        await courseManager.updateTakeTime(course, take, takeTime);

        this.setState({
          loading: false,
        });
      },
    );
  };
}

export const CourseCard = withNavigation(CourseCardClass);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: VARIABLES.PADDING_BIG,
    marginBottom: VARIABLES.PADDING_MEDIUM,
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
    backgroundColor: COLORS.WHITE.toString(),
    // paddingVertical: VARIABLES.PADDING_SMALL,
    // paddingLeft: VARIABLES.PADDING_SMALL,
    shadowColor: COLORS.GRAY_PALE_LIGHT.toString(),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
  },

  containerTaken: {},

  center: {
    flexGrow: 1,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    paddingVertical: VARIABLES.PADDING_MEDIUM,
  },

  takeNum: {
    flexDirection: 'row',
  },

  label: {
    marginRight: 3,
    marginLeft: 0,
    marginVertical: 0,
  },

  labelText: {
    fontSize: VARIABLES.FONT_SIZE_TINY,
    fontFamily: FONTS.MEDIUM,
  },

  text: {
    fontSize: VARIABLES.FONT_SIZE_TINY,
    marginHorizontal: 1.33,
  },

  buttonContainer: {
    padding: VARIABLES.PADDING_MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
    backgroundColor: COLORS.RED.alpha(0.075).toString(),
  },

  buttonChecked: {
    backgroundColor: COLORS.GREEN.alpha(0.075).toString(),
  },

  buttonLoading: {
    backgroundColor: 'transparent',
  },

  addIcon: {
    top: 2,
  },

  title: {
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    fontWeight: '600',
    flex: 1,
    fontFamily: FONTS.BOLD,
  },

  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subtitles: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subtitle: {
    fontSize: VARIABLES.FONT_SIZE_TINY,
    color: COLORS.GRAY.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  pill: {
    width: HEIGHT,
    height: HEIGHT,
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
    borderWidth: 2,
    borderColor: COLORS.GRAY_PALE_LIGHT.toString(),
  },

  pillContainer: {
    marginRight: VARIABLES.PADDING_SMALL,
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
    overflow: 'hidden',
    padding: VARIABLES.PADDING_SMALL,
    // borderColor: COLORS.GRAY.alpha(0.25).toString(),
    // borderWidth: 0.5,
  },
});
