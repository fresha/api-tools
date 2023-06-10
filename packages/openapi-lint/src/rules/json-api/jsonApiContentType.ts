import { getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'json-api-content-type';

export const autoFixable = false;

const JSON_API_MEDIA_TYPE = 'application/vnd.api+json';

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  for (const [pathUrl, pathItem] of openapi.paths.pathItems()) {
    for (const [httpMethod, { requestBody, responses }] of pathItem.operations()) {
      if (requestBody && !isDisabled(requestBody, id)) {
        if (requestBody.mediaTypeCount && !requestBody.hasMediaType(JSON_API_MEDIA_TYPE)) {
          result.addIssue({
            ruleId: id,
            severity: options.severity,
            file: getFileName(openapi),
            line: -1,
            pointer: `#/paths/${pathUrl}/${httpMethod}/requestBody`,
            message: `Operation ${httpMethod.toUpperCase()} '${pathUrl}' does not define '${JSON_API_MEDIA_TYPE}' request body`,
          });
        }
      }
      if (responses.default && !isDisabled(responses.default, id)) {
        if (
          responses.default.mediaTypeCount &&
          !responses.default?.getMediaType(JSON_API_MEDIA_TYPE)
        ) {
          result.addIssue({
            ruleId: id,
            severity: options.severity,
            file: getFileName(openapi),
            line: -1,
            pointer: `#/paths/${pathUrl}/${httpMethod}/responses/default`,
            message: `Operation ${httpMethod.toUpperCase()} '${pathUrl}' does not define '${JSON_API_MEDIA_TYPE}' default response`,
          });
        }
        for (const [code, response] of responses.responses()) {
          if (!isDisabled(response, id)) {
            if (response.mediaTypeCount && !response.getMediaType(JSON_API_MEDIA_TYPE)) {
              global.console.log({
                pathUrl,
                httpMethod,
                mediaTypes: Array.from(response.mediaTypeKeys()),
              });
              result.addIssue({
                ruleId: id,
                severity: options.severity,
                file: getFileName(openapi),
                line: -1,
                pointer: `#/paths/${pathUrl}/${httpMethod}/responses/${code}`,
                message: `Operation ${httpMethod.toUpperCase()} '${pathUrl}' does not define '${JSON_API_MEDIA_TYPE}' response for ${code} code`,
              });
            }
          }
        }
      }
    }
  }

  return false;
};
