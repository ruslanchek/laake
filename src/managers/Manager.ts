export abstract class Manager {
  public abstract init<IManagerInitialisationResult>(): Promise<IManagerInitialisationResult>;

  public abstract reset(): void;
}
