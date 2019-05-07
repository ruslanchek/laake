import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainerProps, SafeAreaView } from 'react-navigation';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { EHeaderTheme, Header } from '../common/Header';
import { followStore } from 'react-stores';
import { createCourseStore } from '../../stores/createCourseStore';
import { FormRow } from '../ui/FormRow';
import { FormCol } from '../ui/FormCol';
import { GLOBAL_STYLES } from '../../common/styles';
import { FormSelect, IFormSelectItem } from '../ui/FormSelect';
import { ETimesPer, timesPerNames } from '../../common/times';
import { ModalHeader } from '../blocks/ModalHeader';
import { ICONS } from '../../common/icons';
import { localeManager } from '../../managers/LocaleManager';
import { createCourseManager } from '../../managers/CreateCourseManager';
import { CommonService } from '../../services/CommonService';
import { commonStore } from '../../stores/commonStore';
import { CustomStatusBar } from '../ui/CustomStatusBar';

interface IState {
  times: number;
  timesPer: ETimesPer;
}

@followStore(createCourseStore)
export class CourseOftennessModal extends React.Component<
  NavigationContainerProps<{ test: string }>,
  IState
> {
  state: IState = {
    times: createCourseStore.state.times,
    timesPer: createCourseStore.state.timesPer,
  };

  render() {
    const { times, timesPer } = this.state;

    return (
      <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <CustomStatusBar barStyle='dark-content' />
        <Header title={localeManager.t('COMMON.BACK')} next={null} theme={EHeaderTheme.Dark} />
        <View style={GLOBAL_STYLES.MODAL_SCROLL_VIEW}>
          <View style={styles.content}>
            <ModalHeader
              scrollTop={VARIABLES.ANIMATED_VALUE_ZERO}
              icon={ICONS.OFTENNESS}
              title={localeManager.t('COURSE_OFTENNESS_MODAL.HEADER')}
              description={localeManager.t('COURSE_OFTENNESS_MODAL.DESCRIPTION')}
            />
            <FormRow>
              <FormCol width='100%'>
                <View style={[GLOBAL_STYLES.INPUT_CONTAINER, GLOBAL_STYLES.SELECT_GROUP]}>
                  <FormSelect<number>
                    width='50%'
                    items={this.timesSelectItems}
                    value={times}
                    onChange={this.handleChangeTimes}
                  />
                  <FormSelect<ETimesPer>
                    width='50%'
                    items={CommonService.generateSelectItemsFromEnumMap<ETimesPer>(timesPerNames)}
                    value={timesPer}
                    onChange={this.handleChangeTimesPer}
                  />
                </View>
              </FormCol>
            </FormRow>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  get timesSelectItems(): IFormSelectItem<number>[] {
    return CommonService.times(VARIABLES.MAX_TAKES_PER_DAY, (i: number) => {
      const number = i + 1;

      return {
        value: number,
        title: localeManager.t('TIMES.TIMES', {
          value: number.toLocaleString(commonStore.state.currentLocale),
          count: number,
        }),
      };
    });
  }

  handleChangeTimes = (times: number) => {
    this.setState(
      {
        times,
      },
      () => {
        this.handleSave();
        createCourseManager.generateDefaultTakeEntities();
      },
    );
  };

  handleChangeTimesPer = (timesPer: ETimesPer) => {
    this.setState(
      {
        timesPer,
      },
      () => {
        this.handleSave();
      },
    );
  };

  handleSave() {
    const { times, timesPer } = this.state;

    createCourseStore.setState({
      times,
      timesPer,
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: VARIABLES.PADDING_BIG,
    paddingRight: VARIABLES.PADDING_BIG,
  },
});
