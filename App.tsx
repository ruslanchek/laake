import React from 'react';
import {
  createStackNavigator,
  createBottomTabNavigator,
  createAppContainer,
} from 'react-navigation';
import { Text } from 'react-native';
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
import { localeManager } from './src/managers/LocaleManager';
import { VARIABLES } from './src/common/variables';
import { followStore } from 'react-stores';
import { commonStore } from './src/stores/commonStore';

console.disableYellowBox = true;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.WHITE.toString(),
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT.alpha(0.4).toString(),
  },

  tabStyle: {
    top: -1,
  },

  labelStyle: {
    padding: 0,
    margin: 0,
    fontFamily: FONTS.MEDIUM,
    fontSize: VARIABLES.FONT_SIZE_TINY,
    color: COLORS.GRAY.toString(),
    textAlign: 'center',
  },

  labelStyleFocused: {
    color: COLORS.RED.toString(),
  },

  labelStyleFocusedPro: {
    color: COLORS.CYAN.darken(0.12).toString(),
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
    [ERouteName.PurchaseScreen]: {
      screen: PurchaseScreen,
    },
  },
  {
    lazy: true,
    initialRouteName: ERouteName.Today,
    tabBarOptions: {
      tabStyle: styles.tabStyle,
      iconStyle: styles.iconStyle,
      style: styles.tabBar,
      activeTintColor: COLORS.RED.toString(),
      inactiveTintColor: COLORS.GRAY_LIGHT.toString(),
    },
    animationEnabled: true,
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarLabel: ({ focused }) => {
        return getRouteLabel(focused, navigation.state.routeName);
      },
      tabBarIcon: ({ focused, tintColor }) => {
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

function getRouteLabel(focused: boolean, routeName: string) {
  return (
    <Text
      style={[
        styles.labelStyle,
        focused
          ? routeName === ERouteName.PurchaseScreen
            ? styles.labelStyleFocusedPro
            : styles.labelStyleFocused
          : null,
      ]}
    >
      {localeManager.t(`ROUTE_NAMES.${routeName}`)}
    </Text>
  );
}

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
