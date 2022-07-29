import type { DateTimeString, HTTPMethod } from '@fresha/api-tools-core';

//
// HAR specification
// Based on http://www.softwareishard.com/blog/har-12-spec/
//

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#creator
 */
export type HARCreator = {
  name: string;
  version: string;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#browser
 */
export type HARBrowser = {
  name: string;
  version: string;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#pageTimings
 */
export type HARPageTimings = {
  onContentLoad?: number;
  onLoad?: number;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#pages
 */
export type HARPage = {
  startedDateTime: DateTimeString;
  id: string;
  title: string;
  pageTimings: HARPageTimings;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#cookies
 */
export type HARCookie = {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: DateTimeString;
  httpOnly?: boolean;
  secure?: boolean;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#headers
 */
export type HARHeader = {
  name: string;
  value: string;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#queryString
 */
export type HARQueryString = {
  name: string;
  value: string;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#params
 */
export type HARParam = {
  name: string;
  value?: string;
  fileName?: string;
  contentType?: string;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#postData
 */
export type HARPostData = {
  mimeType: string;
  params: HARParam[];
  text: string;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#request
 */
export type HARRequest = {
  method: HTTPMethod;
  url: string;
  httpVersion: string;
  cookies: HARCookie[];
  headers: HARHeader[];
  queryString: HARQueryString[];
  postData?: HARPostData;
  headerSize: number;
  bodySize: number;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#content
 */
export type HARContent = {
  size: number;
  compression?: number;
  mimeType: string;
  text?: string;
  encoding?: string;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#response
 */
export type HARResponse = {
  status: number;
  statusText: string;
  httpVersion: string;
  cookies: HARCookie[];
  headers: HARHeader[];
  content: HARContent;
  redirectURL: string;
  headersSize: number;
  bodySize: number;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#cache
 */
export type HARCacheState = {
  expires?: DateTimeString;
  lastAccess?: DateTimeString;
  eTag: string;
  hitCount: number;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#cache
 */
export type HARCache = {
  beforeRequest?: HARCacheState;
  afterRequest?: HARCacheState;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#timings
 */
export type HARTimings = {
  blocked?: number;
  dns?: number;
  connect?: number;
  send: number;
  wait: number;
  receive: number;
  ssl?: number;
  comment?: string;
};

export type IPAddrString = string;

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#entries
 */
export type HARLogEntry = {
  pageref?: string;
  startedDateTime: DateTimeString;
  time: number;
  request: HARRequest;
  response: HARResponse;
  cache: HARCache;
  timings: HARTimings;
  serverIPAddress?: IPAddrString;
  connection?: string;
  comment?: string;
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/#log
 */
export type HARLog = {
  version: string;
  creator: HARCreator;
  browser: HARBrowser;
  pages: HARPage[];
  entries: HARLogEntry[];
};

/**
 * @see http://www.softwareishard.com/blog/har-12-spec/
 */
export type HARFile = {
  log: HARLog;
};

//
// Aggregated data types
//

// this for readability
type HostName = string;
type PathName = string;

export type JSONAPIResourceType = string;

export type JSONAPIDocumentStructure = {
  data: JSONAPIResourceType | JSONAPIResourceType[];
  included: JSONAPIResourceType[];
};

export type APICallStructure = {
  url: {
    host: string;
    pathname: string;
    searchParams?: string[];
  };
  request: JSONAPIDocumentStructure | null;
  response: JSONAPIDocumentStructure;
};

export type AggregatedAPIHostCalls = Map<PathName, APICallStructure[]>;
export type AggregatedAPICalls = Map<HostName, AggregatedAPIHostCalls>;
