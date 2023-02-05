import { Node } from './Node';

import type { Components } from './Components';
import type { Operation } from './Operation';
import type { CallbackModel } from './types';

type CallbackParent = Components | Operation;

export class Callback extends Node<CallbackParent> implements CallbackModel {}
