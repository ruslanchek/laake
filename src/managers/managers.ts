import { Manager } from './Manager';
import { firebaseManager } from './FirebaseManager';
import { localeManager } from './LocaleManager';
import { courseManager } from './CourseManager';
import { createCourseManager } from './CreateCourseManager';
import { resourcesManager } from './ResourcesManager';
import { purchaseManager } from './PurchaseManager';
import { logManager } from './LogManager';

export class Managers {
  private managersListTierOne: Manager[] = [firebaseManager, resourcesManager, localeManager];

  private managersListTierTwo: Manager[] = [
    courseManager,
    createCourseManager,
    purchaseManager,
    logManager,
  ];

  public init = async () => {
    await this.initManagers();
  };

  public async reInit() {
    await this.resetManagers();
    await this.init();
  }

  public resetManagers() {
    this.managersListTierOne.forEach(manager => {
      manager.reset();
    });

    this.managersListTierTwo.forEach(manager => {
      manager.reset();
    });
  }

  private async initManagers(): Promise<any> {
    try {
      const promisesTierOne: Promise<any>[] = [];
      const promisesTierTwo: Promise<any>[] = [];

      this.managersListTierOne.forEach(manager => {
        promisesTierOne.push(manager.init());
      });

      await Promise.all(promisesTierOne);

      this.managersListTierTwo.forEach(manager => {
        promisesTierTwo.push(manager.init());
      });

      await Promise.all(promisesTierTwo);
    } catch (e) {
      firebaseManager.logError(238749, e);
    }
  }
}

export const managers = new Managers();
