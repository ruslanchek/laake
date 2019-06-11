import React from 'react';
import {
  createStackNavigator,
  createBottomTabNavigator,
  createAppContainer,
} from 'react-navigation';
import { HomeScreen } from './src/components/screens/HomeScreen';
import { CreateCourseScreen } from './src/components/screens/CreateCourseScreen';
import { StyleSheet, StatusBar } from 'react-native';
import { COLORS } from './src/common/colors';
import { IconWithBadge as TabBarIcon } from './src/components/ui/IconWithBadge';
import { ERouteName } from './src/enums/ERouteName';
import { CourseTypeModal } from './src/components/modals/CourseTypeModal';
import { CourseDurationModal } from './src/components/modals/CourseDurationModal';
import { CourseOftennessModal } from './src/components/modals/CourseOftennessModal';
import { CourseTakeModal } from './src/components/modals/CourseTakeModal';
import { CourseSummaryModal } from './src/components/modals/CourseSummaryModal';
import { Notifications } from './src/components/common/Notifications';
import { FONTS } from './src/common/fonts';
import { managers } from './src/managers/managers';
import { PurchaseScreen } from './src/components/screens/PurchaseScreen';
import { LogScreen } from './src/components/screens/LogScreen';
import { SummaryScreen } from './src/components/screens/SummaryScreen';
import { SettingsScreen } from './src/components/screens/SettingsScreen';
import { SettingsNotificationsModal } from './src/components/modals/SettingsNotificationsModal';

console.disableYellowBox = true;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.WHITE.toString(),
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT.alpha(0.4).toString(),
  },

  tabStyle: {},

  labelStyle: {
    padding: 0,
    margin: 0,
    fontFamily: FONTS.MEDIUM,
  },

  iconStyle: {
    marginLeft: 0,
    padding: 0,
  },
});

const TodayStack = createStackNavigator(
  {
    [ERouteName.Today]: {
      screen: HomeScreen,
    },
    [ERouteName.TodayCreateCourseScreen]: {
      screen: CreateCourseScreen,
    },
    [ERouteName.CourseTypeModal]: {
      screen: CourseTypeModal,
    },
    [ERouteName.CourseTakeModal]: {
      screen: CourseTakeModal,
    },
    [ERouteName.CourseDurationModal]: {
      screen: CourseDurationModal,
    },
    [ERouteName.CourseOftennessModal]: {
      screen: CourseOftennessModal,
    },
    [ERouteName.CourseSummaryModal]: {
      screen: CourseSummaryModal,
    },
    [ERouteName.TodayEditCourseScreen]: {
      screen: CourseSummaryModal,
    },
    [ERouteName.PurchaseScreen]: {
      screen: PurchaseScreen,
    },
  },
  {
    initialRouteName: ERouteName.Today,
    headerMode: 'none',
  },
);

const SettingsStack = createStackNavigator(
  {
    [ERouteName.Settings]: {
      screen: SettingsScreen,
    },
    [ERouteName.SettingsNotificationModal]: {
      screen: SettingsNotificationsModal,
    },
  },
  {
    initialRouteName: ERouteName.Settings,
    headerMode: 'none',
  },
);

const TabNavigator = createBottomTabNavigator(
  {
    [ERouteName.Today]: {
      screen: TodayStack,
    },
    [ERouteName.Summary]: {
      screen: SummaryScreen,
    },
    [ERouteName.Log]: {
      screen: LogScreen,
    },
    // [ERouteName.Settings]: {
    //   screen: SettingsStack,
    // },
  },
  {
    lazy: true,
    initialRouteName: ERouteName.Today,
    tabBarOptions: {
      tabStyle: styles.tabStyle,
      labelStyle: styles.labelStyle,
      iconStyle: styles.iconStyle,
      style: styles.tabBar,
      activeTintColor: COLORS.RED.toString(),
      inactiveTintColor: COLORS.GRAY_LIGHT.toString(),
    },
    animationEnabled: true,
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return (
          <TabBarIcon
            focused={focused}
            routeName={navigation.state.routeName as ERouteName}
            color={tintColor}
          />
        );
      },
    }),
  },
);

const AppContainer = createAppContainer(TabNavigator);

interface IState {
  appLoaded: boolean;
}

export default class App extends React.Component<{}, IState> {
  state = {
    appLoaded: false,
  };

  async componentDidMount() {
    await managers.init();

    this.setState({
      appLoaded: true,
    });
  }

  render() {
    if (!this.state.appLoaded) {
      return null;
    }

    return (
      <>
        <StatusBar animated={true} barStyle='light-content' />
        <AppContainer />
        <Notifications />
      </>
    );
  }
}
