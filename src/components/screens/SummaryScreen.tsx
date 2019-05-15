import React from 'react';
import { NavigationContainerProps, NavigationEvents } from 'react-navigation';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { Title } from '../ui/Title';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import { StatisticsInfoBlock } from '../ui/StatisticsInfoBlock';
import { Progress } from '../ui/Progress';

interface IState {}

export class SummaryScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {};

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <CustomStatusBar barStyle='dark-content' />
        <NavigationEvents
          onDidFocus={() => {
            this.forceUpdate();
          }}
        />
        <Title color={COLORS.BLACK.toString()} text='Summary' />

        <View style={styles.item}>
          <Progress
            strokeWidth={6}
            size={80}
            color={COLORS.RED.toString()}
            percent={35}
            showPercentage={true}
          />
        </View>
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
  },

  item: {
    elevation: 1,
    shadowColor: COLORS.GRAY_PALE_LIGHT.toString(),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    backgroundColor: COLORS.WHITE.toString(),
    borderRadius: 6,
    flex: 1,
    flexGrow: 1,
    margin: VARIABLES.PADDING_BIG,
    padding: VARIABLES.PADDING_BIG,
  },
});
