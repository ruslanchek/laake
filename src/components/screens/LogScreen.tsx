import React from 'react';
import { NavigationContainerProps, NavigationEvents, SectionList } from 'react-navigation';
import { StyleSheet, SafeAreaView, View, Text, SectionListData } from 'react-native';
import { Title } from '../ui/Title';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import { followStore } from 'react-stores';
import { logStore } from '../../stores/logStore';
import Icon from 'react-native-vector-icons/Ionicons';
import { CommonService } from '../../services/CommonService';
import { commonStore } from '../../stores/commonStore';
import { ELogEvent } from '../../managers/LogManager';

interface IState {}

interface ISectionData {
  title: string;
  time: string;
  id: string;
  event: ELogEvent;
}

@followStore(logStore)
export class LogScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {};

  generateEventTitle(event: ELogEvent): string {
    return event;
  }

  generateEventIcon(event: ELogEvent): React.ReactNode {
    switch (event) {
      case ELogEvent.CourseCreated: {
        return <Icon name='ios-add' size={25} color={COLORS.BLUE.toString()} />;
      }

      case ELogEvent.CourseDeleted: {
        return <Icon name='ios-close' size={25} color={COLORS.RED.toString()} />;
      }

      case ELogEvent.MedicationTake: {
        return <Icon name='ios-close' size={25} color={COLORS.RED.toString()} />;
      }

      case ELogEvent.MedicationTakeUndo: {
        return <Icon name='ios-checkmark' size={25} color={COLORS.RED.toString()} />;
      }

      default: {
        return <Icon name='ios-checkmark' size={25} color={COLORS.RED.toString()} />;
      }
    }
  }

  get sections(): SectionListData<ISectionData>[] {
    const sections: SectionListData<ISectionData>[] = [];
    const { currentLocale } = commonStore.state;

    logStore.state.events.forEach(event => {
      const eventDate = new Date(event.date);
      const sectionTitle = CommonService.formatDate(eventDate, currentLocale);
      const section = sections.find(section => section.title === sectionTitle);
      const data: ISectionData = {
        title: this.generateEventTitle(event.event),
        time: CommonService.formTime(eventDate, currentLocale),
        id: event.id,
        event: event.event,
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

  render() {
    const sections = this.sections;

    return (
      <SafeAreaView style={styles.container}>
        <CustomStatusBar barStyle='dark-content' />

        <View style={styles.header}>
          <Title text='Log' />
        </View>

        <SectionList
          initialNumToRender={100}
          stickySectionHeadersEnabled={true}
          sections={sections}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionTitle}>
              <Text>{title}</Text>
            </View>
          )}
          renderItem={({ item, index, section }) => {
            return (
              <View key={item.id} style={styles.item}>
                {this.generateEventIcon(item.event)}
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            );
          }}
          style={styles.scroll}
          contentContainerStyle={styles.content}
        />
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

  sectionTitle: {
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
    justifyContent: 'center',
    height: 20,
  },

  header: {
    marginTop: VARIABLES.PADDING_BIG,
    paddingHorizontal: VARIABLES.PADDING_BIG,
    flexShrink: 1,
    height: 40,
  },

  content: {
    paddingVertical: VARIABLES.PADDING_BIG,
    paddingHorizontal: VARIABLES.PADDING_BIG,
  },

  scroll: {
    width: '100%',
  },

  item: {
    marginTop: VARIABLES.PADDING_BIG,
  },

  title: {},

  time: {},
});
