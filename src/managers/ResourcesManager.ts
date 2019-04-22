import { Manager } from './Manager';
import { FONTS } from '../common/fonts';

class ResourcesManager extends Manager {
  public reset(): void {}

  public async init(): Promise<any> {
    const images = [
      require('../assets/icons/Clocks.png'),
      require('../assets/icons/Oftenness.png'),
      require('../assets/icons/Summary.png'),
      require('../assets/icons/Take.png'),
      require('../assets/icons/Pill.png'),
      require('../assets/icons/Create.png'),
      require('../assets/icons/Edit.png'),

      require('../assets/pills/1.png'),
      require('../assets/pills/2.png'),
      require('../assets/pills/3.png'),
      require('../assets/pills/4.png'),
      require('../assets/pills/5.png'),
      require('../assets/pills/6.png'),
      require('../assets/pills/7.png'),

      require('../assets/bg/1.png'),
    ];

    // const cacheImages = images.map(image => {
    //   return Asset.fromModule(image).downloadAsync();
    // });

    // const cacheFonts = Font.loadAsync({
    //   [FONTS.LIGHT]: require('../assets/fonts/Quicksand-Light.ttf'),
    //   [FONTS.BOLD]: require('../assets/fonts/Quicksand-Bold.ttf'),
    //   [FONTS.MEDIUM]: require('../assets/fonts/Quicksand-Medium.ttf'),
    //   [FONTS.REGULAR]: require('../assets/fonts/Quicksand-Regular.ttf'),
    // });

    // return Promise.all([cacheImages, cacheFonts]);

    return Promise.resolve();
  }
}

export const resourcesManager = new ResourcesManager();
