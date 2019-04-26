import React from 'react';
import { View, StyleSheet, StatusBar, Text, Animated } from 'react-native';
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
import { CommonService } from '../../services/CommonService';
import { commonStore } from '../../stores/commonStore';
import {
  ITake,
  TAKE_DOSAGE_LIST,
  TAKE_DOSAGE_PART_LIST,
  ETakeDosageUnit,
  ETakeTerm,
  takeTermNames,
  takeDosageUnitNames,
} from '../../common/take';
import { ModalHeader } from '../blocks/ModalHeader';
import { ICONS } from '../../common/icons';
import { localeManager } from '../../managers/LocaleManager';
import { courseManager } from '../../managers/CourseManager';

interface IState {
  take: ITake | null;
}

type TTime = {
  hours: number;
  minutes: number;
};

@followStore(createCourseStore)
export class CourseTakeModal extends React.Component<
  NavigationContainerProps<{ test: string }>,
  IState
> {
  state: IState = {
    take: null,
  };

  componentWillMount() {
    if (this.props.navigation) {
      this.setState({
        take: { ...createCourseStore.state.takes[this.takeIndex] },
      });
    }
  }

  render() {
    if (!this.state.take) {
      return null;
    }

    const { hours, minutes, term, dosage, dosagePart, dosageUnits } = this.state.take;

    return (
      <SafeAreaView style={[styles.container, GLOBAL_STYLES.SAFE_AREA]}>
        <StatusBar
          animated={true}
          backgroundColor={COLORS.WHITE.toString()}
          barStyle='dark-content'
        />
        <Header title={localeManager.t('COMMON.BACK')} next={null} theme={EHeaderTheme.Dark} />
        <View style={GLOBAL_STYLES.MODAL_SCROLL_VIEW}>
          <View style={styles.content}>
            <ModalHeader
              scrollTop={VARIABLES.ANIMATED_VALUE_ZERO}
              icon={ICONS.TAKE}
              title={localeManager.t(courseManager.getTakeNumber(this.takeIndex))}
              description={localeManager.t('TAKE.DESCRIPTION')}
            />
            <FormRow>
              <FormCol width='100%'>
                <View style={[GLOBAL_STYLES.INPUT_CONTAINER, GLOBAL_STYLES.SELECT_GROUP]}>
                  <FormSelect<TTime>
                    width='50%'
                    items={this.times}
                    value={{
                      hours,
                      minutes,
                    }}
                    onChange={this.handleChangeTime}
                    serialize
                  />
                  <FormSelect<ETakeTerm>
                    width='50%'
                    items={CommonService.generateSelectItemsFromEnumMap<ETakeTerm>(takeTermNames)}
                    value={term}
                    onChange={this.handleChangeTerm}
                  />
                </View>
              </FormCol>
            </FormRow>
            <FormRow>
              <FormCol width='100%'>
                <View style={[GLOBAL_STYLES.INPUT_CONTAINER, GLOBAL_STYLES.SELECT_GROUP]}>
                  <FormSelect<number>
                    width='30%'
                    items={this.dosages}
                    value={dosage}
                    onChange={this.handleChangeDosage}
                  />
                  <FormSelect<number>
                    width='30%'
                    items={this.dosageParts}
                    value={dosagePart}
                    onChange={this.handleChangeDosagePart}
                  />
                  <FormSelect<ETakeDosageUnit>
                    width='40%'
                    items={CommonService.generateSelectItemsFromEnumMap<ETakeDosageUnit>(
                      takeDosageUnitNames,
                      dosage,
                    )}
                    value={dosageUnits}
                    onChange={this.handleChangeDosageUnits}
                  />
                </View>
              </FormCol>
            </FormRow>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  get takeIndex(): number {
    return this.props.navigation ? this.props.navigation.getParam('takeIndex') : null;
  }

  get times(): IFormSelectItem<TTime>[] {
    const result: IFormSelectItem<TTime>[] = [];

    CommonService.times(48, (i: number) => {
      let hours: number = Math.floor(i / 2);
      let minutes: number = 0;

      if (i % 2 === 0) {
        minutes = 0;
      } else {
        minutes = 30;
      }

      const date = new Date();

      date.setHours(hours);
      date.setMinutes(minutes);

      result.push({
        value: {
          hours,
          minutes,
        },
        title: date.toLocaleTimeString(commonStore.state.currentLocale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    });

    return result;
  }

  get dosages(): IFormSelectItem<number>[] {
    return TAKE_DOSAGE_LIST.map(item => {
      return {
        value: item,
        title: item.toLocaleString(commonStore.state.currentLocale),
      };
    });
  }

  get dosageParts(): IFormSelectItem<number>[] {
    return TAKE_DOSAGE_PART_LIST.map(item => {
      return {
        value: item,
        title: CommonService.convertDosagePartToString(item),
      };
    });
  }

  handleChangeTime = (time: TTime) => {
    const { take } = this.state;

    if (take) {
      take.hours = time.hours;
      take.minutes = time.minutes;

      this.setState({
        take,
      });

      this.handleSave();
    }
  };

  handleChangeTerm = (term: ETakeTerm) => {
    const { take } = this.state;

    if (take) {
      take.term = term;

      this.setState({
        take,
      });

      this.handleSave();
    }
  };

  handleChangeDosage = (dosage: number) => {
    const { take } = this.state;

    if (take) {
      if (take.dosagePart === 0 && dosage === 0) {
        dosage = 1;
      }

      take.dosage = dosage;

      this.setState({
        take,
      });

      this.handleSave();
    }
  };

  handleChangeDosagePart = (dosagePart: number) => {
    const { take } = this.state;

    if (take) {
      take.dosagePart = dosagePart;

      if (dosagePart === 0 && take.dosage === 0) {
        take.dosage = 1;
      }

      this.setState({
        take,
      });

      this.handleSave();
    }
  };

  handleChangeDosageUnits = (dosageUnits: ETakeDosageUnit) => {
    const { take } = this.state;

    if (take) {
      take.dosageUnits = dosageUnits;

      this.setState({
        take,
      });

      this.handleSave();
    }
  };

  handleSave() {
    const { take } = this.state;
    const { takes } = createCourseStore.state;

    if (isFinite(this.takeIndex) && take) {
      const takesNew = [...takes];
      takesNew[this.takeIndex] = { ...take };

      createCourseStore.setState({
        takes: takesNew,
      });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
  },

  content: {
    paddingLeft: VARIABLES.PADDING_BIG,
    paddingRight: VARIABLES.PADDING_BIG,
    flex: 1,
    justifyContent: 'center',
  },

  divider: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  dividerText: {
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
  },
});
