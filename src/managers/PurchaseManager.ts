import { Manager } from './Manager';

class PurchaseManager extends Manager {
  public reset(): void {}

  public async init(): Promise<any> {
    return Promise.resolve();
  }
}

export const resourcesManager = new PurchaseManager();
