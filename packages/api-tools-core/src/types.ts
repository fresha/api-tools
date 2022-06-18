export type JSONPrimitive = null | boolean | number | string;

export type JSONValue = JSONPrimitive | JSONArray | JSONObject;

export type JSONArray = JSONValue[];

export type JSONObject = {
  [key: string]: JSONValue;
};

export type Nullable<T> = T | null;

export type CommonMarkString = string;

export type URLString = string;

export type EmailString = string;

export type VersionString = string;
