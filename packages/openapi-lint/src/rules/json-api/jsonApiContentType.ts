import { isDisabled } from '../utils';

import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'json-api-content-type';

export const autoFixable = false;

const JSON_API_MEDIA_TYPE = 'application/vnd.api+json';

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  for (const [pathUrl, pathItem] of openapi.paths) {
    for (const [httpMethod, { requestBody, responses }] of pathItem.operations()) {
      if (requestBody && !isDisabled(requestBody, id)) {
        if (requestBody?.content && !requestBody.getContent(JSON_API_MEDIA_TYPE)) {
          result.addError(
            `Operation ${httpMethod.toUpperCase()} '${pathUrl}' does not define '${JSON_API_MEDIA_TYPE}' request body`,
          );
        }
      }
      if (responses.default && !isDisabled(responses.default, id)) {
        if (responses.default.content.size && !responses.default?.getContent(JSON_API_MEDIA_TYPE)) {
          result.addError(
            `Operation ${httpMethod.toUpperCase()} '${pathUrl}' does not define '${JSON_API_MEDIA_TYPE}' default response`,
          );
        }
        for (const [code, response] of responses.codes) {
          if (!isDisabled(response, id)) {
            if (response.content.size && !response.getContent(JSON_API_MEDIA_TYPE)) {
              global.console.log({
                pathUrl,
                httpMethod,
                mediaTypes: Array.from(response.content.keys()),
              });
              result.addError(
                `Operation ${httpMethod.toUpperCase()} '${pathUrl}' does not define '${JSON_API_MEDIA_TYPE}' response for ${code} code`,
              );
            }
          }
        }
      }
    }
  }

  return false;
};
