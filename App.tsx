import React from 'react';
// import {
//   createStackNavigator,
//   createBottomTabNavigator,
//   createAppContainer,
// } from 'react-navigation';
// import { HomeScreen } from './src/components/screens/HomeScreen';
// import { CreateCourseScreen } from './src/components/screens/CreateCourseScreen';
// import { StyleSheet } from 'react-native';
// import { COLORS } from './src/common/colors';
// import { IconWithBadge as TabBarIcon } from './src/components/ui/IconWithBadge';
// import { ERouteName } from './src/enums/ERouteName';
// import { CourseTypeModal } from './src/components/modals/CourseTypeModal';
// import { CourseDurationModal } from './src/components/modals/CourseDurationModal';
// import { CourseOftennessModal } from './src/components/modals/CourseOftennessModal';
// import { CourseTakeModal } from './src/components/modals/CourseTakeModal';
// import { CourseSummaryModal } from './src/components/modals/CourseSummaryModal';
// import { Notifications } from './src/components/common/Notifications';
// import { FONTS } from './src/common/fonts';
import Icon from 'react-native-vector-icons/Ionicons';

// const styles = StyleSheet.create({
//   tabBar: {
//     backgroundColor: COLORS.WHITE.toString(),
//     borderTopWidth: 1,
//     borderTopColor: COLORS.GRAY_LIGHT.alpha(0.4).toString(),
//   },

//   tabStyle: {},

//   labelStyle: {
//     padding: 0,
//     margin: 0,
//     fontFamily: FONTS.MEDIUM,
//   },

//   iconStyle: {
//     marginLeft: 0,
//     padding: 0,
//   },
// });

// const TodayStack = createStackNavigator(
//   {
//     [ERouteName.Today]: {
//       screen: HomeScreen,
//     },
//     [ERouteName.TodayCreateCourseScreen]: {
//       screen: CreateCourseScreen,
//     },
//     [ERouteName.CourseTypeModal]: {
//       screen: CourseTypeModal,
//     },
//     [ERouteName.CourseTakeModal]: {
//       screen: CourseTakeModal,
//     },
//     [ERouteName.CourseDurationModal]: {
//       screen: CourseDurationModal,
//     },
//     [ERouteName.CourseOftennessModal]: {
//       screen: CourseOftennessModal,
//     },
//     [ERouteName.CourseSummaryModal]: {
//       screen: CourseSummaryModal,
//     },
//     [ERouteName.TodayEditCourseScreen]: {
//       screen: CourseSummaryModal,
//     },
//   },
//   {
//     initialRouteName: ERouteName.Today,
//     mode: 'card',
//     headerMode: 'none',
//   },
// );

// const TabNavigator = createBottomTabNavigator(
//   {
//     [ERouteName.Today]: {
//       screen: TodayStack,
//     },
//     [ERouteName.Summary]: {
//       screen: TodayStack,
//     },
//     [ERouteName.Log]: {
//       screen: TodayStack,
//     },
//     [ERouteName.Settings]: {
//       screen: TodayStack,
//     },
//   },
//   {
//     lazy: true,
//     initialRouteName: ERouteName.Today,
//     tabBarOptions: {
//       tabStyle: styles.tabStyle,
//       labelStyle: styles.labelStyle,
//       iconStyle: styles.iconStyle,
//       style: styles.tabBar,
//       activeTintColor: COLORS.RED.toString(),
//       inactiveTintColor: COLORS.GRAY_LIGHT.toString(),
//     },
//     animationEnabled: true,
//     defaultNavigationOptions: ({ navigation }) => ({
//       tabBarIcon: ({ focused, horizontal, tintColor }) => {
//         return (
//           <TabBarIcon
//             focused={focused}
//             routeName={navigation.state.routeName as ERouteName}
//             color={tintColor}
//           />
//         );
//       },
//     }),
//   },
// );

// const AppContainer = createAppContainer(TabNavigator);

export default class App extends React.Component {
  render() {
    return (
      <>
        {/* <AppContainer /><Icon name="rocket" size={30} color="#900" />
        <Notifications /> */}
      </>
    );
  }
}
