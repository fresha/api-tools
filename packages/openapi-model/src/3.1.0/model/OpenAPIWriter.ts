import fs from 'fs';

import { JSONValue, Nullable } from '@fresha/api-tools-core';
import yaml from 'yaml';

import type { ContactModel, InfoModel, LicenseModel, OpenAPIModel } from './types';
import type { ContactObject, InfoObject, LicenseObject, OpenAPIObject } from '../types';

export class OpenAPIWriter {
  writeToFile(model: OpenAPIModel, path: string): void {
    const data = this.write(model);
    const text = yaml.stringify(data);
    fs.writeFileSync(path, text, 'utf-8');
  }

  write(model: OpenAPIModel): JSONValue {
    const result: OpenAPIObject = {
      openapi: '3.1.0',
      info: this.writeInfo(model.info),
    };
    return result;
  }

  writeInfo(model: InfoModel): InfoObject {
    const result: InfoObject = {
      title: model.title,
      version: model.version,
    };
    const contact = this.writeContact(model.contact);
    if (contact) {
      result.contact = contact;
    }
    const license = this.writeLicense(model.license);
    if (license) {
      result.license = license;
    }
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  writeContact(model: ContactModel): Nullable<ContactObject> {
    let result: Nullable<ContactObject> = null;
    if (model.name || model.url || model.email) {
      result = {};
      if (model.name) {
        result.name = model.name;
      }
      if (model.url) {
        result.url = model.url;
      }
      if (model.email) {
        result.email = model.email;
      }
    }
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  writeLicense(model: LicenseModel): Nullable<LicenseObject> {
    const result: Nullable<LicenseObject> = { name: model.name };
    if (model.url) {
      result.url = model.url;
    }
    return result;
  }
}
