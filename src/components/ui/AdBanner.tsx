import React from 'react';
import firebase from 'react-native-firebase';
import { Platform, View, StyleSheet, Dimensions, Alert } from 'react-native';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';

const { AdRequest, Banner } = (firebase as any).admob;
const { width } = Dimensions.get('window');

interface IProps {
  isPro: boolean;
  height: number;
}

interface IState {
  request: typeof AdRequest;
}

export class AdBanner extends React.PureComponent<IProps, IState> {
  state = {
    request: new AdRequest().addTestDevice('B573ED30AB3AFFAAF169CA4790DC4C0C'),
  };

  render() {
    const { isPro, height } = this.props;

    if (!isPro) {
      const { request } = this.state;

      // @ts-ignore
      if (request) {
        return (
          <View style={styles.root}>
            <Banner
              unitId={this.bannerId}
              request={request.build()}
              size={`${Math.round(width)}x${height}`}
            />
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

const styles: { [key: string]: any } = StyleSheet.create({
  root: {
    backgroundColor: COLORS.WHITE.toString(),
    alignItems: 'center',
  },
});
