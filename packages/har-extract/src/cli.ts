import fs from 'fs';

import { isJSONAPIDataDocument, JSONAPIDocument } from '@fresha/api-tools-core';
import yargs from 'yargs';

import type { HARFile, HARRequest, HARResponse } from './types';

type HostName = string;
type PathName = string;

type JSONAPIResourceType = string;

type JSONAPIDocumentStructure = {
  data: JSONAPIResourceType | JSONAPIResourceType[];
  included: JSONAPIResourceType[];
};

type OutputEntry = {
  url: {
    host: string;
    pathname: string;
    searchParams?: string[];
  };
  request: JSONAPIDocumentStructure | null;
  response: JSONAPIDocumentStructure;
};

type HostEntries = Map<PathName, OutputEntry[]>;
type AllEntries = Map<HostName, HostEntries>;

const isJsonApi = (requestOrResponse: HARRequest | HARResponse): boolean => {
  const contentTypeHeader = requestOrResponse.headers.find(
    h => h.name.toLowerCase() === 'content-type',
  );
  return !!contentTypeHeader?.value.startsWith('application/vnd.api+json');
};

const processDocument = (text: string): JSONAPIDocumentStructure => {
  const dataTypes = new Set<string>();
  const includedTypes = new Set<string>();

  const json = JSON.parse(text) as JSONAPIDocument;
  if (isJSONAPIDataDocument(json)) {
    if (json.data) {
      for (const entry of Array.isArray(json.data) ? json.data : [json.data]) {
        dataTypes.add(entry.type);
      }
    }
    if (json.included) {
      for (const entry of json.included) {
        includedTypes.add(entry.type);
      }
    }
  }

  const data = Array.from(dataTypes).sort();

  return {
    data: data.length === 1 ? data[0] : data,
    included: Array.from(includedTypes).sort(),
  };
};

const processResponse = (response: HARResponse): JSONAPIDocumentStructure | null => {
  if (!isJsonApi(response)) {
    return null;
  }

  let responseText = response.content.text || '';
  if (!responseText) {
    return null;
  }

  if (response.content.encoding === 'base64') {
    const buf = Buffer.from(responseText, 'base64');
    responseText = buf.toString('utf-8');
  }

  return processDocument(responseText);
};

const processRequest = (request: HARRequest): JSONAPIDocumentStructure | null => {
  if (!isJsonApi(request)) {
    return null;
  }

  const requestText = request.postData?.text;
  if (!requestText) {
    return null;
  }

  return processDocument(requestText);
};

const main = (args: string[]) => {
  const argv = yargs(args)
    .string('o')
    .alias('o', 'output')
    .describe('o', 'Output file path')
    .demandOption('o')
    .usage('Usage: $0 <dir>')
    .parseSync();

  const allEntries: AllEntries = new Map<HostName, HostEntries>();

  for (const harPath of argv._) {
    const harData = JSON.parse(fs.readFileSync(harPath, 'utf-8')) as HARFile;

    for (const entry of harData.log.entries) {
      const response = processResponse(entry.response);
      if (response) {
        const { host, pathname, searchParams } = new URL(entry.request.url);

        let hostEntries = allEntries.get(host);
        if (!hostEntries) {
          hostEntries = new Map<HostName, OutputEntry[]>();
          allEntries.set(host, hostEntries);
        }

        let pathEntries = hostEntries.get(pathname);
        if (!pathEntries) {
          pathEntries = [] as OutputEntry[];
          hostEntries.set(pathname, pathEntries);
        }

        pathEntries.push({
          url: {
            host,
            pathname,
            searchParams: Array.from(searchParams.keys()).sort(),
          },
          request: processRequest(entry.request),
          response,
        });
      }
    }
  }

  const output = Object.fromEntries(
    Array.from(allEntries.entries(), ([host, pathEntries]) => [
      host,
      Object.fromEntries(pathEntries),
    ]),
  );

  fs.writeFileSync(argv.output!, JSON.stringify(output, null, 2), 'utf-8');
};

main(process.argv.slice(2));
