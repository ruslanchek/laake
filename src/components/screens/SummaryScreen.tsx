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

interface IState {
  notifications: Notification[];
}

export class SummaryScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    notifications: [],
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <CustomStatusBar barStyle='dark-content' />
        <NavigationEvents
          onDidFocus={async () => {
            const notifications = await firebase.notifications().getScheduledNotifications();

            this.setState({
              notifications,
            });
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
                  percent={35}
                  showPercentage={true}
                />
              }
            />

            <SummaryItem
              title='Total courses'
              subtitle='Compared to each completed'
              right={<Label>2/3</Label>}
            />

            <SummaryItem title='Medication taken' subtitle='All time' right={<Label>341</Label>} />

            <SummaryItem
              title='Days'
              subtitle='Which you take any medications'
              right={<Label>71</Label>}
            />

            <SummaryItem title='Skipped' subtitle='Medication takes' right={<Label>3</Label>} />

            <SummaryItem title='Units' subtitle='Taken overall' right={<Label>560</Label>} />

            {/* <SummaryItem
              title='Days'
              subtitle='Which you take any medications'
              right={<Label>71</Label>}
            />

            <SummaryItem
              title='Days'
              subtitle='Which you take any medications'
              right={<Label>71</Label>}
            /> */}
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
