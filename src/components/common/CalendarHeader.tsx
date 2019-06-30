import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import Icon from 'react-native-vector-icons/Ionicons';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { commonStore } from '../../stores/commonStore';
import { followStore } from 'react-stores';
import { isToday, isSameWeek, startOfWeek } from 'date-fns';
import { localeManager } from '../../managers/LocaleManager';
import { courseManager } from '../../managers/CourseManager';
import { FONTS } from '../../common/fonts';
import { Appear, EAppearType } from './Appear';
import { CommonService } from '../../services/CommonService';

interface IProps {
  scrollTop: Animated.Value;
  dateWords: string;
  todayWords: string;
}

@followStore(commonStore)
export class CalendarHeader extends React.Component<IProps> {
  monthNamesCacahe: string[] = [];

  get monthNames(): string[] {
    if (this.monthNamesCacahe.length === 0) {
      this.monthNamesCacahe = [];

      const date = new Date();

      for (let i = 0; i < 12; i++) {
        date.setDate(1);
        date.setMonth(i);

        this.monthNamesCacahe.push(
          date.toLocaleString(commonStore.state.currentLocale, {
            month: 'long',
          }),
        );
      }
    }

    return this.monthNamesCacahe;
  }

  render() {
    const { scrollTop, dateWords } = this.props;

    return (
      <Animated.View
        style={[
          styles.calendarHeader,
          {
            transform: [
              {
                translateY: scrollTop.interpolate({
                  inputRange: [0, 60],
                  outputRange: [0, -60],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.dateContainer,
            {
              opacity: this.props.scrollTop.interpolate({
                inputRange: [0, 60],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.date,
              {
                fontSize: this.props.scrollTop.interpolate({
                  inputRange: [0, 60],
                  outputRange: [VARIABLES.FONT_SIZE_TINY, VARIABLES.FONT_SIZE_SMALL],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            {dateWords}
          </Animated.Text>
        </Animated.View>

        <Appear
          show={!isToday(commonStore.state.today)}
          customStyles={styles.todayButton}
          type={EAppearType.Spring}
        >
          <TouchableOpacity style={styles.todayButtonTouchable} onPress={this.handlePressToday}>
            <Icon
              style={styles.todayButtonIcon}
              name='ios-calendar'
              size={16}
              color={COLORS.WHITE.toString()}
            />
            <Animated.Text
              style={[
                styles.todayText,
                {
                  fontSize: this.props.scrollTop.interpolate({
                    inputRange: [0, 60],
                    outputRange: [VARIABLES.FONT_SIZE_TINY, VARIABLES.FONT_SIZE_SMALL],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              {localeManager.t('COMMON.BACK_TO_TODAY')}
            </Animated.Text>
          </TouchableOpacity>
        </Appear>

        <Animated.View
          style={{
            opacity: this.props.scrollTop.interpolate({
              inputRange: [0, 60],
              outputRange: [1, 0],
            }),
          }}
        >
          <CalendarStrip
            style={styles.calendar}
            locale={{
              name: commonStore.state.currentLocale,
              config: {
                months: this.monthNames,
              },
            }}
            selectedDate={commonStore.state.today}
            calendarHeaderPosition={'below'}
            calendarHeaderStyle={styles.header}
            calendarHeaderContainerStyle={styles.headerContainer}
            onDateSelected={this.handleSelectDate}
            onWeekChanged={this.handleWeekChange}
            dayComponent={props => {
              const date = new Date(props.date.toISOString());
              const isToday = this.isSameDay(new Date(), date);

              return (
                <TouchableOpacity style={styles.day} onPress={props.onDateSelected}>
                  <Text style={[styles.weekday, isToday ? styles.weekdayToday : null]}>
                    {date.toLocaleDateString(commonStore.state.currentLocale, {
                      weekday: 'narrow',
                    })}
                  </Text>
                  <View style={this.getNumberContainerStyles(isToday, props.selected)}>
                    <Text style={this.getNumberStyles(isToday, props.selected)}>
                      {date.toLocaleDateString(commonStore.state.currentLocale, {
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            rightSelector={
              <View style={styles.arrowRight}>
                <Icon
                  style={styles.todayButtonIcon}
                  name='ios-arrow-forward'
                  size={32}
                  color={COLORS.WHITE.toString()}
                />
              </View>
            }
            leftSelector={
              <View style={styles.arrowLeft}>
                <Icon
                  style={styles.todayButtonIcon}
                  name='ios-arrow-back'
                  size={32}
                  color={COLORS.WHITE.toString()}
                />
              </View>
            }
          />
        </Animated.View>
      </Animated.View>
    );
  }

  getNumberContainerStyles(isToday: boolean, isSelected: boolean) {
    if (isToday && isSelected) {
      return [styles.numberContainer, styles.numberContainerTodaySelected];
    } else if (isToday && !isSelected) {
      return [styles.numberContainer, styles.numberContainerToday];
    } else if (!isToday && isSelected) {
      return [styles.numberContainer, styles.numberContainerSelected];
    } else {
      return [styles.numberContainer];
    }
  }

  getNumberStyles(isToday: boolean, isSelected: boolean) {
    if (isToday && isSelected) {
      return [styles.number, styles.numberTodaySelected];
    } else if (isToday && !isSelected) {
      return [styles.number, styles.numberToday];
    } else if (!isToday && isSelected) {
      return [styles.number, styles.numberSelected];
    } else {
      return [styles.number];
    }
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  handlePressToday = () => {
    courseManager.setToday(new Date());
    CommonService.haptic();
  };

  handleSelectDate = (date: Date) => {
    courseManager.setToday(new Date(date));
    CommonService.haptic();
  };

  handleWeekChange = (e: any) => {
    if (e && e._d) {
      const weekStartDate = new Date(e._d);

      if (isSameWeek(weekStartDate, new Date())) {
        courseManager.setToday(new Date());
      } else {
        courseManager.setToday(weekStartDate);
      }
    }

    CommonService.haptic();
  };
}

const styles = StyleSheet.create({
  calendarHeader: {
    backgroundColor: COLORS.RED.toString(),
    position: 'absolute',
    top: -5,
    left: 0,
    width: '100%',
    height: 100,
    zIndex: 2,
  },

  todayButtonIcon: {
    top: 0.25,
    marginRight: 5,
  },

  todayText: {
    fontSize: VARIABLES.FONT_SIZE_TINY,
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  todayButton: {
    position: 'absolute',
    bottom: 6.5,
    zIndex: 2,
    right: VARIABLES.PADDING_BIG,
  },

  todayButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateContainer: {
    position: 'absolute',
    bottom: 7,
    zIndex: 2,
    left: VARIABLES.PADDING_BIG,
  },

  date: {
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.MEDIUM,
    fontSize: VARIABLES.FONT_SIZE_TINY,
  },

  calendar: {
    height: 100,
    flexShrink: 1,
    paddingTop: 20,
    paddingBottom: 8,
  },

  arrowLeft: {
    paddingTop: 16,
    paddingLeft: VARIABLES.PADDING_BIG,
    paddingRight: 5,
  },

  arrowRight: {
    paddingTop: 16,
    paddingLeft: 5,
    paddingRight: VARIABLES.PADDING_BIG,
  },

  header: {
    fontWeight: '400',
    alignSelf: 'flex-start',
    color: COLORS.WHITE.toString(),
    marginLeft: VARIABLES.PADDING_BIG,
    fontFamily: FONTS.MEDIUM,
    fontSize: VARIABLES.FONT_SIZE_TINY,
  },

  headerContainer: {
    marginTop: 10,
  },

  day: {
    alignItems: 'center',
  },

  weekday: {
    fontSize: VARIABLES.FONT_SIZE_NANO,
    marginBottom: 7,
    fontWeight: '600',
    fontFamily: FONTS.BOLD,
    color: COLORS.WHITE.alpha(0.6).toString(),
  },

  weekdayToday: {
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.BOLD,
  },

  number: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    color: COLORS.WHITE.alpha(0.6).toString(),
    fontFamily: FONTS.MEDIUM,
  },

  numberToday: {
    color: COLORS.WHITE.toString(),
  },

  numberSelected: {
    color: COLORS.WHITE.toString(),
    fontWeight: '600',
    fontFamily: FONTS.BOLD,
  },

  numberTodaySelected: {
    color: COLORS.RED.toString(),
    fontFamily: FONTS.BOLD,
    textTransform: 'uppercase',
  },

  numberContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  numberContainerToday: {},

  numberContainerSelected: {
    backgroundColor: COLORS.WHITE.alpha(0.25).toString(),
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
  },

  numberContainerTodaySelected: {
    backgroundColor: COLORS.WHITE.toString(),
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
  },
});
