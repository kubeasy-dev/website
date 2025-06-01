export type UuidType = string;
export type BigIntType = BigInt;
export type DateType = Date;

export interface DynamicValidationStatus {
  resources?: {
    target: {
      apiVersion: string;
      kind: string;
      name: string;
    };
    checkResults: {
      kind: string;
      status: string;
      message?: string;
    }[];
  }[];
  lastChecked?: {
    Time: DateType;
  };
  error?: string;
  allPassed: boolean;
}

export interface StaticValidationStatus {
  resources?: {
    target: {
      apiVersion: string;
      kind: string;
      name: string;
    };
    ruleResults: {
      rule: string;
      status: string;
      message?: string;
    }[];
  }[];
  lastChecked?: {
    Time: DateType;
  };
  error?: string;
  allPassed: boolean;
}
