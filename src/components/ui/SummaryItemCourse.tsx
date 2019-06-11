import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';
import { ICourse } from '../../common/course';
import { ImageWithPreload } from './ImageWithPreload';
import { PILLS_MAP, PILLS } from '../../common/pills';
import { Progress } from './Progress';
import { localeManager } from '../../managers/LocaleManager';
import { isAfter, isToday, isBefore } from 'date-fns';

interface IProps {
  course: ICourse;
}

const HEIGHT: number = 54;

export class SummaryItemCourse extends React.PureComponent<IProps> {
  render() {
    const { course } = this.props;
    const pill = PILLS_MAP.get(course.pillId) || PILLS[0];
    const now = new Date();
    let courseSubtitle = '';

    switch (true) {
      case course.takenPercent >= 100: {
        courseSubtitle = 'COURSE_STATUS.FINISHED';
        break;
      }

      case course.takenPercent < 100 && (isAfter(course.endDate, now) || isToday(course.endDate)): {
        courseSubtitle = 'COURSE_STATUS.IN_PROGRESS';
        break;
      }

      case course.takenPercent < 100 && isBefore(course.endDate, now): {
        courseSubtitle = 'COURSE_STATUS.ARCHIVE';
        break;
      }
    }

    return (
      <View style={styles.container}>
        <View style={styles.left}>
          <ImageWithPreload
            source={course.uploadedImage ? { uri: course.uploadedImage } : pill.image}
            style={styles.pill}
            width={HEIGHT}
            height={HEIGHT}
          />
        </View>
        <View style={styles.middle}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.subtitle}>{localeManager.t(courseSubtitle)}</Text>
        </View>
        <View style={styles.right}>
          <View style={styles.rightContainer}>
            <Progress
              strokeWidth={3}
              size={38}
              color={COLORS.RED.toString()}
              percent={course.takenPercent}
              showPercentage={true}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    shadowColor: COLORS.GRAY_PALE_LIGHT.toString(),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    padding: VARIABLES.PADDING_SMALL,
    backgroundColor: COLORS.WHITE.toString(),
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
    width: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: VARIABLES.PADDING_BIG,
  },

  left: {
    width: HEIGHT,
    flexGrow: 0,
    marginRight: VARIABLES.PADDING_MEDIUM,
  },

  middle: {
    flexGrow: 1,
  },

  right: {},

  icon: {
    width: 26,
  },

  title: {
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    fontFamily: FONTS.BOLD,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: VARIABLES.FONT_SIZE_TINY,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.GRAY.toString(),
  },

  pill: {
    width: HEIGHT,
    height: HEIGHT,
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
    borderWidth: 2,
    borderColor: COLORS.GRAY_PALE_LIGHT.toString(),
    overflow: 'hidden',
  },

  rightContainer: {
    height: 38,
    width: 38,
    margin: 6,
  },
});
