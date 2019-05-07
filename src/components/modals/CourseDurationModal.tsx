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
import { EPeriodType, periodTypeNames } from '../../common/periods';
import { ModalHeader } from '../blocks/ModalHeader';
import { ICONS } from '../../common/icons';
import { localeManager } from '../../managers/LocaleManager';
import { CommonService } from '../../services/CommonService';
import { commonStore } from '../../stores/commonStore';
import { startOfDay } from 'date-fns';
import { courseManager } from '../../managers/CourseManager';
import { CustomStatusBar } from '../ui/CustomStatusBar';

interface IState {
  period: number;
  periodType: EPeriodType;
}

@followStore(createCourseStore)
export class CourseDurationModal extends React.Component<NavigationContainerProps, IState> {
  state: IState = {
    period: createCourseStore.state.period,
    periodType: createCourseStore.state.periodType,
  };

  render() {
    const { period, periodType } = this.state;

    return (
      <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <CustomStatusBar barStyle='dark-content' />
        <Header title={localeManager.t('COMMON.BACK')} next={null} theme={EHeaderTheme.Dark} />
        <View style={GLOBAL_STYLES.MODAL_SCROLL_VIEW}>
          <View style={styles.content}>
            <ModalHeader
              scrollTop={VARIABLES.ANIMATED_VALUE_ZERO}
              icon={ICONS.CLOCKS}
              title={localeManager.t('COURSE_DURATION_MODAL.HEADER')}
              description={localeManager.t('COURSE_DURATION_MODAL.DESCRIPTION')}
            />
            <FormRow>
              <FormCol width='100%'>
                <View style={[GLOBAL_STYLES.INPUT_CONTAINER, GLOBAL_STYLES.SELECT_GROUP]}>
                  <FormSelect<number>
                    width='50%'
                    items={this.periodSelectItems}
                    value={period}
                    onChange={this.handleChangePeriod}
                  />
                  <FormSelect<EPeriodType>
                    width='50%'
                    items={CommonService.generateSelectItemsFromEnumMap<EPeriodType>(
                      periodTypeNames,
                      period,
                    )}
                    value={periodType}
                    onChange={this.handleChangePeriodType}
                  />
                </View>
              </FormCol>
            </FormRow>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  get periodSelectItems(): IFormSelectItem<number>[] {
    return CommonService.times(31, (i: number) => {
      const number = i + 1;

      return {
        value: number,
        title: number.toLocaleString(commonStore.state.currentLocale),
      };
    });
  }

  handleChangePeriod = (period: number) => {
    this.setState(
      {
        period,
      },
      () => {
        this.handleSave();
      },
    );
  };

  handleChangePeriodType = (periodType: EPeriodType) => {
    this.setState(
      {
        periodType,
      },
      () => {
        this.handleSave();
      },
    );
  };

  handleSave() {
    const { period, periodType } = this.state;

    createCourseStore.setState({
      period,
      periodType,
    });

    const startDate = startOfDay(new Date());
    const endDate = courseManager.getCourseEndDate(startDate);

    createCourseStore.setState({
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
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
