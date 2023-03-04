import { CookieParameter } from './CookieParameter';
import { HeaderParameter } from './HeaderParameter';
import { PathParameter } from './PathParameter';
import { QueryParameter } from './QueryParameter';

export type { ParameterBase } from './ParameterBase';

export type Parameter = PathParameter | QueryParameter | HeaderParameter | CookieParameter;

export { PathParameter, QueryParameter, HeaderParameter, CookieParameter };
