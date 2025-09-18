export type Config = {
  baseUrl: string;
  debug: boolean;
  runNegativeCase: boolean;
};

export type UnitTestConfig = {
  mockUser: any;
  mockActivity: string;
};
