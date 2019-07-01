import React from 'react';
import firebase from 'react-native-firebase';
import { followStore } from 'react-stores';
import { commonStore } from '../../stores/commonStore';
import { Platform, View, StyleSheet } from 'react-native';
import { COLORS } from '../../common/colors';

const { AdRequest, Banner } = (firebase as any).admob;

const BANNER_ID_IOS = 'ca-app-pub-7561063360856843/4274015331';
const BANNER_ID_ANDROID = 'ca-app-pub-7561063360856843/7248088061';

interface IProps {}

interface IState {
  request: typeof AdRequest;
}

@followStore(commonStore)
export class AdBanner extends React.PureComponent<IProps, IState> {
  state = {
    request: new AdRequest(),
  };

  render() {
    if (!commonStore.state.isPro) {
      const { request } = this.state;

      // @ts-ignore
      console.log('request', request);

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
      return BANNER_ID_IOS;
    } else {
      return BANNER_ID_ANDROID;
    }
  }
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.WHITE.toString(),
    alignItems: 'center',
  },
});
