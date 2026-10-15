import { EndpointError } from 'sdk';
import { dispatch } from '../lib/dispatch.js';
export default async function(input, ctx) {
 // HTTP Mini App callers can only populate input and ctx.initData.
 // This marker is set by the authenticated management CLI's --ctx argument.
 if (ctx?.scheduler !== true) throw new EndpointError('Management CLI only');
 return dispatch();
}
