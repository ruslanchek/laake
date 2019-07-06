import React from 'react';
import { NavigationContainerProps, NavigationEvents, ScrollView } from 'react-navigation';
import { StyleSheet, SafeAreaView, View, Text, Animated } from 'react-native';
import { Title } from '../ui/Title';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { CustomStatusBar } from '../ui/CustomStatusBar';
import firebase from 'react-native-firebase';
import { FormRow } from '../ui/FormRow';
import { FormCol } from '../ui/FormCol';
import { FormEntitiesInput } from '../ui/FormEntitiesInput';
import { FormBooleanInput } from '../ui/FormBooleanInput';
import { ERouteName } from '../../enums/ERouteName';
import { firebaseManager } from '../../managers/FirebaseManager';

interface IState {
  enabled: boolean;
}

export class SettingsScreen extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    enabled: false,
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <CustomStatusBar
          barStyle='dark-content'
          color={COLORS.GRAY_ULTRA_LIGHT.toString()}
          translucent
        />
        <NavigationEvents
          onDidFocus={async () => {
            firebaseManager.loadAds();
          }}
        />

        <ScrollView style={styles.scroll}>
          <Title
            color={COLORS.BLACK.toString()}
            text='Settings'
            backgroundColor={COLORS.GRAY_ULTRA_LIGHT.toString()}
          />

          <View style={styles.content}>
            <FormRow>
              <FormCol width='100%'>
                <FormEntitiesInput
                  border={false}
                  borderRadiusTop
                  borderRadiusBottom
                  useWrapper
                  onPress={() => {
                    if (this.props.navigation) {
                      this.props.navigation.navigate(ERouteName.SettingsNotificationModal);
                    }
                  }}
                  items={`Notifications`}
                  label={'Debug'}
                  placeholder='Select '
                />
              </FormCol>
            </FormRow>

            <FormRow>
              <FormCol width='100%'>
                <FormEntitiesInput
                  border={false}
                  borderRadiusTop
                  borderRadiusBottom
                  useWrapper
                  onPress={() => {}}
                  items={`Courses`}
                  label={'Archived and active'}
                  placeholder='Select '
                />
              </FormCol>
            </FormRow>

            <FormRow>
              <FormCol width='100%'>
                <FormBooleanInput
                  enabled={this.state.enabled}
                  onChange={enabled => {
                    this.setState({
                      enabled,
                    });
                  }}
                  title={`Courses`}
                  label={'Archived and active'}
                />
              </FormCol>
            </FormRow>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles : {[key: string]: any} = StyleSheet.create({
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
