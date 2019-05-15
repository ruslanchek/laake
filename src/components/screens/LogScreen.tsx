import React from 'react';
import { NavigationContainerProps, NavigationEvents, SectionList } from 'react-navigation';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  SectionListData,
  ActivityIndicator,
} from 'react-native';
import { Title } from '../ui/Title';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import { followStore } from 'react-stores';
import { logStore } from '../../stores/logStore';
import Icon from 'react-native-vector-icons/Ionicons';
import { CommonService } from '../../services/CommonService';
import { commonStore } from '../../stores/commonStore';
import { ELogEvent, logManager } from '../../managers/LogManager';
import { localeManager } from '../../managers/LocaleManager';
import Color from 'color';
import { FONTS } from '../../common/fonts';

interface IState {}

interface ISectionData {
  title: string;
  time: string;
  id: string;
  event: ELogEvent;
  courseName: string;
  isLast: boolean;
}

const ICON_SIZE = 24;

@followStore(logStore)
export class LogScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {};

  generateEventTitle(event: ELogEvent): string {
    return event;
  }

  getEventColor(event: ELogEvent): Color {
    switch (event) {
      case ELogEvent.CourseCreated: {
        return COLORS.BLUE;
      }

      case ELogEvent.CourseDeleted: {
        return COLORS.RED;
      }

      case ELogEvent.CourseUpdated: {
        return COLORS.YELLOW;
      }

      case ELogEvent.MedicationTake: {
        return COLORS.GREEN;
      }

      case ELogEvent.MedicationTakeUndo: {
        return COLORS.RED;
      }

      default: {
        return COLORS.RED;
      }
    }
  }

  generateEventIcon(event: ELogEvent, color: Color): React.ReactNode {
    switch (event) {
      case ELogEvent.CourseCreated: {
        return (
          <Icon
            name='ios-add'
            size={ICON_SIZE}
            style={{ top: 0.25, left: 0.25 }}
            color={color.toString()}
          />
        );
      }

      case ELogEvent.CourseDeleted: {
        return (
          <Icon
            name='ios-close'
            size={ICON_SIZE + 3}
            style={{ top: -1.5, left: 0.25 }}
            color={color.toString()}
          />
        );
      }

      case ELogEvent.CourseUpdated: {
        return (
          <Icon
            name='ios-build'
            size={ICON_SIZE - 8}
            style={{ top: 0.75, left: 0.25 }}
            color={color.toString()}
          />
        );
      }

      case ELogEvent.MedicationTakeUndo:
      case ELogEvent.MedicationTake: {
        return (
          <Icon
            name='ios-medical'
            size={ICON_SIZE - 8}
            style={{ top: 0.75, left: 0.25 }}
            color={color.toString()}
          />
        );
      }

      default: {
        return <Icon name='ios-checkmark' size={ICON_SIZE} color={color.toString()} />;
      }
    }
  }

  get sections(): SectionListData<ISectionData>[] {
    const sections: SectionListData<ISectionData>[] = [];
    const { currentLocale } = commonStore.state;
    let index = 0;

    logStore.state.events.forEach(event => {
      const eventDate = new Date(event.date);
      const sectionTitle = CommonService.formatDate(eventDate, currentLocale);
      const section = sections.find(section => section.title === sectionTitle);

      index++;

      const data: ISectionData = {
        title: this.generateEventTitle(event.event),
        time: CommonService.formTime(eventDate, currentLocale),
        id: event.id,
        event: event.event,
        courseName: event.courseName,
        isLast: index === logStore.state.events.size,
      };

      if (section) {
        section.data.push(data);
      } else {
        sections.push({
          title: sectionTitle,
          data: [data],
        });
      }
    });

    return sections;
  }

  handleLoadMore() {
    logManager.getEvents();
  }

  render() {
    const sections = this.sections;

    return (
      <SafeAreaView style={styles.container}>
        <CustomStatusBar barStyle='light-content' />

        <NavigationEvents
          onWillFocus={() => {
            logManager.reinitEvents();
          }}
          onDidBlur={() => {
            logManager.resetEvents();
          }}
        />

        <Title text={localeManager.t('LOG_SCREEN.TITLE')} color={COLORS.WHITE.toString()} />

        <View style={styles.content}>
          {logStore.state.loadingEvents && sections.length === 0 ? (
            <ActivityIndicator color={COLORS.GRAY.toString()} size='large' />
          ) : (
            <SectionList
              initialNumToRender={VARIABLES.LOG_EVENTS_PER_PAGE}
              stickySectionHeadersEnabled={true}
              sections={sections}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionTitle}>
                  <Text style={styles.sectionTitleText}>{title}</Text>
                </View>
              )}
              renderItem={({ item, index, section }) => {
                const color = this.getEventColor(item.event);

                return (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.time}>{item.time}</Text>
                      <View
                        style={[styles.eventPin, { backgroundColor: color.alpha(0.2).toString() }]}
                      >
                        {this.generateEventIcon(item.event, color)}
                      </View>
                    </View>

                    <View style={styles.itemRight}>
                      <Text style={styles.title}>{item.courseName}</Text>
                      <Text style={styles.subtitle}>
                        {localeManager.t(`LOG_EVENT.${String(item.title).toUpperCase()}`)}
                      </Text>
                    </View>

                    {!item.isLast && (
                      <View style={[styles.line, { backgroundColor: color.toString() }]} />
                    )}
                  </View>
                );
              }}
              keyExtractor={(item, index) => {
                return index.toString();
              }}
              // renderSectionFooter={() => {
              //   if (logStore.state.loadingEvents) {
              //     return <ActivityIndicator size='small' color={COLORS.GRAY.toString()} />;
              //   } else {
              //     return null;
              //   }
              // }}
              onEndReachedThreshold={0}
              onEndReached={this.handleLoadMore.bind(this)}
              style={styles.scroll}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: COLORS.BLUE.toString(),
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    width: '100%',
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
  },

  scroll: {
    width: '100%',
  },

  eventPin: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
  },

  sectionTitle: {
    backgroundColor: COLORS.GRAY_PALE_LIGHT.toString(),
    justifyContent: 'center',
    height: 26,
    paddingHorizontal: VARIABLES.PADDING_BIG,
  },

  sectionTitleText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: VARIABLES.FONT_SIZE_TINY,
    color: COLORS.GRAY.toString(),
  },

  itemLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  itemRight: {
    marginLeft: VARIABLES.PADDING_MEDIUM,
    marginTop: 15,
  },

  item: {
    paddingHorizontal: VARIABLES.PADDING_BIG,
    flexDirection: 'row',
    paddingBottom: VARIABLES.PADDING_BIG,
  },

  title: {
    fontFamily: FONTS.BOLD,
    marginBottom: 1,
    fontSize: VARIABLES.FONT_SIZE_SMALL,
  },

  subtitle: {
    fontFamily: FONTS.MEDIUM,
    fontSize: VARIABLES.FONT_SIZE_TINY,
    color: COLORS.GRAY.toString(),
  },

  time: {
    width: 80,
    fontFamily: FONTS.MEDIUM,
    fontSize: VARIABLES.FONT_SIZE_TINY,
    color: COLORS.GRAY.toString(),
  },

  line: {
    width: 4,
    position: 'absolute',
    top: 36.25,
    left: 104,
    bottom: -12.25,
    opacity: 0.075,
  },
});
