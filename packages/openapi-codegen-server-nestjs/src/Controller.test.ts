import { Controller } from './Controller';

test.each`
  pathUrl                     | className
  ${'/api/v2'}                | ${'ApiV2Controller'}
  ${'/track-codes/{id}/edit'} | ${'TrackCodesEditController'}
  ${'/'}                      | ${'Controller'}
`(
  'makeClassName(%pathUrl) is expected to be "%className"',
  ({ pathUrl, className }: { pathUrl: string; className: string }) => {
    expect(Controller.makeClassName(pathUrl)).toBe(className);
  },
);

test.each`
  pathUrl                     | fileName
  ${'/api/v2'}                | ${'api-v-2.controller.ts'}
  ${'/track-codes/{id}/edit'} | ${'track-codes-edit.controller.ts'}
  ${'/'}                      | ${'controller.ts'}
`(
  'makeFileName(%pathUrl) is expected to be "%className"',
  ({ pathUrl, fileName }: { pathUrl: string; fileName: string }) => {
    expect(Controller.makeFileName(pathUrl)).toBe(fileName);
  },
);
