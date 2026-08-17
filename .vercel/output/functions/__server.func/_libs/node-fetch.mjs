import { n as __esmMin, r as __exportAll } from "../_runtime.mjs";
import { n as init_dist, t as dataUriToBuffer } from "./data-uri-to-buffer.mjs";
import { a as init_fetch_blob, i as Blob, n as File, t as init_from } from "./fetch-blob+[...].mjs";
import { n as formDataToBlob, r as init_esm_min, t as FormData } from "./formdata-polyfill.mjs";
import nodeHTTP from "node:http";
import Stream, { PassThrough, pipeline } from "node:stream";
import nodeHTTPS from "node:https";
import zlib from "node:zlib";
import { Buffer } from "node:buffer";
import { deprecate, promisify, types } from "node:util";
import { format } from "node:url";
import { isIP } from "node:net";
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/errors/base.js
var FetchBaseError$1;
var init_base$1 = __esmMin((() => {
	FetchBaseError$1 = class extends Error {
		constructor(message, type) {
			super(message);
			Error.captureStackTrace(this, this.constructor);
			this.type = type;
		}
		get name() {
			return this.constructor.name;
		}
		get [Symbol.toStringTag]() {
			return this.constructor.name;
		}
	};
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/errors/fetch-error.js
var FetchError$1;
var init_fetch_error$1 = __esmMin((() => {
	init_base$1();
	FetchError$1 = class extends FetchBaseError$1 {
		/**
		* @param  {string} message -      Error message for human
		* @param  {string} [type] -        Error type for machine
		* @param  {SystemError} [systemError] - For Node.js system error
		*/
		constructor(message, type, systemError) {
			super(message, type);
			if (systemError) {
				this.code = this.errno = systemError.code;
				this.erroredSysCall = systemError.syscall;
			}
		}
	};
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/utils/is.js
var NAME$1, isURLSearchParameters$1, isBlob$1, isAbortSignal$1, isDomainOrSubdomain$1, isSameProtocol$1;
var init_is$1 = __esmMin((() => {
	NAME$1 = Symbol.toStringTag;
	isURLSearchParameters$1 = (object) => {
		return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME$1] === "URLSearchParams";
	};
	isBlob$1 = (object) => {
		return object && typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME$1]);
	};
	isAbortSignal$1 = (object) => {
		return typeof object === "object" && (object[NAME$1] === "AbortSignal" || object[NAME$1] === "EventTarget");
	};
	isDomainOrSubdomain$1 = (destination, original) => {
		const orig = new URL(original).hostname;
		const dest = new URL(destination).hostname;
		return orig === dest || orig.endsWith(`.${dest}`);
	};
	isSameProtocol$1 = (destination, original) => {
		return new URL(original).protocol === new URL(destination).protocol;
	};
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/body.js
/**
* Body.js
*
* Body interface provides common methods for Request and Response
*/
/**
* Consume and convert an entire Body to a Buffer.
*
* Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
*
* @return Promise
*/
async function consumeBody$1(data) {
	if (data[INTERNALS$5].disturbed) throw new TypeError(`body used already for: ${data.url}`);
	data[INTERNALS$5].disturbed = true;
	if (data[INTERNALS$5].error) throw data[INTERNALS$5].error;
	const { body } = data;
	if (body === null) return Buffer.alloc(0);
	/* c8 ignore next 3 */
	if (!(body instanceof Stream)) return Buffer.alloc(0);
	const accum = [];
	let accumBytes = 0;
	try {
		for await (const chunk of body) {
			if (data.size > 0 && accumBytes + chunk.length > data.size) {
				const error = new FetchError$1(`content size at ${data.url} over limit: ${data.size}`, "max-size");
				body.destroy(error);
				throw error;
			}
			accumBytes += chunk.length;
			accum.push(chunk);
		}
	} catch (error) {
		throw error instanceof FetchBaseError$1 ? error : new FetchError$1(`Invalid response body while trying to fetch ${data.url}: ${error.message}`, "system", error);
	}
	if (body.readableEnded === true || body._readableState.ended === true) try {
		if (accum.every((c) => typeof c === "string")) return Buffer.from(accum.join(""));
		return Buffer.concat(accum, accumBytes);
	} catch (error) {
		throw new FetchError$1(`Could not create Buffer from response body for ${data.url}: ${error.message}`, "system", error);
	}
	else throw new FetchError$1(`Premature close of server response while trying to fetch ${data.url}`);
}
var pipeline$2, INTERNALS$5, Body$1, clone$1, getNonSpecFormDataBoundary$1, extractContentType$1, getTotalBytes$1, writeToStream$1;
var init_body$1 = __esmMin((() => {
	init_fetch_blob();
	init_esm_min();
	init_fetch_error$1();
	init_base$1();
	init_is$1();
	pipeline$2 = promisify(Stream.pipeline);
	INTERNALS$5 = Symbol("Body internals");
	Body$1 = class {
		constructor(body, { size = 0 } = {}) {
			let boundary = null;
			if (body === null) body = null;
			else if (isURLSearchParameters$1(body)) body = Buffer.from(body.toString());
			else if (isBlob$1(body)) {} else if (Buffer.isBuffer(body)) {} else if (types.isAnyArrayBuffer(body)) body = Buffer.from(body);
			else if (ArrayBuffer.isView(body)) body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
			else if (body instanceof Stream) {} else if (body instanceof FormData) {
				body = formDataToBlob(body);
				boundary = body.type.split("=")[1];
			} else body = Buffer.from(String(body));
			let stream = body;
			if (Buffer.isBuffer(body)) stream = Stream.Readable.from(body);
			else if (isBlob$1(body)) stream = Stream.Readable.from(body.stream());
			this[INTERNALS$5] = {
				body,
				stream,
				boundary,
				disturbed: false,
				error: null
			};
			this.size = size;
			if (body instanceof Stream) body.on("error", (error_) => {
				const error = error_ instanceof FetchBaseError$1 ? error_ : new FetchError$1(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
				this[INTERNALS$5].error = error;
			});
		}
		get body() {
			return this[INTERNALS$5].stream;
		}
		get bodyUsed() {
			return this[INTERNALS$5].disturbed;
		}
		/**
		* Decode response as ArrayBuffer
		*
		* @return  Promise
		*/
		async arrayBuffer() {
			const { buffer, byteOffset, byteLength } = await consumeBody$1(this);
			return buffer.slice(byteOffset, byteOffset + byteLength);
		}
		async formData() {
			const ct = this.headers.get("content-type");
			if (ct.startsWith("application/x-www-form-urlencoded")) {
				const formData = new FormData();
				const parameters = new URLSearchParams(await this.text());
				for (const [name, value] of parameters) formData.append(name, value);
				return formData;
			}
			const { toFormData } = await Promise.resolve().then(() => (init_multipart_parser$1(), multipart_parser_exports$1));
			return toFormData(this.body, ct);
		}
		/**
		* Return raw response as Blob
		*
		* @return Promise
		*/
		async blob() {
			const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$5].body && this[INTERNALS$5].body.type || "";
			const buf = await this.arrayBuffer();
			return new Blob([buf], { type: ct });
		}
		/**
		* Decode response as json
		*
		* @return  Promise
		*/
		async json() {
			const text = await this.text();
			return JSON.parse(text);
		}
		/**
		* Decode response as text
		*
		* @return  Promise
		*/
		async text() {
			const buffer = await consumeBody$1(this);
			return new TextDecoder().decode(buffer);
		}
		/**
		* Decode response as buffer (non-spec api)
		*
		* @return  Promise
		*/
		buffer() {
			return consumeBody$1(this);
		}
	};
	Body$1.prototype.buffer = deprecate(Body$1.prototype.buffer, "Please use 'response.arrayBuffer()' instead of 'response.buffer()'", "node-fetch#buffer");
	Object.defineProperties(Body$1.prototype, {
		body: { enumerable: true },
		bodyUsed: { enumerable: true },
		arrayBuffer: { enumerable: true },
		blob: { enumerable: true },
		json: { enumerable: true },
		text: { enumerable: true },
		data: { get: deprecate(() => {}, "data doesn't exist, use json(), text(), arrayBuffer(), or body instead", "https://github.com/node-fetch/node-fetch/issues/1000 (response)") }
	});
	clone$1 = (instance, highWaterMark) => {
		let p1;
		let p2;
		let { body } = instance[INTERNALS$5];
		if (instance.bodyUsed) throw new Error("cannot clone body after it is used");
		if (body instanceof Stream && typeof body.getBoundary !== "function") {
			p1 = new PassThrough({ highWaterMark });
			p2 = new PassThrough({ highWaterMark });
			body.pipe(p1);
			body.pipe(p2);
			instance[INTERNALS$5].stream = p1;
			body = p2;
		}
		return body;
	};
	getNonSpecFormDataBoundary$1 = deprecate((body) => body.getBoundary(), "form-data doesn't follow the spec and requires special treatment. Use alternative package", "https://github.com/node-fetch/node-fetch/issues/1167");
	extractContentType$1 = (body, request) => {
		if (body === null) return null;
		if (typeof body === "string") return "text/plain;charset=UTF-8";
		if (isURLSearchParameters$1(body)) return "application/x-www-form-urlencoded;charset=UTF-8";
		if (isBlob$1(body)) return body.type || null;
		if (Buffer.isBuffer(body) || types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) return null;
		if (body instanceof FormData) return `multipart/form-data; boundary=${request[INTERNALS$5].boundary}`;
		if (body && typeof body.getBoundary === "function") return `multipart/form-data;boundary=${getNonSpecFormDataBoundary$1(body)}`;
		if (body instanceof Stream) return null;
		return "text/plain;charset=UTF-8";
	};
	getTotalBytes$1 = (request) => {
		const { body } = request[INTERNALS$5];
		if (body === null) return 0;
		if (isBlob$1(body)) return body.size;
		if (Buffer.isBuffer(body)) return body.length;
		if (body && typeof body.getLengthSync === "function") return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
		return null;
	};
	writeToStream$1 = async (dest, { body }) => {
		if (body === null) dest.end();
		else await pipeline$2(body, dest);
	};
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/headers.js
/**
* Headers.js
*
* Headers class offers convenient helpers
*/
/**
* Create a Headers object from an http.IncomingMessage.rawHeaders, ignoring those that do
* not conform to HTTP grammar productions.
* @param {import('http').IncomingMessage['rawHeaders']} headers
*/
function fromRawHeaders$1(headers = []) {
	return new Headers$1(headers.reduce((result, value, index, array) => {
		if (index % 2 === 0) result.push(array.slice(index, index + 2));
		return result;
	}, []).filter(([name, value]) => {
		try {
			validateHeaderName$1(name);
			validateHeaderValue$1(name, String(value));
			return true;
		} catch {
			return false;
		}
	}));
}
var validateHeaderName$1, validateHeaderValue$1, Headers$1;
var init_headers$1 = __esmMin((() => {
	validateHeaderName$1 = typeof nodeHTTP.validateHeaderName === "function" ? nodeHTTP.validateHeaderName : (name) => {
		if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
			const error = /* @__PURE__ */ new TypeError(`Header name must be a valid HTTP token [${name}]`);
			Object.defineProperty(error, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
			throw error;
		}
	};
	validateHeaderValue$1 = typeof nodeHTTP.validateHeaderValue === "function" ? nodeHTTP.validateHeaderValue : (name, value) => {
		if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
			const error = /* @__PURE__ */ new TypeError(`Invalid character in header content ["${name}"]`);
			Object.defineProperty(error, "code", { value: "ERR_INVALID_CHAR" });
			throw error;
		}
	};
	Headers$1 = class Headers$1 extends URLSearchParams {
		/**
		* Headers class
		*
		* @constructor
		* @param {HeadersInit} [init] - Response headers
		*/
		constructor(init) {
			/** @type {string[][]} */
			let result = [];
			if (init instanceof Headers$1) {
				const raw = init.raw();
				for (const [name, values] of Object.entries(raw)) result.push(...values.map((value) => [name, value]));
			} else if (init == null) {} else if (typeof init === "object" && !types.isBoxedPrimitive(init)) {
				const method = init[Symbol.iterator];
				if (method == null) result.push(...Object.entries(init));
				else {
					if (typeof method !== "function") throw new TypeError("Header pairs must be iterable");
					result = [...init].map((pair) => {
						if (typeof pair !== "object" || types.isBoxedPrimitive(pair)) throw new TypeError("Each header pair must be an iterable object");
						return [...pair];
					}).map((pair) => {
						if (pair.length !== 2) throw new TypeError("Each header pair must be a name/value tuple");
						return [...pair];
					});
				}
			} else throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
			result = result.length > 0 ? result.map(([name, value]) => {
				validateHeaderName$1(name);
				validateHeaderValue$1(name, String(value));
				return [String(name).toLowerCase(), String(value)];
			}) : void 0;
			super(result);
			return new Proxy(this, { get(target, p, receiver) {
				switch (p) {
					case "append":
					case "set": return (name, value) => {
						validateHeaderName$1(name);
						validateHeaderValue$1(name, String(value));
						return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
					};
					case "delete":
					case "has":
					case "getAll": return (name) => {
						validateHeaderName$1(name);
						return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
					};
					case "keys": return () => {
						target.sort();
						return new Set(URLSearchParams.prototype.keys.call(target)).keys();
					};
					default: return Reflect.get(target, p, receiver);
				}
			} });
			/* c8 ignore next */
		}
		get [Symbol.toStringTag]() {
			return this.constructor.name;
		}
		toString() {
			return Object.prototype.toString.call(this);
		}
		get(name) {
			const values = this.getAll(name);
			if (values.length === 0) return null;
			let value = values.join(", ");
			if (/^content-encoding$/i.test(name)) value = value.toLowerCase();
			return value;
		}
		forEach(callback, thisArg = void 0) {
			for (const name of this.keys()) Reflect.apply(callback, thisArg, [
				this.get(name),
				name,
				this
			]);
		}
		*values() {
			for (const name of this.keys()) yield this.get(name);
		}
		/**
		* @type {() => IterableIterator<[string, string]>}
		*/
		*entries() {
			for (const name of this.keys()) yield [name, this.get(name)];
		}
		[Symbol.iterator]() {
			return this.entries();
		}
		/**
		* Node-fetch non-spec method
		* returning all headers and their values as array
		* @returns {Record<string, string[]>}
		*/
		raw() {
			return [...this.keys()].reduce((result, key) => {
				result[key] = this.getAll(key);
				return result;
			}, {});
		}
		/**
		* For better console.log(headers) and also to convert Headers into Node.js Request compatible format
		*/
		[Symbol.for("nodejs.util.inspect.custom")]() {
			return [...this.keys()].reduce((result, key) => {
				const values = this.getAll(key);
				if (key === "host") result[key] = values[0];
				else result[key] = values.length > 1 ? values : values[0];
				return result;
			}, {});
		}
	};
	/**
	* Re-shaping object for Web IDL tests
	* Only need to do it for overridden methods
	*/
	Object.defineProperties(Headers$1.prototype, [
		"get",
		"entries",
		"forEach",
		"values"
	].reduce((result, property) => {
		result[property] = { enumerable: true };
		return result;
	}, {}));
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/utils/is-redirect.js
var redirectStatus$1, isRedirect$1;
var init_is_redirect$1 = __esmMin((() => {
	redirectStatus$1 = /* @__PURE__ */ new Set([
		301,
		302,
		303,
		307,
		308
	]);
	isRedirect$1 = (code) => {
		return redirectStatus$1.has(code);
	};
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/response.js
var INTERNALS$4, Response$1;
var init_response$1 = __esmMin((() => {
	init_headers$1();
	init_body$1();
	init_is_redirect$1();
	INTERNALS$4 = Symbol("Response internals");
	Response$1 = class Response$1 extends Body$1 {
		constructor(body = null, options = {}) {
			super(body, options);
			const status = options.status != null ? options.status : 200;
			const headers = new Headers$1(options.headers);
			if (body !== null && !headers.has("Content-Type")) {
				const contentType = extractContentType$1(body, this);
				if (contentType) headers.append("Content-Type", contentType);
			}
			this[INTERNALS$4] = {
				type: "default",
				url: options.url,
				status,
				statusText: options.statusText || "",
				headers,
				counter: options.counter,
				highWaterMark: options.highWaterMark
			};
		}
		get type() {
			return this[INTERNALS$4].type;
		}
		get url() {
			return this[INTERNALS$4].url || "";
		}
		get status() {
			return this[INTERNALS$4].status;
		}
		/**
		* Convenience property representing if the request ended normally
		*/
		get ok() {
			return this[INTERNALS$4].status >= 200 && this[INTERNALS$4].status < 300;
		}
		get redirected() {
			return this[INTERNALS$4].counter > 0;
		}
		get statusText() {
			return this[INTERNALS$4].statusText;
		}
		get headers() {
			return this[INTERNALS$4].headers;
		}
		get highWaterMark() {
			return this[INTERNALS$4].highWaterMark;
		}
		/**
		* Clone this response
		*
		* @return  Response
		*/
		clone() {
			return new Response$1(clone$1(this, this.highWaterMark), {
				type: this.type,
				url: this.url,
				status: this.status,
				statusText: this.statusText,
				headers: this.headers,
				ok: this.ok,
				redirected: this.redirected,
				size: this.size,
				highWaterMark: this.highWaterMark
			});
		}
		/**
		* @param {string} url    The URL that the new response is to originate from.
		* @param {number} status An optional status code for the response (e.g., 302.)
		* @returns {Response}    A Response object.
		*/
		static redirect(url, status = 302) {
			if (!isRedirect$1(status)) throw new RangeError("Failed to execute \"redirect\" on \"response\": Invalid status code");
			return new Response$1(null, {
				headers: { location: new URL(url).toString() },
				status
			});
		}
		static error() {
			const response = new Response$1(null, {
				status: 0,
				statusText: ""
			});
			response[INTERNALS$4].type = "error";
			return response;
		}
		static json(data = void 0, init = {}) {
			const body = JSON.stringify(data);
			if (body === void 0) throw new TypeError("data is not JSON serializable");
			const headers = new Headers$1(init && init.headers);
			if (!headers.has("content-type")) headers.set("content-type", "application/json");
			return new Response$1(body, {
				...init,
				headers
			});
		}
		get [Symbol.toStringTag]() {
			return "Response";
		}
	};
	Object.defineProperties(Response$1.prototype, {
		type: { enumerable: true },
		url: { enumerable: true },
		status: { enumerable: true },
		ok: { enumerable: true },
		redirected: { enumerable: true },
		statusText: { enumerable: true },
		headers: { enumerable: true },
		clone: { enumerable: true }
	});
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/utils/get-search.js
var getSearch$1;
var init_get_search$1 = __esmMin((() => {
	getSearch$1 = (parsedURL) => {
		if (parsedURL.search) return parsedURL.search;
		const lastOffset = parsedURL.href.length - 1;
		const hash = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
		return parsedURL.href[lastOffset - hash.length] === "?" ? "?" : "";
	};
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/utils/referrer.js
/**
* @external URL
* @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL|URL}
*/
/**
* @module utils/referrer
* @private
*/
/**
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#strip-url|Referrer Policy §8.4. Strip url for use as a referrer}
* @param {string} URL
* @param {boolean} [originOnly=false]
*/
function stripURLForUseAsAReferrer$1(url, originOnly = false) {
	if (url == null) return "no-referrer";
	url = new URL(url);
	if (/^(about|blob|data):$/.test(url.protocol)) return "no-referrer";
	url.username = "";
	url.password = "";
	url.hash = "";
	if (originOnly) {
		url.pathname = "";
		url.search = "";
	}
	return url;
}
/**
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#referrer-policies|Referrer Policy §3. Referrer Policies}
* @param {string} referrerPolicy
* @returns {string} referrerPolicy
*/
function validateReferrerPolicy$1(referrerPolicy) {
	if (!ReferrerPolicy$1.has(referrerPolicy)) throw new TypeError(`Invalid referrerPolicy: ${referrerPolicy}`);
	return referrerPolicy;
}
/**
* @see {@link https://w3c.github.io/webappsec-secure-contexts/#is-origin-trustworthy|Referrer Policy §3.2. Is origin potentially trustworthy?}
* @param {external:URL} url
* @returns `true`: "Potentially Trustworthy", `false`: "Not Trustworthy"
*/
function isOriginPotentiallyTrustworthy$1(url) {
	if (/^(http|ws)s:$/.test(url.protocol)) return true;
	const hostIp = url.host.replace(/(^\[)|(]$)/g, "");
	const hostIPVersion = isIP(hostIp);
	if (hostIPVersion === 4 && /^127\./.test(hostIp)) return true;
	if (hostIPVersion === 6 && /^(((0+:){7})|(::(0+:){0,6}))0*1$/.test(hostIp)) return true;
	if (url.host === "localhost" || url.host.endsWith(".localhost")) return false;
	if (url.protocol === "file:") return true;
	return false;
}
/**
* @see {@link https://w3c.github.io/webappsec-secure-contexts/#is-url-trustworthy|Referrer Policy §3.3. Is url potentially trustworthy?}
* @param {external:URL} url
* @returns `true`: "Potentially Trustworthy", `false`: "Not Trustworthy"
*/
function isUrlPotentiallyTrustworthy$1(url) {
	if (/^about:(blank|srcdoc)$/.test(url)) return true;
	if (url.protocol === "data:") return true;
	if (/^(blob|filesystem):$/.test(url.protocol)) return true;
	return isOriginPotentiallyTrustworthy$1(url);
}
/**
* Modifies the referrerURL to enforce any extra security policy considerations.
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}, step 7
* @callback module:utils/referrer~referrerURLCallback
* @param {external:URL} referrerURL
* @returns {external:URL} modified referrerURL
*/
/**
* Modifies the referrerOrigin to enforce any extra security policy considerations.
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}, step 7
* @callback module:utils/referrer~referrerOriginCallback
* @param {external:URL} referrerOrigin
* @returns {external:URL} modified referrerOrigin
*/
/**
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}
* @param {Request} request
* @param {object} o
* @param {module:utils/referrer~referrerURLCallback} o.referrerURLCallback
* @param {module:utils/referrer~referrerOriginCallback} o.referrerOriginCallback
* @returns {external:URL} Request's referrer
*/
function determineRequestsReferrer$1(request, { referrerURLCallback, referrerOriginCallback } = {}) {
	if (request.referrer === "no-referrer" || request.referrerPolicy === "") return null;
	const policy = request.referrerPolicy;
	if (request.referrer === "about:client") return "no-referrer";
	const referrerSource = request.referrer;
	let referrerURL = stripURLForUseAsAReferrer$1(referrerSource);
	let referrerOrigin = stripURLForUseAsAReferrer$1(referrerSource, true);
	if (referrerURL.toString().length > 4096) referrerURL = referrerOrigin;
	if (referrerURLCallback) referrerURL = referrerURLCallback(referrerURL);
	if (referrerOriginCallback) referrerOrigin = referrerOriginCallback(referrerOrigin);
	const currentURL = new URL(request.url);
	switch (policy) {
		case "no-referrer": return "no-referrer";
		case "origin": return referrerOrigin;
		case "unsafe-url": return referrerURL;
		case "strict-origin":
			if (isUrlPotentiallyTrustworthy$1(referrerURL) && !isUrlPotentiallyTrustworthy$1(currentURL)) return "no-referrer";
			return referrerOrigin.toString();
		case "strict-origin-when-cross-origin":
			if (referrerURL.origin === currentURL.origin) return referrerURL;
			if (isUrlPotentiallyTrustworthy$1(referrerURL) && !isUrlPotentiallyTrustworthy$1(currentURL)) return "no-referrer";
			return referrerOrigin;
		case "same-origin":
			if (referrerURL.origin === currentURL.origin) return referrerURL;
			return "no-referrer";
		case "origin-when-cross-origin":
			if (referrerURL.origin === currentURL.origin) return referrerURL;
			return referrerOrigin;
		case "no-referrer-when-downgrade":
			if (isUrlPotentiallyTrustworthy$1(referrerURL) && !isUrlPotentiallyTrustworthy$1(currentURL)) return "no-referrer";
			return referrerURL;
		default: throw new TypeError(`Invalid referrerPolicy: ${policy}`);
	}
}
/**
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#parse-referrer-policy-from-header|Referrer Policy §8.1. Parse a referrer policy from a Referrer-Policy header}
* @param {Headers} headers Response headers
* @returns {string} policy
*/
function parseReferrerPolicyFromHeader$1(headers) {
	const policyTokens = (headers.get("referrer-policy") || "").split(/[,\s]+/);
	let policy = "";
	for (const token of policyTokens) if (token && ReferrerPolicy$1.has(token)) policy = token;
	return policy;
}
var ReferrerPolicy$1, DEFAULT_REFERRER_POLICY$1;
var init_referrer$1 = __esmMin((() => {
	ReferrerPolicy$1 = /* @__PURE__ */ new Set([
		"",
		"no-referrer",
		"no-referrer-when-downgrade",
		"same-origin",
		"origin",
		"strict-origin",
		"origin-when-cross-origin",
		"strict-origin-when-cross-origin",
		"unsafe-url"
	]);
	DEFAULT_REFERRER_POLICY$1 = "strict-origin-when-cross-origin";
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/request.js
/**
* Request.js
*
* Request class contains server only options
*
* All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
*/
var INTERNALS$3, isRequest$1, doBadDataWarn$1, Request$1, getNodeRequestOptions$1;
var init_request$1 = __esmMin((() => {
	init_headers$1();
	init_body$1();
	init_is$1();
	init_get_search$1();
	init_referrer$1();
	INTERNALS$3 = Symbol("Request internals");
	isRequest$1 = (object) => {
		return typeof object === "object" && typeof object[INTERNALS$3] === "object";
	};
	doBadDataWarn$1 = deprecate(() => {}, ".data is not a valid RequestInit property, use .body instead", "https://github.com/node-fetch/node-fetch/issues/1000 (request)");
	Request$1 = class Request$1 extends Body$1 {
		constructor(input, init = {}) {
			let parsedURL;
			if (isRequest$1(input)) parsedURL = new URL(input.url);
			else {
				parsedURL = new URL(input);
				input = {};
			}
			if (parsedURL.username !== "" || parsedURL.password !== "") throw new TypeError(`${parsedURL} is an url with embedded credentials.`);
			let method = init.method || input.method || "GET";
			if (/^(delete|get|head|options|post|put)$/i.test(method)) method = method.toUpperCase();
			if (!isRequest$1(init) && "data" in init) doBadDataWarn$1();
			if ((init.body != null || isRequest$1(input) && input.body !== null) && (method === "GET" || method === "HEAD")) throw new TypeError("Request with GET/HEAD method cannot have body");
			const inputBody = init.body ? init.body : isRequest$1(input) && input.body !== null ? clone$1(input) : null;
			super(inputBody, { size: init.size || input.size || 0 });
			const headers = new Headers$1(init.headers || input.headers || {});
			if (inputBody !== null && !headers.has("Content-Type")) {
				const contentType = extractContentType$1(inputBody, this);
				if (contentType) headers.set("Content-Type", contentType);
			}
			let signal = isRequest$1(input) ? input.signal : null;
			if ("signal" in init) signal = init.signal;
			if (signal != null && !isAbortSignal$1(signal)) throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
			let referrer = init.referrer == null ? input.referrer : init.referrer;
			if (referrer === "") referrer = "no-referrer";
			else if (referrer) {
				const parsedReferrer = new URL(referrer);
				referrer = /^about:(\/\/)?client$/.test(parsedReferrer) ? "client" : parsedReferrer;
			} else referrer = void 0;
			this[INTERNALS$3] = {
				method,
				redirect: init.redirect || input.redirect || "follow",
				headers,
				parsedURL,
				signal,
				referrer
			};
			this.follow = init.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init.follow;
			this.compress = init.compress === void 0 ? input.compress === void 0 ? true : input.compress : init.compress;
			this.counter = init.counter || input.counter || 0;
			this.agent = init.agent || input.agent;
			this.highWaterMark = init.highWaterMark || input.highWaterMark || 16384;
			this.insecureHTTPParser = init.insecureHTTPParser || input.insecureHTTPParser || false;
			this.referrerPolicy = init.referrerPolicy || input.referrerPolicy || "";
		}
		/** @returns {string} */
		get method() {
			return this[INTERNALS$3].method;
		}
		/** @returns {string} */
		get url() {
			return format(this[INTERNALS$3].parsedURL);
		}
		/** @returns {Headers} */
		get headers() {
			return this[INTERNALS$3].headers;
		}
		get redirect() {
			return this[INTERNALS$3].redirect;
		}
		/** @returns {AbortSignal} */
		get signal() {
			return this[INTERNALS$3].signal;
		}
		get referrer() {
			if (this[INTERNALS$3].referrer === "no-referrer") return "";
			if (this[INTERNALS$3].referrer === "client") return "about:client";
			if (this[INTERNALS$3].referrer) return this[INTERNALS$3].referrer.toString();
		}
		get referrerPolicy() {
			return this[INTERNALS$3].referrerPolicy;
		}
		set referrerPolicy(referrerPolicy) {
			this[INTERNALS$3].referrerPolicy = validateReferrerPolicy$1(referrerPolicy);
		}
		/**
		* Clone this request
		*
		* @return  Request
		*/
		clone() {
			return new Request$1(this);
		}
		get [Symbol.toStringTag]() {
			return "Request";
		}
	};
	Object.defineProperties(Request$1.prototype, {
		method: { enumerable: true },
		url: { enumerable: true },
		headers: { enumerable: true },
		redirect: { enumerable: true },
		clone: { enumerable: true },
		signal: { enumerable: true },
		referrer: { enumerable: true },
		referrerPolicy: { enumerable: true }
	});
	getNodeRequestOptions$1 = (request) => {
		const { parsedURL } = request[INTERNALS$3];
		const headers = new Headers$1(request[INTERNALS$3].headers);
		if (!headers.has("Accept")) headers.set("Accept", "*/*");
		let contentLengthValue = null;
		if (request.body === null && /^(post|put)$/i.test(request.method)) contentLengthValue = "0";
		if (request.body !== null) {
			const totalBytes = getTotalBytes$1(request);
			if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) contentLengthValue = String(totalBytes);
		}
		if (contentLengthValue) headers.set("Content-Length", contentLengthValue);
		if (request.referrerPolicy === "") request.referrerPolicy = DEFAULT_REFERRER_POLICY$1;
		if (request.referrer && request.referrer !== "no-referrer") request[INTERNALS$3].referrer = determineRequestsReferrer$1(request);
		else request[INTERNALS$3].referrer = "no-referrer";
		if (request[INTERNALS$3].referrer instanceof URL) headers.set("Referer", request.referrer);
		if (!headers.has("User-Agent")) headers.set("User-Agent", "node-fetch");
		if (request.compress && !headers.has("Accept-Encoding")) headers.set("Accept-Encoding", "gzip, deflate, br");
		let { agent } = request;
		if (typeof agent === "function") agent = agent(parsedURL);
		const search = getSearch$1(parsedURL);
		return {
			/** @type {URL} */
			parsedURL,
			options: {
				path: parsedURL.pathname + search,
				method: request.method,
				headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
				insecureHTTPParser: request.insecureHTTPParser,
				agent
			}
		};
	};
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/errors/abort-error.js
var AbortError$1;
var init_abort_error$1 = __esmMin((() => {
	init_base$1();
	AbortError$1 = class extends FetchBaseError$1 {
		constructor(message, type = "aborted") {
			super(message, type);
		}
	};
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/index.js
/**
* Index.js
*
* a request API compatible with window.fetch
*
* All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
*/
var src_exports$1 = /* @__PURE__ */ __exportAll({
	AbortError: () => AbortError$1,
	FetchError: () => FetchError$1,
	Headers: () => Headers$1,
	Request: () => Request$1,
	Response: () => Response$1,
	default: () => fetch$1,
	isRedirect: () => isRedirect$1
});
/**
* Fetch function
*
* @param   {string | URL | import('./request').default} url - Absolute url or Request instance
* @param   {*} [options_] - Fetch options
* @return  {Promise<import('./response').default>}
*/
async function fetch$1(url, options_) {
	return new Promise((resolve, reject) => {
		const request = new Request$1(url, options_);
		const { parsedURL, options } = getNodeRequestOptions$1(request);
		if (!supportedSchemas$1.has(parsedURL.protocol)) throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${parsedURL.protocol.replace(/:$/, "")}" is not supported.`);
		if (parsedURL.protocol === "data:") {
			const data = dataUriToBuffer(request.url);
			resolve(new Response$1(data, { headers: { "Content-Type": data.typeFull } }));
			return;
		}
		const send = (parsedURL.protocol === "https:" ? nodeHTTPS : nodeHTTP).request;
		const { signal } = request;
		let response = null;
		const abort = () => {
			const error = new AbortError$1("The operation was aborted.");
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) request.body.destroy(error);
			if (!response || !response.body) return;
			response.body.emit("error", error);
		};
		if (signal && signal.aborted) {
			abort();
			return;
		}
		const abortAndFinalize = () => {
			abort();
			finalize();
		};
		const request_ = send(parsedURL.toString(), options);
		if (signal) signal.addEventListener("abort", abortAndFinalize);
		const finalize = () => {
			request_.abort();
			if (signal) signal.removeEventListener("abort", abortAndFinalize);
		};
		request_.on("error", (error) => {
			reject(new FetchError$1(`request to ${request.url} failed, reason: ${error.message}`, "system", error));
			finalize();
		});
		fixResponseChunkedTransferBadEnding$1(request_, (error) => {
			if (response && response.body) response.body.destroy(error);
		});
		/* c8 ignore next 18 */
		if (process.version < "v14") request_.on("socket", (s) => {
			let endedWithEventsCount;
			s.prependListener("end", () => {
				endedWithEventsCount = s._eventsCount;
			});
			s.prependListener("close", (hadError) => {
				if (response && endedWithEventsCount < s._eventsCount && !hadError) {
					const error = /* @__PURE__ */ new Error("Premature close");
					error.code = "ERR_STREAM_PREMATURE_CLOSE";
					response.body.emit("error", error);
				}
			});
		});
		request_.on("response", (response_) => {
			request_.setTimeout(0);
			const headers = fromRawHeaders$1(response_.rawHeaders);
			if (isRedirect$1(response_.statusCode)) {
				const location = headers.get("Location");
				let locationURL = null;
				try {
					locationURL = location === null ? null : new URL(location, request.url);
				} catch {
					if (request.redirect !== "manual") {
						reject(new FetchError$1(`uri requested responds with an invalid redirect URL: ${location}`, "invalid-redirect"));
						finalize();
						return;
					}
				}
				switch (request.redirect) {
					case "error":
						reject(new FetchError$1(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
						finalize();
						return;
					case "manual": break;
					case "follow": {
						if (locationURL === null) break;
						if (request.counter >= request.follow) {
							reject(new FetchError$1(`maximum redirect reached at: ${request.url}`, "max-redirect"));
							finalize();
							return;
						}
						const requestOptions = {
							headers: new Headers$1(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: clone$1(request),
							signal: request.signal,
							size: request.size,
							referrer: request.referrer,
							referrerPolicy: request.referrerPolicy
						};
						if (!isDomainOrSubdomain$1(request.url, locationURL) || !isSameProtocol$1(request.url, locationURL)) for (const name of [
							"authorization",
							"www-authenticate",
							"cookie",
							"cookie2"
						]) requestOptions.headers.delete(name);
						if (response_.statusCode !== 303 && request.body && options_.body instanceof Stream.Readable) {
							reject(new FetchError$1("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
							finalize();
							return;
						}
						if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
							requestOptions.method = "GET";
							requestOptions.body = void 0;
							requestOptions.headers.delete("content-length");
						}
						const responseReferrerPolicy = parseReferrerPolicyFromHeader$1(headers);
						if (responseReferrerPolicy) requestOptions.referrerPolicy = responseReferrerPolicy;
						resolve(fetch$1(new Request$1(locationURL, requestOptions)));
						finalize();
						return;
					}
					default: return reject(/* @__PURE__ */ new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
				}
			}
			if (signal) response_.once("end", () => {
				signal.removeEventListener("abort", abortAndFinalize);
			});
			let body = pipeline(response_, new PassThrough(), (error) => {
				if (error) reject(error);
			});
			/* c8 ignore next 3 */
			if (process.version < "v12.10") response_.on("aborted", abortAndFinalize);
			const responseOptions = {
				url: request.url,
				status: response_.statusCode,
				statusText: response_.statusMessage,
				headers,
				size: request.size,
				counter: request.counter,
				highWaterMark: request.highWaterMark
			};
			const codings = headers.get("Content-Encoding");
			if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
				response = new Response$1(body, responseOptions);
				resolve(response);
				return;
			}
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};
			if (codings === "gzip" || codings === "x-gzip") {
				body = pipeline(body, zlib.createGunzip(zlibOptions), (error) => {
					if (error) reject(error);
				});
				response = new Response$1(body, responseOptions);
				resolve(response);
				return;
			}
			if (codings === "deflate" || codings === "x-deflate") {
				const raw = pipeline(response_, new PassThrough(), (error) => {
					if (error) reject(error);
				});
				raw.once("data", (chunk) => {
					if ((chunk[0] & 15) === 8) body = pipeline(body, zlib.createInflate(), (error) => {
						if (error) reject(error);
					});
					else body = pipeline(body, zlib.createInflateRaw(), (error) => {
						if (error) reject(error);
					});
					response = new Response$1(body, responseOptions);
					resolve(response);
				});
				raw.once("end", () => {
					if (!response) {
						response = new Response$1(body, responseOptions);
						resolve(response);
					}
				});
				return;
			}
			if (codings === "br") {
				body = pipeline(body, zlib.createBrotliDecompress(), (error) => {
					if (error) reject(error);
				});
				response = new Response$1(body, responseOptions);
				resolve(response);
				return;
			}
			response = new Response$1(body, responseOptions);
			resolve(response);
		});
		writeToStream$1(request_, request).catch(reject);
	});
}
function fixResponseChunkedTransferBadEnding$1(request, errorCallback) {
	const LAST_CHUNK = Buffer.from("0\r\n\r\n");
	let isChunkedTransfer = false;
	let properLastChunkReceived = false;
	let previousChunk;
	request.on("response", (response) => {
		const { headers } = response;
		isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
	});
	request.on("socket", (socket) => {
		const onSocketClose = () => {
			if (isChunkedTransfer && !properLastChunkReceived) {
				const error = /* @__PURE__ */ new Error("Premature close");
				error.code = "ERR_STREAM_PREMATURE_CLOSE";
				errorCallback(error);
			}
		};
		const onData = (buf) => {
			properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
			if (!properLastChunkReceived && previousChunk) properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
			previousChunk = buf;
		};
		socket.prependListener("close", onSocketClose);
		socket.on("data", onData);
		request.on("close", () => {
			socket.removeListener("close", onSocketClose);
			socket.removeListener("data", onData);
		});
	});
}
var supportedSchemas$1;
var init_src$1 = __esmMin((() => {
	init_dist();
	init_body$1();
	init_response$1();
	init_headers$1();
	init_request$1();
	init_fetch_error$1();
	init_abort_error$1();
	init_is_redirect$1();
	init_esm_min();
	init_is$1();
	init_referrer$1();
	init_from();
	supportedSchemas$1 = /* @__PURE__ */ new Set([
		"data:",
		"http:",
		"https:"
	]);
}));
//#endregion
//#region node_modules/gcp-metadata/node_modules/node-fetch/src/utils/multipart-parser.js
var multipart_parser_exports$1 = /* @__PURE__ */ __exportAll({ toFormData: () => toFormData$1 });
function _fileName$1(headerValue) {
	const m = headerValue.match(/\bfilename=("(.*?)"|([^()<>@,;:\\"/[\]?={}\s\t]+))($|;\s)/i);
	if (!m) return;
	const match = m[2] || m[3] || "";
	let filename = match.slice(match.lastIndexOf("\\") + 1);
	filename = filename.replace(/%22/g, "\"");
	filename = filename.replace(/&#(\d{4});/g, (m, code) => {
		return String.fromCharCode(code);
	});
	return filename;
}
async function toFormData$1(Body, ct) {
	if (!/multipart/i.test(ct)) throw new TypeError("Failed to fetch");
	const m = ct.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
	if (!m) throw new TypeError("no or bad content-type header, no multipart boundary");
	const parser = new MultipartParser$1(m[1] || m[2]);
	let headerField;
	let headerValue;
	let entryValue;
	let entryName;
	let contentType;
	let filename;
	const entryChunks = [];
	const formData = new FormData();
	const onPartData = (ui8a) => {
		entryValue += decoder.decode(ui8a, { stream: true });
	};
	const appendToFile = (ui8a) => {
		entryChunks.push(ui8a);
	};
	const appendFileToFormData = () => {
		const file = new File(entryChunks, filename, { type: contentType });
		formData.append(entryName, file);
	};
	const appendEntryToFormData = () => {
		formData.append(entryName, entryValue);
	};
	const decoder = new TextDecoder("utf-8");
	decoder.decode();
	parser.onPartBegin = function() {
		parser.onPartData = onPartData;
		parser.onPartEnd = appendEntryToFormData;
		headerField = "";
		headerValue = "";
		entryValue = "";
		entryName = "";
		contentType = "";
		filename = null;
		entryChunks.length = 0;
	};
	parser.onHeaderField = function(ui8a) {
		headerField += decoder.decode(ui8a, { stream: true });
	};
	parser.onHeaderValue = function(ui8a) {
		headerValue += decoder.decode(ui8a, { stream: true });
	};
	parser.onHeaderEnd = function() {
		headerValue += decoder.decode();
		headerField = headerField.toLowerCase();
		if (headerField === "content-disposition") {
			const m = headerValue.match(/\bname=("([^"]*)"|([^()<>@,;:\\"/[\]?={}\s\t]+))/i);
			if (m) entryName = m[2] || m[3] || "";
			filename = _fileName$1(headerValue);
			if (filename) {
				parser.onPartData = appendToFile;
				parser.onPartEnd = appendFileToFormData;
			}
		} else if (headerField === "content-type") contentType = headerValue;
		headerValue = "";
		headerField = "";
	};
	for await (const chunk of Body) parser.write(chunk);
	parser.end();
	return formData;
}
var s$1, S$1, f$1, F$1, LF$1, CR$1, SPACE$1, HYPHEN$1, COLON$1, A$1, Z$1, lower$1, noop$1, MultipartParser$1;
var init_multipart_parser$1 = __esmMin((() => {
	init_from();
	init_esm_min();
	s$1 = 0;
	S$1 = {
		START_BOUNDARY: s$1++,
		HEADER_FIELD_START: s$1++,
		HEADER_FIELD: s$1++,
		HEADER_VALUE_START: s$1++,
		HEADER_VALUE: s$1++,
		HEADER_VALUE_ALMOST_DONE: s$1++,
		HEADERS_ALMOST_DONE: s$1++,
		PART_DATA_START: s$1++,
		PART_DATA: s$1++,
		END: s$1++
	};
	f$1 = 1;
	F$1 = {
		PART_BOUNDARY: f$1,
		LAST_BOUNDARY: f$1 *= 2
	};
	LF$1 = 10;
	CR$1 = 13;
	SPACE$1 = 32;
	HYPHEN$1 = 45;
	COLON$1 = 58;
	A$1 = 97;
	Z$1 = 122;
	lower$1 = (c) => c | 32;
	noop$1 = () => {};
	MultipartParser$1 = class {
		/**
		* @param {string} boundary
		*/
		constructor(boundary) {
			this.index = 0;
			this.flags = 0;
			this.onHeaderEnd = noop$1;
			this.onHeaderField = noop$1;
			this.onHeadersEnd = noop$1;
			this.onHeaderValue = noop$1;
			this.onPartBegin = noop$1;
			this.onPartData = noop$1;
			this.onPartEnd = noop$1;
			this.boundaryChars = {};
			boundary = "\r\n--" + boundary;
			const ui8a = new Uint8Array(boundary.length);
			for (let i = 0; i < boundary.length; i++) {
				ui8a[i] = boundary.charCodeAt(i);
				this.boundaryChars[ui8a[i]] = true;
			}
			this.boundary = ui8a;
			this.lookbehind = new Uint8Array(this.boundary.length + 8);
			this.state = S$1.START_BOUNDARY;
		}
		/**
		* @param {Uint8Array} data
		*/
		write(data) {
			let i = 0;
			const length_ = data.length;
			let previousIndex = this.index;
			let { lookbehind, boundary, boundaryChars, index, state, flags } = this;
			const boundaryLength = this.boundary.length;
			const boundaryEnd = boundaryLength - 1;
			const bufferLength = data.length;
			let c;
			let cl;
			const mark = (name) => {
				this[name + "Mark"] = i;
			};
			const clear = (name) => {
				delete this[name + "Mark"];
			};
			const callback = (callbackSymbol, start, end, ui8a) => {
				if (start === void 0 || start !== end) this[callbackSymbol](ui8a && ui8a.subarray(start, end));
			};
			const dataCallback = (name, clear) => {
				const markSymbol = name + "Mark";
				if (!(markSymbol in this)) return;
				if (clear) {
					callback(name, this[markSymbol], i, data);
					delete this[markSymbol];
				} else {
					callback(name, this[markSymbol], data.length, data);
					this[markSymbol] = 0;
				}
			};
			for (i = 0; i < length_; i++) {
				c = data[i];
				switch (state) {
					case S$1.START_BOUNDARY:
						if (index === boundary.length - 2) {
							if (c === HYPHEN$1) flags |= F$1.LAST_BOUNDARY;
							else if (c !== CR$1) return;
							index++;
							break;
						} else if (index - 1 === boundary.length - 2) {
							if (flags & F$1.LAST_BOUNDARY && c === HYPHEN$1) {
								state = S$1.END;
								flags = 0;
							} else if (!(flags & F$1.LAST_BOUNDARY) && c === LF$1) {
								index = 0;
								callback("onPartBegin");
								state = S$1.HEADER_FIELD_START;
							} else return;
							break;
						}
						if (c !== boundary[index + 2]) index = -2;
						if (c === boundary[index + 2]) index++;
						break;
					case S$1.HEADER_FIELD_START:
						state = S$1.HEADER_FIELD;
						mark("onHeaderField");
						index = 0;
					case S$1.HEADER_FIELD:
						if (c === CR$1) {
							clear("onHeaderField");
							state = S$1.HEADERS_ALMOST_DONE;
							break;
						}
						index++;
						if (c === HYPHEN$1) break;
						if (c === COLON$1) {
							if (index === 1) return;
							dataCallback("onHeaderField", true);
							state = S$1.HEADER_VALUE_START;
							break;
						}
						cl = lower$1(c);
						if (cl < A$1 || cl > Z$1) return;
						break;
					case S$1.HEADER_VALUE_START:
						if (c === SPACE$1) break;
						mark("onHeaderValue");
						state = S$1.HEADER_VALUE;
					case S$1.HEADER_VALUE:
						if (c === CR$1) {
							dataCallback("onHeaderValue", true);
							callback("onHeaderEnd");
							state = S$1.HEADER_VALUE_ALMOST_DONE;
						}
						break;
					case S$1.HEADER_VALUE_ALMOST_DONE:
						if (c !== LF$1) return;
						state = S$1.HEADER_FIELD_START;
						break;
					case S$1.HEADERS_ALMOST_DONE:
						if (c !== LF$1) return;
						callback("onHeadersEnd");
						state = S$1.PART_DATA_START;
						break;
					case S$1.PART_DATA_START:
						state = S$1.PART_DATA;
						mark("onPartData");
					case S$1.PART_DATA:
						previousIndex = index;
						if (index === 0) {
							i += boundaryEnd;
							while (i < bufferLength && !(data[i] in boundaryChars)) i += boundaryLength;
							i -= boundaryEnd;
							c = data[i];
						}
						if (index < boundary.length) {
							if (boundary[index] === c) {
								if (index === 0) dataCallback("onPartData", true);
								index++;
							} else index = 0;
						} else if (index === boundary.length) {
							index++;
							if (c === CR$1) flags |= F$1.PART_BOUNDARY;
							else if (c === HYPHEN$1) flags |= F$1.LAST_BOUNDARY;
							else index = 0;
						} else if (index - 1 === boundary.length) {
							if (flags & F$1.PART_BOUNDARY) {
								index = 0;
								if (c === LF$1) {
									flags &= ~F$1.PART_BOUNDARY;
									callback("onPartEnd");
									callback("onPartBegin");
									state = S$1.HEADER_FIELD_START;
									break;
								}
							} else if (flags & F$1.LAST_BOUNDARY) {
								if (c === HYPHEN$1) {
									callback("onPartEnd");
									state = S$1.END;
									flags = 0;
								} else index = 0;
							} else index = 0;
						}
						if (index > 0) lookbehind[index - 1] = c;
						else if (previousIndex > 0) {
							const _lookbehind = new Uint8Array(lookbehind.buffer, lookbehind.byteOffset, lookbehind.byteLength);
							callback("onPartData", 0, previousIndex, _lookbehind);
							previousIndex = 0;
							mark("onPartData");
							i--;
						}
						break;
					case S$1.END: break;
					default: throw new Error(`Unexpected state entered: ${state}`);
				}
			}
			dataCallback("onHeaderField");
			dataCallback("onHeaderValue");
			dataCallback("onPartData");
			this.index = index;
			this.state = state;
			this.flags = flags;
		}
		end() {
			if (this.state === S$1.HEADER_FIELD_START && this.index === 0 || this.state === S$1.PART_DATA && this.index === this.boundary.length) this.onPartEnd();
			else if (this.state !== S$1.END) throw new Error("MultipartParser.end(): stream ended unexpectedly");
		}
	};
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/errors/base.js
var FetchBaseError;
var init_base = __esmMin((() => {
	FetchBaseError = class extends Error {
		constructor(message, type) {
			super(message);
			Error.captureStackTrace(this, this.constructor);
			this.type = type;
		}
		get name() {
			return this.constructor.name;
		}
		get [Symbol.toStringTag]() {
			return this.constructor.name;
		}
	};
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/errors/fetch-error.js
var FetchError;
var init_fetch_error = __esmMin((() => {
	init_base();
	FetchError = class extends FetchBaseError {
		/**
		* @param  {string} message -      Error message for human
		* @param  {string} [type] -        Error type for machine
		* @param  {SystemError} [systemError] - For Node.js system error
		*/
		constructor(message, type, systemError) {
			super(message, type);
			if (systemError) {
				this.code = this.errno = systemError.code;
				this.erroredSysCall = systemError.syscall;
			}
		}
	};
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/utils/is.js
var NAME, isURLSearchParameters, isBlob, isAbortSignal, isDomainOrSubdomain, isSameProtocol;
var init_is = __esmMin((() => {
	NAME = Symbol.toStringTag;
	isURLSearchParameters = (object) => {
		return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
	};
	isBlob = (object) => {
		return object && typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
	};
	isAbortSignal = (object) => {
		return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
	};
	isDomainOrSubdomain = (destination, original) => {
		const orig = new URL(original).hostname;
		const dest = new URL(destination).hostname;
		return orig === dest || orig.endsWith(`.${dest}`);
	};
	isSameProtocol = (destination, original) => {
		return new URL(original).protocol === new URL(destination).protocol;
	};
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/body.js
/**
* Body.js
*
* Body interface provides common methods for Request and Response
*/
/**
* Consume and convert an entire Body to a Buffer.
*
* Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
*
* @return Promise
*/
async function consumeBody(data) {
	if (data[INTERNALS$2].disturbed) throw new TypeError(`body used already for: ${data.url}`);
	data[INTERNALS$2].disturbed = true;
	if (data[INTERNALS$2].error) throw data[INTERNALS$2].error;
	const { body } = data;
	if (body === null) return Buffer.alloc(0);
	/* c8 ignore next 3 */
	if (!(body instanceof Stream)) return Buffer.alloc(0);
	const accum = [];
	let accumBytes = 0;
	try {
		for await (const chunk of body) {
			if (data.size > 0 && accumBytes + chunk.length > data.size) {
				const error = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
				body.destroy(error);
				throw error;
			}
			accumBytes += chunk.length;
			accum.push(chunk);
		}
	} catch (error) {
		throw error instanceof FetchBaseError ? error : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error.message}`, "system", error);
	}
	if (body.readableEnded === true || body._readableState.ended === true) try {
		if (accum.every((c) => typeof c === "string")) return Buffer.from(accum.join(""));
		return Buffer.concat(accum, accumBytes);
	} catch (error) {
		throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error.message}`, "system", error);
	}
	else throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
}
var pipeline$1, INTERNALS$2, Body, clone, getNonSpecFormDataBoundary, extractContentType, getTotalBytes, writeToStream;
var init_body = __esmMin((() => {
	init_fetch_blob();
	init_esm_min();
	init_fetch_error();
	init_base();
	init_is();
	pipeline$1 = promisify(Stream.pipeline);
	INTERNALS$2 = Symbol("Body internals");
	Body = class {
		constructor(body, { size = 0 } = {}) {
			let boundary = null;
			if (body === null) body = null;
			else if (isURLSearchParameters(body)) body = Buffer.from(body.toString());
			else if (isBlob(body)) {} else if (Buffer.isBuffer(body)) {} else if (types.isAnyArrayBuffer(body)) body = Buffer.from(body);
			else if (ArrayBuffer.isView(body)) body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
			else if (body instanceof Stream) {} else if (body instanceof FormData) {
				body = formDataToBlob(body);
				boundary = body.type.split("=")[1];
			} else body = Buffer.from(String(body));
			let stream = body;
			if (Buffer.isBuffer(body)) stream = Stream.Readable.from(body);
			else if (isBlob(body)) stream = Stream.Readable.from(body.stream());
			this[INTERNALS$2] = {
				body,
				stream,
				boundary,
				disturbed: false,
				error: null
			};
			this.size = size;
			if (body instanceof Stream) body.on("error", (error_) => {
				const error = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
				this[INTERNALS$2].error = error;
			});
		}
		get body() {
			return this[INTERNALS$2].stream;
		}
		get bodyUsed() {
			return this[INTERNALS$2].disturbed;
		}
		/**
		* Decode response as ArrayBuffer
		*
		* @return  Promise
		*/
		async arrayBuffer() {
			const { buffer, byteOffset, byteLength } = await consumeBody(this);
			return buffer.slice(byteOffset, byteOffset + byteLength);
		}
		async formData() {
			const ct = this.headers.get("content-type");
			if (ct.startsWith("application/x-www-form-urlencoded")) {
				const formData = new FormData();
				const parameters = new URLSearchParams(await this.text());
				for (const [name, value] of parameters) formData.append(name, value);
				return formData;
			}
			const { toFormData } = await Promise.resolve().then(() => (init_multipart_parser(), multipart_parser_exports));
			return toFormData(this.body, ct);
		}
		/**
		* Return raw response as Blob
		*
		* @return Promise
		*/
		async blob() {
			const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
			const buf = await this.arrayBuffer();
			return new Blob([buf], { type: ct });
		}
		/**
		* Decode response as json
		*
		* @return  Promise
		*/
		async json() {
			const text = await this.text();
			return JSON.parse(text);
		}
		/**
		* Decode response as text
		*
		* @return  Promise
		*/
		async text() {
			const buffer = await consumeBody(this);
			return new TextDecoder().decode(buffer);
		}
		/**
		* Decode response as buffer (non-spec api)
		*
		* @return  Promise
		*/
		buffer() {
			return consumeBody(this);
		}
	};
	Body.prototype.buffer = deprecate(Body.prototype.buffer, "Please use 'response.arrayBuffer()' instead of 'response.buffer()'", "node-fetch#buffer");
	Object.defineProperties(Body.prototype, {
		body: { enumerable: true },
		bodyUsed: { enumerable: true },
		arrayBuffer: { enumerable: true },
		blob: { enumerable: true },
		json: { enumerable: true },
		text: { enumerable: true },
		data: { get: deprecate(() => {}, "data doesn't exist, use json(), text(), arrayBuffer(), or body instead", "https://github.com/node-fetch/node-fetch/issues/1000 (response)") }
	});
	clone = (instance, highWaterMark) => {
		let p1;
		let p2;
		let { body } = instance[INTERNALS$2];
		if (instance.bodyUsed) throw new Error("cannot clone body after it is used");
		if (body instanceof Stream && typeof body.getBoundary !== "function") {
			p1 = new PassThrough({ highWaterMark });
			p2 = new PassThrough({ highWaterMark });
			body.pipe(p1);
			body.pipe(p2);
			instance[INTERNALS$2].stream = p1;
			body = p2;
		}
		return body;
	};
	getNonSpecFormDataBoundary = deprecate((body) => body.getBoundary(), "form-data doesn't follow the spec and requires special treatment. Use alternative package", "https://github.com/node-fetch/node-fetch/issues/1167");
	extractContentType = (body, request) => {
		if (body === null) return null;
		if (typeof body === "string") return "text/plain;charset=UTF-8";
		if (isURLSearchParameters(body)) return "application/x-www-form-urlencoded;charset=UTF-8";
		if (isBlob(body)) return body.type || null;
		if (Buffer.isBuffer(body) || types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) return null;
		if (body instanceof FormData) return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
		if (body && typeof body.getBoundary === "function") return `multipart/form-data;boundary=${getNonSpecFormDataBoundary(body)}`;
		if (body instanceof Stream) return null;
		return "text/plain;charset=UTF-8";
	};
	getTotalBytes = (request) => {
		const { body } = request[INTERNALS$2];
		if (body === null) return 0;
		if (isBlob(body)) return body.size;
		if (Buffer.isBuffer(body)) return body.length;
		if (body && typeof body.getLengthSync === "function") return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
		return null;
	};
	writeToStream = async (dest, { body }) => {
		if (body === null) dest.end();
		else await pipeline$1(body, dest);
	};
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/headers.js
/**
* Headers.js
*
* Headers class offers convenient helpers
*/
/**
* Create a Headers object from an http.IncomingMessage.rawHeaders, ignoring those that do
* not conform to HTTP grammar productions.
* @param {import('http').IncomingMessage['rawHeaders']} headers
*/
function fromRawHeaders(headers = []) {
	return new Headers(headers.reduce((result, value, index, array) => {
		if (index % 2 === 0) result.push(array.slice(index, index + 2));
		return result;
	}, []).filter(([name, value]) => {
		try {
			validateHeaderName(name);
			validateHeaderValue(name, String(value));
			return true;
		} catch {
			return false;
		}
	}));
}
var validateHeaderName, validateHeaderValue, Headers;
var init_headers = __esmMin((() => {
	validateHeaderName = typeof nodeHTTP.validateHeaderName === "function" ? nodeHTTP.validateHeaderName : (name) => {
		if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
			const error = /* @__PURE__ */ new TypeError(`Header name must be a valid HTTP token [${name}]`);
			Object.defineProperty(error, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
			throw error;
		}
	};
	validateHeaderValue = typeof nodeHTTP.validateHeaderValue === "function" ? nodeHTTP.validateHeaderValue : (name, value) => {
		if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
			const error = /* @__PURE__ */ new TypeError(`Invalid character in header content ["${name}"]`);
			Object.defineProperty(error, "code", { value: "ERR_INVALID_CHAR" });
			throw error;
		}
	};
	Headers = class Headers extends URLSearchParams {
		/**
		* Headers class
		*
		* @constructor
		* @param {HeadersInit} [init] - Response headers
		*/
		constructor(init) {
			/** @type {string[][]} */
			let result = [];
			if (init instanceof Headers) {
				const raw = init.raw();
				for (const [name, values] of Object.entries(raw)) result.push(...values.map((value) => [name, value]));
			} else if (init == null) {} else if (typeof init === "object" && !types.isBoxedPrimitive(init)) {
				const method = init[Symbol.iterator];
				if (method == null) result.push(...Object.entries(init));
				else {
					if (typeof method !== "function") throw new TypeError("Header pairs must be iterable");
					result = [...init].map((pair) => {
						if (typeof pair !== "object" || types.isBoxedPrimitive(pair)) throw new TypeError("Each header pair must be an iterable object");
						return [...pair];
					}).map((pair) => {
						if (pair.length !== 2) throw new TypeError("Each header pair must be a name/value tuple");
						return [...pair];
					});
				}
			} else throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
			result = result.length > 0 ? result.map(([name, value]) => {
				validateHeaderName(name);
				validateHeaderValue(name, String(value));
				return [String(name).toLowerCase(), String(value)];
			}) : void 0;
			super(result);
			return new Proxy(this, { get(target, p, receiver) {
				switch (p) {
					case "append":
					case "set": return (name, value) => {
						validateHeaderName(name);
						validateHeaderValue(name, String(value));
						return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
					};
					case "delete":
					case "has":
					case "getAll": return (name) => {
						validateHeaderName(name);
						return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
					};
					case "keys": return () => {
						target.sort();
						return new Set(URLSearchParams.prototype.keys.call(target)).keys();
					};
					default: return Reflect.get(target, p, receiver);
				}
			} });
			/* c8 ignore next */
		}
		get [Symbol.toStringTag]() {
			return this.constructor.name;
		}
		toString() {
			return Object.prototype.toString.call(this);
		}
		get(name) {
			const values = this.getAll(name);
			if (values.length === 0) return null;
			let value = values.join(", ");
			if (/^content-encoding$/i.test(name)) value = value.toLowerCase();
			return value;
		}
		forEach(callback, thisArg = void 0) {
			for (const name of this.keys()) Reflect.apply(callback, thisArg, [
				this.get(name),
				name,
				this
			]);
		}
		*values() {
			for (const name of this.keys()) yield this.get(name);
		}
		/**
		* @type {() => IterableIterator<[string, string]>}
		*/
		*entries() {
			for (const name of this.keys()) yield [name, this.get(name)];
		}
		[Symbol.iterator]() {
			return this.entries();
		}
		/**
		* Node-fetch non-spec method
		* returning all headers and their values as array
		* @returns {Record<string, string[]>}
		*/
		raw() {
			return [...this.keys()].reduce((result, key) => {
				result[key] = this.getAll(key);
				return result;
			}, {});
		}
		/**
		* For better console.log(headers) and also to convert Headers into Node.js Request compatible format
		*/
		[Symbol.for("nodejs.util.inspect.custom")]() {
			return [...this.keys()].reduce((result, key) => {
				const values = this.getAll(key);
				if (key === "host") result[key] = values[0];
				else result[key] = values.length > 1 ? values : values[0];
				return result;
			}, {});
		}
	};
	/**
	* Re-shaping object for Web IDL tests
	* Only need to do it for overridden methods
	*/
	Object.defineProperties(Headers.prototype, [
		"get",
		"entries",
		"forEach",
		"values"
	].reduce((result, property) => {
		result[property] = { enumerable: true };
		return result;
	}, {}));
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/utils/is-redirect.js
var redirectStatus, isRedirect;
var init_is_redirect = __esmMin((() => {
	redirectStatus = /* @__PURE__ */ new Set([
		301,
		302,
		303,
		307,
		308
	]);
	isRedirect = (code) => {
		return redirectStatus.has(code);
	};
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/response.js
var INTERNALS$1, Response;
var init_response = __esmMin((() => {
	init_headers();
	init_body();
	init_is_redirect();
	INTERNALS$1 = Symbol("Response internals");
	Response = class Response extends Body {
		constructor(body = null, options = {}) {
			super(body, options);
			const status = options.status != null ? options.status : 200;
			const headers = new Headers(options.headers);
			if (body !== null && !headers.has("Content-Type")) {
				const contentType = extractContentType(body, this);
				if (contentType) headers.append("Content-Type", contentType);
			}
			this[INTERNALS$1] = {
				type: "default",
				url: options.url,
				status,
				statusText: options.statusText || "",
				headers,
				counter: options.counter,
				highWaterMark: options.highWaterMark
			};
		}
		get type() {
			return this[INTERNALS$1].type;
		}
		get url() {
			return this[INTERNALS$1].url || "";
		}
		get status() {
			return this[INTERNALS$1].status;
		}
		/**
		* Convenience property representing if the request ended normally
		*/
		get ok() {
			return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
		}
		get redirected() {
			return this[INTERNALS$1].counter > 0;
		}
		get statusText() {
			return this[INTERNALS$1].statusText;
		}
		get headers() {
			return this[INTERNALS$1].headers;
		}
		get highWaterMark() {
			return this[INTERNALS$1].highWaterMark;
		}
		/**
		* Clone this response
		*
		* @return  Response
		*/
		clone() {
			return new Response(clone(this, this.highWaterMark), {
				type: this.type,
				url: this.url,
				status: this.status,
				statusText: this.statusText,
				headers: this.headers,
				ok: this.ok,
				redirected: this.redirected,
				size: this.size,
				highWaterMark: this.highWaterMark
			});
		}
		/**
		* @param {string} url    The URL that the new response is to originate from.
		* @param {number} status An optional status code for the response (e.g., 302.)
		* @returns {Response}    A Response object.
		*/
		static redirect(url, status = 302) {
			if (!isRedirect(status)) throw new RangeError("Failed to execute \"redirect\" on \"response\": Invalid status code");
			return new Response(null, {
				headers: { location: new URL(url).toString() },
				status
			});
		}
		static error() {
			const response = new Response(null, {
				status: 0,
				statusText: ""
			});
			response[INTERNALS$1].type = "error";
			return response;
		}
		static json(data = void 0, init = {}) {
			const body = JSON.stringify(data);
			if (body === void 0) throw new TypeError("data is not JSON serializable");
			const headers = new Headers(init && init.headers);
			if (!headers.has("content-type")) headers.set("content-type", "application/json");
			return new Response(body, {
				...init,
				headers
			});
		}
		get [Symbol.toStringTag]() {
			return "Response";
		}
	};
	Object.defineProperties(Response.prototype, {
		type: { enumerable: true },
		url: { enumerable: true },
		status: { enumerable: true },
		ok: { enumerable: true },
		redirected: { enumerable: true },
		statusText: { enumerable: true },
		headers: { enumerable: true },
		clone: { enumerable: true }
	});
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/utils/get-search.js
var getSearch;
var init_get_search = __esmMin((() => {
	getSearch = (parsedURL) => {
		if (parsedURL.search) return parsedURL.search;
		const lastOffset = parsedURL.href.length - 1;
		const hash = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
		return parsedURL.href[lastOffset - hash.length] === "?" ? "?" : "";
	};
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/utils/referrer.js
/**
* @external URL
* @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL|URL}
*/
/**
* @module utils/referrer
* @private
*/
/**
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#strip-url|Referrer Policy §8.4. Strip url for use as a referrer}
* @param {string} URL
* @param {boolean} [originOnly=false]
*/
function stripURLForUseAsAReferrer(url, originOnly = false) {
	if (url == null) return "no-referrer";
	url = new URL(url);
	if (/^(about|blob|data):$/.test(url.protocol)) return "no-referrer";
	url.username = "";
	url.password = "";
	url.hash = "";
	if (originOnly) {
		url.pathname = "";
		url.search = "";
	}
	return url;
}
/**
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#referrer-policies|Referrer Policy §3. Referrer Policies}
* @param {string} referrerPolicy
* @returns {string} referrerPolicy
*/
function validateReferrerPolicy(referrerPolicy) {
	if (!ReferrerPolicy.has(referrerPolicy)) throw new TypeError(`Invalid referrerPolicy: ${referrerPolicy}`);
	return referrerPolicy;
}
/**
* @see {@link https://w3c.github.io/webappsec-secure-contexts/#is-origin-trustworthy|Referrer Policy §3.2. Is origin potentially trustworthy?}
* @param {external:URL} url
* @returns `true`: "Potentially Trustworthy", `false`: "Not Trustworthy"
*/
function isOriginPotentiallyTrustworthy(url) {
	if (/^(http|ws)s:$/.test(url.protocol)) return true;
	const hostIp = url.host.replace(/(^\[)|(]$)/g, "");
	const hostIPVersion = isIP(hostIp);
	if (hostIPVersion === 4 && /^127\./.test(hostIp)) return true;
	if (hostIPVersion === 6 && /^(((0+:){7})|(::(0+:){0,6}))0*1$/.test(hostIp)) return true;
	if (url.host === "localhost" || url.host.endsWith(".localhost")) return false;
	if (url.protocol === "file:") return true;
	return false;
}
/**
* @see {@link https://w3c.github.io/webappsec-secure-contexts/#is-url-trustworthy|Referrer Policy §3.3. Is url potentially trustworthy?}
* @param {external:URL} url
* @returns `true`: "Potentially Trustworthy", `false`: "Not Trustworthy"
*/
function isUrlPotentiallyTrustworthy(url) {
	if (/^about:(blank|srcdoc)$/.test(url)) return true;
	if (url.protocol === "data:") return true;
	if (/^(blob|filesystem):$/.test(url.protocol)) return true;
	return isOriginPotentiallyTrustworthy(url);
}
/**
* Modifies the referrerURL to enforce any extra security policy considerations.
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}, step 7
* @callback module:utils/referrer~referrerURLCallback
* @param {external:URL} referrerURL
* @returns {external:URL} modified referrerURL
*/
/**
* Modifies the referrerOrigin to enforce any extra security policy considerations.
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}, step 7
* @callback module:utils/referrer~referrerOriginCallback
* @param {external:URL} referrerOrigin
* @returns {external:URL} modified referrerOrigin
*/
/**
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}
* @param {Request} request
* @param {object} o
* @param {module:utils/referrer~referrerURLCallback} o.referrerURLCallback
* @param {module:utils/referrer~referrerOriginCallback} o.referrerOriginCallback
* @returns {external:URL} Request's referrer
*/
function determineRequestsReferrer(request, { referrerURLCallback, referrerOriginCallback } = {}) {
	if (request.referrer === "no-referrer" || request.referrerPolicy === "") return null;
	const policy = request.referrerPolicy;
	if (request.referrer === "about:client") return "no-referrer";
	const referrerSource = request.referrer;
	let referrerURL = stripURLForUseAsAReferrer(referrerSource);
	let referrerOrigin = stripURLForUseAsAReferrer(referrerSource, true);
	if (referrerURL.toString().length > 4096) referrerURL = referrerOrigin;
	if (referrerURLCallback) referrerURL = referrerURLCallback(referrerURL);
	if (referrerOriginCallback) referrerOrigin = referrerOriginCallback(referrerOrigin);
	const currentURL = new URL(request.url);
	switch (policy) {
		case "no-referrer": return "no-referrer";
		case "origin": return referrerOrigin;
		case "unsafe-url": return referrerURL;
		case "strict-origin":
			if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) return "no-referrer";
			return referrerOrigin.toString();
		case "strict-origin-when-cross-origin":
			if (referrerURL.origin === currentURL.origin) return referrerURL;
			if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) return "no-referrer";
			return referrerOrigin;
		case "same-origin":
			if (referrerURL.origin === currentURL.origin) return referrerURL;
			return "no-referrer";
		case "origin-when-cross-origin":
			if (referrerURL.origin === currentURL.origin) return referrerURL;
			return referrerOrigin;
		case "no-referrer-when-downgrade":
			if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) return "no-referrer";
			return referrerURL;
		default: throw new TypeError(`Invalid referrerPolicy: ${policy}`);
	}
}
/**
* @see {@link https://w3c.github.io/webappsec-referrer-policy/#parse-referrer-policy-from-header|Referrer Policy §8.1. Parse a referrer policy from a Referrer-Policy header}
* @param {Headers} headers Response headers
* @returns {string} policy
*/
function parseReferrerPolicyFromHeader(headers) {
	const policyTokens = (headers.get("referrer-policy") || "").split(/[,\s]+/);
	let policy = "";
	for (const token of policyTokens) if (token && ReferrerPolicy.has(token)) policy = token;
	return policy;
}
var ReferrerPolicy, DEFAULT_REFERRER_POLICY;
var init_referrer = __esmMin((() => {
	ReferrerPolicy = /* @__PURE__ */ new Set([
		"",
		"no-referrer",
		"no-referrer-when-downgrade",
		"same-origin",
		"origin",
		"strict-origin",
		"origin-when-cross-origin",
		"strict-origin-when-cross-origin",
		"unsafe-url"
	]);
	DEFAULT_REFERRER_POLICY = "strict-origin-when-cross-origin";
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/request.js
/**
* Request.js
*
* Request class contains server only options
*
* All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
*/
var INTERNALS, isRequest, doBadDataWarn, Request, getNodeRequestOptions;
var init_request = __esmMin((() => {
	init_headers();
	init_body();
	init_is();
	init_get_search();
	init_referrer();
	INTERNALS = Symbol("Request internals");
	isRequest = (object) => {
		return typeof object === "object" && typeof object[INTERNALS] === "object";
	};
	doBadDataWarn = deprecate(() => {}, ".data is not a valid RequestInit property, use .body instead", "https://github.com/node-fetch/node-fetch/issues/1000 (request)");
	Request = class Request extends Body {
		constructor(input, init = {}) {
			let parsedURL;
			if (isRequest(input)) parsedURL = new URL(input.url);
			else {
				parsedURL = new URL(input);
				input = {};
			}
			if (parsedURL.username !== "" || parsedURL.password !== "") throw new TypeError(`${parsedURL} is an url with embedded credentials.`);
			let method = init.method || input.method || "GET";
			if (/^(delete|get|head|options|post|put)$/i.test(method)) method = method.toUpperCase();
			if (!isRequest(init) && "data" in init) doBadDataWarn();
			if ((init.body != null || isRequest(input) && input.body !== null) && (method === "GET" || method === "HEAD")) throw new TypeError("Request with GET/HEAD method cannot have body");
			const inputBody = init.body ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;
			super(inputBody, { size: init.size || input.size || 0 });
			const headers = new Headers(init.headers || input.headers || {});
			if (inputBody !== null && !headers.has("Content-Type")) {
				const contentType = extractContentType(inputBody, this);
				if (contentType) headers.set("Content-Type", contentType);
			}
			let signal = isRequest(input) ? input.signal : null;
			if ("signal" in init) signal = init.signal;
			if (signal != null && !isAbortSignal(signal)) throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
			let referrer = init.referrer == null ? input.referrer : init.referrer;
			if (referrer === "") referrer = "no-referrer";
			else if (referrer) {
				const parsedReferrer = new URL(referrer);
				referrer = /^about:(\/\/)?client$/.test(parsedReferrer) ? "client" : parsedReferrer;
			} else referrer = void 0;
			this[INTERNALS] = {
				method,
				redirect: init.redirect || input.redirect || "follow",
				headers,
				parsedURL,
				signal,
				referrer
			};
			this.follow = init.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init.follow;
			this.compress = init.compress === void 0 ? input.compress === void 0 ? true : input.compress : init.compress;
			this.counter = init.counter || input.counter || 0;
			this.agent = init.agent || input.agent;
			this.highWaterMark = init.highWaterMark || input.highWaterMark || 16384;
			this.insecureHTTPParser = init.insecureHTTPParser || input.insecureHTTPParser || false;
			this.referrerPolicy = init.referrerPolicy || input.referrerPolicy || "";
		}
		/** @returns {string} */
		get method() {
			return this[INTERNALS].method;
		}
		/** @returns {string} */
		get url() {
			return format(this[INTERNALS].parsedURL);
		}
		/** @returns {Headers} */
		get headers() {
			return this[INTERNALS].headers;
		}
		get redirect() {
			return this[INTERNALS].redirect;
		}
		/** @returns {AbortSignal} */
		get signal() {
			return this[INTERNALS].signal;
		}
		get referrer() {
			if (this[INTERNALS].referrer === "no-referrer") return "";
			if (this[INTERNALS].referrer === "client") return "about:client";
			if (this[INTERNALS].referrer) return this[INTERNALS].referrer.toString();
		}
		get referrerPolicy() {
			return this[INTERNALS].referrerPolicy;
		}
		set referrerPolicy(referrerPolicy) {
			this[INTERNALS].referrerPolicy = validateReferrerPolicy(referrerPolicy);
		}
		/**
		* Clone this request
		*
		* @return  Request
		*/
		clone() {
			return new Request(this);
		}
		get [Symbol.toStringTag]() {
			return "Request";
		}
	};
	Object.defineProperties(Request.prototype, {
		method: { enumerable: true },
		url: { enumerable: true },
		headers: { enumerable: true },
		redirect: { enumerable: true },
		clone: { enumerable: true },
		signal: { enumerable: true },
		referrer: { enumerable: true },
		referrerPolicy: { enumerable: true }
	});
	getNodeRequestOptions = (request) => {
		const { parsedURL } = request[INTERNALS];
		const headers = new Headers(request[INTERNALS].headers);
		if (!headers.has("Accept")) headers.set("Accept", "*/*");
		let contentLengthValue = null;
		if (request.body === null && /^(post|put)$/i.test(request.method)) contentLengthValue = "0";
		if (request.body !== null) {
			const totalBytes = getTotalBytes(request);
			if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) contentLengthValue = String(totalBytes);
		}
		if (contentLengthValue) headers.set("Content-Length", contentLengthValue);
		if (request.referrerPolicy === "") request.referrerPolicy = DEFAULT_REFERRER_POLICY;
		if (request.referrer && request.referrer !== "no-referrer") request[INTERNALS].referrer = determineRequestsReferrer(request);
		else request[INTERNALS].referrer = "no-referrer";
		if (request[INTERNALS].referrer instanceof URL) headers.set("Referer", request.referrer);
		if (!headers.has("User-Agent")) headers.set("User-Agent", "node-fetch");
		if (request.compress && !headers.has("Accept-Encoding")) headers.set("Accept-Encoding", "gzip, deflate, br");
		let { agent } = request;
		if (typeof agent === "function") agent = agent(parsedURL);
		const search = getSearch(parsedURL);
		return {
			/** @type {URL} */
			parsedURL,
			options: {
				path: parsedURL.pathname + search,
				method: request.method,
				headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
				insecureHTTPParser: request.insecureHTTPParser,
				agent
			}
		};
	};
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/errors/abort-error.js
var AbortError;
var init_abort_error = __esmMin((() => {
	init_base();
	AbortError = class extends FetchBaseError {
		constructor(message, type = "aborted") {
			super(message, type);
		}
	};
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/index.js
/**
* Index.js
*
* a request API compatible with window.fetch
*
* All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
*/
var src_exports = /* @__PURE__ */ __exportAll({
	AbortError: () => AbortError,
	FetchError: () => FetchError,
	Headers: () => Headers,
	Request: () => Request,
	Response: () => Response,
	default: () => fetch,
	isRedirect: () => isRedirect
});
/**
* Fetch function
*
* @param   {string | URL | import('./request').default} url - Absolute url or Request instance
* @param   {*} [options_] - Fetch options
* @return  {Promise<import('./response').default>}
*/
async function fetch(url, options_) {
	return new Promise((resolve, reject) => {
		const request = new Request(url, options_);
		const { parsedURL, options } = getNodeRequestOptions(request);
		if (!supportedSchemas.has(parsedURL.protocol)) throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${parsedURL.protocol.replace(/:$/, "")}" is not supported.`);
		if (parsedURL.protocol === "data:") {
			const data = dataUriToBuffer(request.url);
			resolve(new Response(data, { headers: { "Content-Type": data.typeFull } }));
			return;
		}
		const send = (parsedURL.protocol === "https:" ? nodeHTTPS : nodeHTTP).request;
		const { signal } = request;
		let response = null;
		const abort = () => {
			const error = new AbortError("The operation was aborted.");
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) request.body.destroy(error);
			if (!response || !response.body) return;
			response.body.emit("error", error);
		};
		if (signal && signal.aborted) {
			abort();
			return;
		}
		const abortAndFinalize = () => {
			abort();
			finalize();
		};
		const request_ = send(parsedURL.toString(), options);
		if (signal) signal.addEventListener("abort", abortAndFinalize);
		const finalize = () => {
			request_.abort();
			if (signal) signal.removeEventListener("abort", abortAndFinalize);
		};
		request_.on("error", (error) => {
			reject(new FetchError(`request to ${request.url} failed, reason: ${error.message}`, "system", error));
			finalize();
		});
		fixResponseChunkedTransferBadEnding(request_, (error) => {
			if (response && response.body) response.body.destroy(error);
		});
		/* c8 ignore next 18 */
		if (process.version < "v14") request_.on("socket", (s) => {
			let endedWithEventsCount;
			s.prependListener("end", () => {
				endedWithEventsCount = s._eventsCount;
			});
			s.prependListener("close", (hadError) => {
				if (response && endedWithEventsCount < s._eventsCount && !hadError) {
					const error = /* @__PURE__ */ new Error("Premature close");
					error.code = "ERR_STREAM_PREMATURE_CLOSE";
					response.body.emit("error", error);
				}
			});
		});
		request_.on("response", (response_) => {
			request_.setTimeout(0);
			const headers = fromRawHeaders(response_.rawHeaders);
			if (isRedirect(response_.statusCode)) {
				const location = headers.get("Location");
				let locationURL = null;
				try {
					locationURL = location === null ? null : new URL(location, request.url);
				} catch {
					if (request.redirect !== "manual") {
						reject(new FetchError(`uri requested responds with an invalid redirect URL: ${location}`, "invalid-redirect"));
						finalize();
						return;
					}
				}
				switch (request.redirect) {
					case "error":
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
						finalize();
						return;
					case "manual": break;
					case "follow": {
						if (locationURL === null) break;
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
							finalize();
							return;
						}
						const requestOptions = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: clone(request),
							signal: request.signal,
							size: request.size,
							referrer: request.referrer,
							referrerPolicy: request.referrerPolicy
						};
						if (!isDomainOrSubdomain(request.url, locationURL) || !isSameProtocol(request.url, locationURL)) for (const name of [
							"authorization",
							"www-authenticate",
							"cookie",
							"cookie2"
						]) requestOptions.headers.delete(name);
						if (response_.statusCode !== 303 && request.body && options_.body instanceof Stream.Readable) {
							reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
							finalize();
							return;
						}
						if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
							requestOptions.method = "GET";
							requestOptions.body = void 0;
							requestOptions.headers.delete("content-length");
						}
						const responseReferrerPolicy = parseReferrerPolicyFromHeader(headers);
						if (responseReferrerPolicy) requestOptions.referrerPolicy = responseReferrerPolicy;
						resolve(fetch(new Request(locationURL, requestOptions)));
						finalize();
						return;
					}
					default: return reject(/* @__PURE__ */ new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
				}
			}
			if (signal) response_.once("end", () => {
				signal.removeEventListener("abort", abortAndFinalize);
			});
			let body = pipeline(response_, new PassThrough(), (error) => {
				if (error) reject(error);
			});
			/* c8 ignore next 3 */
			if (process.version < "v12.10") response_.on("aborted", abortAndFinalize);
			const responseOptions = {
				url: request.url,
				status: response_.statusCode,
				statusText: response_.statusMessage,
				headers,
				size: request.size,
				counter: request.counter,
				highWaterMark: request.highWaterMark
			};
			const codings = headers.get("Content-Encoding");
			if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
				response = new Response(body, responseOptions);
				resolve(response);
				return;
			}
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};
			if (codings === "gzip" || codings === "x-gzip") {
				body = pipeline(body, zlib.createGunzip(zlibOptions), (error) => {
					if (error) reject(error);
				});
				response = new Response(body, responseOptions);
				resolve(response);
				return;
			}
			if (codings === "deflate" || codings === "x-deflate") {
				const raw = pipeline(response_, new PassThrough(), (error) => {
					if (error) reject(error);
				});
				raw.once("data", (chunk) => {
					if ((chunk[0] & 15) === 8) body = pipeline(body, zlib.createInflate(), (error) => {
						if (error) reject(error);
					});
					else body = pipeline(body, zlib.createInflateRaw(), (error) => {
						if (error) reject(error);
					});
					response = new Response(body, responseOptions);
					resolve(response);
				});
				raw.once("end", () => {
					if (!response) {
						response = new Response(body, responseOptions);
						resolve(response);
					}
				});
				return;
			}
			if (codings === "br") {
				body = pipeline(body, zlib.createBrotliDecompress(), (error) => {
					if (error) reject(error);
				});
				response = new Response(body, responseOptions);
				resolve(response);
				return;
			}
			response = new Response(body, responseOptions);
			resolve(response);
		});
		writeToStream(request_, request).catch(reject);
	});
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
	const LAST_CHUNK = Buffer.from("0\r\n\r\n");
	let isChunkedTransfer = false;
	let properLastChunkReceived = false;
	let previousChunk;
	request.on("response", (response) => {
		const { headers } = response;
		isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
	});
	request.on("socket", (socket) => {
		const onSocketClose = () => {
			if (isChunkedTransfer && !properLastChunkReceived) {
				const error = /* @__PURE__ */ new Error("Premature close");
				error.code = "ERR_STREAM_PREMATURE_CLOSE";
				errorCallback(error);
			}
		};
		const onData = (buf) => {
			properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
			if (!properLastChunkReceived && previousChunk) properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
			previousChunk = buf;
		};
		socket.prependListener("close", onSocketClose);
		socket.on("data", onData);
		request.on("close", () => {
			socket.removeListener("close", onSocketClose);
			socket.removeListener("data", onData);
		});
	});
}
var supportedSchemas;
var init_src = __esmMin((() => {
	init_dist();
	init_body();
	init_response();
	init_headers();
	init_request();
	init_fetch_error();
	init_abort_error();
	init_is_redirect();
	init_esm_min();
	init_is();
	init_referrer();
	init_from();
	supportedSchemas = /* @__PURE__ */ new Set([
		"data:",
		"http:",
		"https:"
	]);
}));
//#endregion
//#region node_modules/google-auth-library/node_modules/node-fetch/src/utils/multipart-parser.js
var multipart_parser_exports = /* @__PURE__ */ __exportAll({ toFormData: () => toFormData });
function _fileName(headerValue) {
	const m = headerValue.match(/\bfilename=("(.*?)"|([^()<>@,;:\\"/[\]?={}\s\t]+))($|;\s)/i);
	if (!m) return;
	const match = m[2] || m[3] || "";
	let filename = match.slice(match.lastIndexOf("\\") + 1);
	filename = filename.replace(/%22/g, "\"");
	filename = filename.replace(/&#(\d{4});/g, (m, code) => {
		return String.fromCharCode(code);
	});
	return filename;
}
async function toFormData(Body, ct) {
	if (!/multipart/i.test(ct)) throw new TypeError("Failed to fetch");
	const m = ct.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
	if (!m) throw new TypeError("no or bad content-type header, no multipart boundary");
	const parser = new MultipartParser(m[1] || m[2]);
	let headerField;
	let headerValue;
	let entryValue;
	let entryName;
	let contentType;
	let filename;
	const entryChunks = [];
	const formData = new FormData();
	const onPartData = (ui8a) => {
		entryValue += decoder.decode(ui8a, { stream: true });
	};
	const appendToFile = (ui8a) => {
		entryChunks.push(ui8a);
	};
	const appendFileToFormData = () => {
		const file = new File(entryChunks, filename, { type: contentType });
		formData.append(entryName, file);
	};
	const appendEntryToFormData = () => {
		formData.append(entryName, entryValue);
	};
	const decoder = new TextDecoder("utf-8");
	decoder.decode();
	parser.onPartBegin = function() {
		parser.onPartData = onPartData;
		parser.onPartEnd = appendEntryToFormData;
		headerField = "";
		headerValue = "";
		entryValue = "";
		entryName = "";
		contentType = "";
		filename = null;
		entryChunks.length = 0;
	};
	parser.onHeaderField = function(ui8a) {
		headerField += decoder.decode(ui8a, { stream: true });
	};
	parser.onHeaderValue = function(ui8a) {
		headerValue += decoder.decode(ui8a, { stream: true });
	};
	parser.onHeaderEnd = function() {
		headerValue += decoder.decode();
		headerField = headerField.toLowerCase();
		if (headerField === "content-disposition") {
			const m = headerValue.match(/\bname=("([^"]*)"|([^()<>@,;:\\"/[\]?={}\s\t]+))/i);
			if (m) entryName = m[2] || m[3] || "";
			filename = _fileName(headerValue);
			if (filename) {
				parser.onPartData = appendToFile;
				parser.onPartEnd = appendFileToFormData;
			}
		} else if (headerField === "content-type") contentType = headerValue;
		headerValue = "";
		headerField = "";
	};
	for await (const chunk of Body) parser.write(chunk);
	parser.end();
	return formData;
}
var s, S, f, F, LF, CR, SPACE, HYPHEN, COLON, A, Z, lower, noop, MultipartParser;
var init_multipart_parser = __esmMin((() => {
	init_from();
	init_esm_min();
	s = 0;
	S = {
		START_BOUNDARY: s++,
		HEADER_FIELD_START: s++,
		HEADER_FIELD: s++,
		HEADER_VALUE_START: s++,
		HEADER_VALUE: s++,
		HEADER_VALUE_ALMOST_DONE: s++,
		HEADERS_ALMOST_DONE: s++,
		PART_DATA_START: s++,
		PART_DATA: s++,
		END: s++
	};
	f = 1;
	F = {
		PART_BOUNDARY: f,
		LAST_BOUNDARY: f *= 2
	};
	LF = 10;
	CR = 13;
	SPACE = 32;
	HYPHEN = 45;
	COLON = 58;
	A = 97;
	Z = 122;
	lower = (c) => c | 32;
	noop = () => {};
	MultipartParser = class {
		/**
		* @param {string} boundary
		*/
		constructor(boundary) {
			this.index = 0;
			this.flags = 0;
			this.onHeaderEnd = noop;
			this.onHeaderField = noop;
			this.onHeadersEnd = noop;
			this.onHeaderValue = noop;
			this.onPartBegin = noop;
			this.onPartData = noop;
			this.onPartEnd = noop;
			this.boundaryChars = {};
			boundary = "\r\n--" + boundary;
			const ui8a = new Uint8Array(boundary.length);
			for (let i = 0; i < boundary.length; i++) {
				ui8a[i] = boundary.charCodeAt(i);
				this.boundaryChars[ui8a[i]] = true;
			}
			this.boundary = ui8a;
			this.lookbehind = new Uint8Array(this.boundary.length + 8);
			this.state = S.START_BOUNDARY;
		}
		/**
		* @param {Uint8Array} data
		*/
		write(data) {
			let i = 0;
			const length_ = data.length;
			let previousIndex = this.index;
			let { lookbehind, boundary, boundaryChars, index, state, flags } = this;
			const boundaryLength = this.boundary.length;
			const boundaryEnd = boundaryLength - 1;
			const bufferLength = data.length;
			let c;
			let cl;
			const mark = (name) => {
				this[name + "Mark"] = i;
			};
			const clear = (name) => {
				delete this[name + "Mark"];
			};
			const callback = (callbackSymbol, start, end, ui8a) => {
				if (start === void 0 || start !== end) this[callbackSymbol](ui8a && ui8a.subarray(start, end));
			};
			const dataCallback = (name, clear) => {
				const markSymbol = name + "Mark";
				if (!(markSymbol in this)) return;
				if (clear) {
					callback(name, this[markSymbol], i, data);
					delete this[markSymbol];
				} else {
					callback(name, this[markSymbol], data.length, data);
					this[markSymbol] = 0;
				}
			};
			for (i = 0; i < length_; i++) {
				c = data[i];
				switch (state) {
					case S.START_BOUNDARY:
						if (index === boundary.length - 2) {
							if (c === HYPHEN) flags |= F.LAST_BOUNDARY;
							else if (c !== CR) return;
							index++;
							break;
						} else if (index - 1 === boundary.length - 2) {
							if (flags & F.LAST_BOUNDARY && c === HYPHEN) {
								state = S.END;
								flags = 0;
							} else if (!(flags & F.LAST_BOUNDARY) && c === LF) {
								index = 0;
								callback("onPartBegin");
								state = S.HEADER_FIELD_START;
							} else return;
							break;
						}
						if (c !== boundary[index + 2]) index = -2;
						if (c === boundary[index + 2]) index++;
						break;
					case S.HEADER_FIELD_START:
						state = S.HEADER_FIELD;
						mark("onHeaderField");
						index = 0;
					case S.HEADER_FIELD:
						if (c === CR) {
							clear("onHeaderField");
							state = S.HEADERS_ALMOST_DONE;
							break;
						}
						index++;
						if (c === HYPHEN) break;
						if (c === COLON) {
							if (index === 1) return;
							dataCallback("onHeaderField", true);
							state = S.HEADER_VALUE_START;
							break;
						}
						cl = lower(c);
						if (cl < A || cl > Z) return;
						break;
					case S.HEADER_VALUE_START:
						if (c === SPACE) break;
						mark("onHeaderValue");
						state = S.HEADER_VALUE;
					case S.HEADER_VALUE:
						if (c === CR) {
							dataCallback("onHeaderValue", true);
							callback("onHeaderEnd");
							state = S.HEADER_VALUE_ALMOST_DONE;
						}
						break;
					case S.HEADER_VALUE_ALMOST_DONE:
						if (c !== LF) return;
						state = S.HEADER_FIELD_START;
						break;
					case S.HEADERS_ALMOST_DONE:
						if (c !== LF) return;
						callback("onHeadersEnd");
						state = S.PART_DATA_START;
						break;
					case S.PART_DATA_START:
						state = S.PART_DATA;
						mark("onPartData");
					case S.PART_DATA:
						previousIndex = index;
						if (index === 0) {
							i += boundaryEnd;
							while (i < bufferLength && !(data[i] in boundaryChars)) i += boundaryLength;
							i -= boundaryEnd;
							c = data[i];
						}
						if (index < boundary.length) {
							if (boundary[index] === c) {
								if (index === 0) dataCallback("onPartData", true);
								index++;
							} else index = 0;
						} else if (index === boundary.length) {
							index++;
							if (c === CR) flags |= F.PART_BOUNDARY;
							else if (c === HYPHEN) flags |= F.LAST_BOUNDARY;
							else index = 0;
						} else if (index - 1 === boundary.length) {
							if (flags & F.PART_BOUNDARY) {
								index = 0;
								if (c === LF) {
									flags &= ~F.PART_BOUNDARY;
									callback("onPartEnd");
									callback("onPartBegin");
									state = S.HEADER_FIELD_START;
									break;
								}
							} else if (flags & F.LAST_BOUNDARY) {
								if (c === HYPHEN) {
									callback("onPartEnd");
									state = S.END;
									flags = 0;
								} else index = 0;
							} else index = 0;
						}
						if (index > 0) lookbehind[index - 1] = c;
						else if (previousIndex > 0) {
							const _lookbehind = new Uint8Array(lookbehind.buffer, lookbehind.byteOffset, lookbehind.byteLength);
							callback("onPartData", 0, previousIndex, _lookbehind);
							previousIndex = 0;
							mark("onPartData");
							i--;
						}
						break;
					case S.END: break;
					default: throw new Error(`Unexpected state entered: ${state}`);
				}
			}
			dataCallback("onHeaderField");
			dataCallback("onHeaderValue");
			dataCallback("onPartData");
			this.index = index;
			this.state = state;
			this.flags = flags;
		}
		end() {
			if (this.state === S.HEADER_FIELD_START && this.index === 0 || this.state === S.PART_DATA && this.index === this.boundary.length) this.onPartEnd();
			else if (this.state !== S.END) throw new Error("MultipartParser.end(): stream ended unexpectedly");
		}
	};
}));
//#endregion
export { src_exports$1 as i, src_exports as n, init_src$1 as r, init_src as t };
