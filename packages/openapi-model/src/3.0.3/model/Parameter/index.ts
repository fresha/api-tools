import { CookieParameter } from './CookieParameter';
import { HeaderParameter } from './HeaderParameter';
import { PathParameter } from './PathParameter';
import { QueryParameter } from './QueryParameter';

export { ParameterParent } from './Parameter';

export type Parameter = CookieParameter | HeaderParameter | PathParameter | QueryParameter;

export { CookieParameter, HeaderParameter, PathParameter, QueryParameter };
