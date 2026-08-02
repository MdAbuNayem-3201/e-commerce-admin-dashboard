export type AttributeType =
  | "TEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "COLOR"
  | "SELECT"
  | "MULTISELECT";

export interface AttributeValue {
  id: string;
  value: string;
  slug: string;
  referenceValue?: string | null;
  attributeId: string;
}

export interface Attribute {
  id: string;
  name: string;
  slug: string;
  type: AttributeType;
  description?: string | null;
  isRequired?: boolean;
  _count?: {
    values: number;
  };
  values?: AttributeValue[];
}
