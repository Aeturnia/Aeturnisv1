export interface IService {
  initialize?(): Promise<void>;
  destroy?(): void | Promise<void>;
  getName?(): string;
}