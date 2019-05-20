import { Manager } from './Manager';
import { ERouteName } from '../enums/ERouteName';

const IS_PRO = false;

class PurchaseManager extends Manager {
  public reset(): void {}

  public async init(): Promise<any> {
    return Promise.resolve();
  }

  public navigatePro(navigation: any): boolean {
    if (!IS_PRO) {
      navigation.navigate(ERouteName.PurchaseScreen);
      return false;
    }

    return true;
  }
}

export const purchaseManager = new PurchaseManager();
