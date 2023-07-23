import { HttpMethod } from '@/models/common';
import { arrayOfNotFalsy } from '@/utils/array';
import { Result } from '@/utils/result';
import { absoluteOrRelativeURL } from '@/utils/url';
import { uniq } from 'lodash';

const serverUrl: string = import.meta.env.VITE_SERVER_URL || '';

export const appInfos = {
  apiUrl: `${serverUrl}/api`,
  loginUrl: `${serverUrl}/login`,
  wssUrl: serverUrl.replace(/^http/, 'ws'),
};

type AppInfos = typeof appInfos;

export type ApiError = {
  code: number;
  title: string;
  detail: string;
};

export type ApiErrorResponse = {
  errors: ApiError[];
};

type ApiOptions = ({ url: string } | { path: string; query?: Record<string, any>; endpoint?: keyof AppInfos }) & {
  method?: HttpMethod;
  body?: any;
  contentType?: 'json' | 'xml';
  authorization?: string | undefined | (() => string | undefined) | (() => Promise<string | undefined>);
};

export const handleApiCall = async <TData, TError = ApiErrorResponse>(
  options: ApiOptions,
): Promise<Result<TData, TError>> => {
  let url: URL;
  if ('url' in options) {
    url = absoluteOrRelativeURL(options.url);
  } else {
    url = absoluteOrRelativeURL(appInfos[options.endpoint ?? 'apiUrl']);
    url.pathname += options.path;
    if (options.query) {
      const searchParams = new URLSearchParams();
      Object.entries(options.query).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      url.search = searchParams.toString();
    }
  }

  const contentType = options.contentType ?? 'json';

  const headers: HeadersInit = {};

  if (options.authorization) {
    const auth = typeof options.authorization === 'function' ? await options.authorization() : options.authorization;

    if (auth) {
      headers.Authorization = auth;
    }
  }

  let body: any = undefined;
  if ('body' in options) {
    if (contentType === 'json') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    } else {
      body = options.body;
    }
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body,
  });

  if (response.ok) {
    return {
      success: true,
      data: await response.json().catch(() => undefined),
    };
  } else {
    return {
      success: false,
      error: await response.json().catch(() => undefined),
    };
  }
};

export const queryParams = (params: Record<string, any>): Record<string, any> => {
  const query: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query[key] = value;
    }
  });

  return query;
};

export const compactErrors = (...errors: (ApiErrorResponse | undefined | false)[]): ApiErrorResponse | undefined => {
  const flattenErrors = uniq(arrayOfNotFalsy(...errors).flatMap((error) => error.errors));
  return flattenErrors.length > 0 ? { errors: flattenErrors } : undefined;
};

export const buildApiErrorResponse = (error?: Partial<ApiError>): ApiErrorResponse => ({
  errors: [{ code: 9999, title: 'Erreur inattendue', detail: 'Erreur inattendue', ...error }],
});

export const buildResultWithError = (error?: Partial<ApiError>): Result<never, ApiErrorResponse> => ({
  success: false,
  error: buildApiErrorResponse(error),
});

export const TODO = (description: string = 'Not yet implemented'): Result<never, ApiErrorResponse> => {
  return {
    success: false,
    error: buildApiErrorResponse({ code: 0, title: 'TODO', detail: description }),
  };
};
