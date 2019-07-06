import React from 'react';
import firebase from 'react-native-firebase';
import { followStore } from 'react-stores';
import { commonStore } from '../../stores/commonStore';
import { Platform, View, StyleSheet } from 'react-native';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';

const { AdRequest, Banner } = (firebase as any).admob;

interface IProps {
  isPro: boolean;
}

interface IState {
  request: typeof AdRequest;
}

export class AdBanner extends React.PureComponent<IProps, IState> {
  state = {
    request: new AdRequest().addTestDevice('B573ED30AB3AFFAAF169CA4790DC4C0C'),
  };

  render() {
    if (!this.props.isPro) {
      const { request } = this.state;

      // @ts-ignore
      if (request) {
        return (
          <View style={styles.root}>
            <Banner unitId={this.bannerId} request={request.build()} size={'SMART_BANNER'} />
          </View>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  get bannerId() {
    if (Platform.OS === 'ios') {
      return VARIABLES.BANNER_ID_IOS;
    } else {
      return VARIABLES.BANNER_ID_ANDROID;
    }
  }
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.WHITE.toString(),
    alignItems: 'center',
  },
});
