import { HttpMethod } from '@/models/common';
import { arrayOfNotFalsy, distinct } from '@/utils/array';
import { absoluteOrRelativeURL } from '@/utils/url';

type AppInfos = {
  apiUrl: string;
  loginUrl: string;
};

let appInfos: AppInfos;

/**
 * Retrieve API informations
 */
export const getAppInfos = async (): Promise<AppInfos> => {
  if (!appInfos) {
    if (import.meta.env.DEV || import.meta.env.PROD) {
      appInfos = {
        apiUrl: import.meta.env.VITE_API_URL,
        loginUrl: import.meta.env.VITE_LOGIN_URL,
      };
    } else {
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(absoluteOrRelativeURL(apiUrl));
      const data = await response.json();

      appInfos = {
        apiUrl,
        loginUrl: data.links.login.href,
      };
    }
  }

  return appInfos;
};

export type ApiError = {
  code: number;
  title: string;
  detail: string;
};

export type ApiErrorResponse = {
  errors: ApiError[];
};

export type ApiResponse<TData, TError = ApiErrorResponse> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      error: TError;
    };

type ApiOptions = ({ url: string } | { path: string; query?: Record<string, any>; endpoint?: keyof AppInfos }) & {
  method?: HttpMethod;
  body?: any;
  contentType?: 'json' | 'xml';
  authorization?: string | undefined | (() => string | undefined) | (() => Promise<string | undefined>);
};

export const handleApiCall = async <TData, TError = ApiErrorResponse>(
  options: ApiOptions,
): Promise<ApiResponse<TData, TError>> => {
  let url: URL;
  if ('url' in options) {
    url = absoluteOrRelativeURL(options.url);
  } else {
    const appInfos = await getAppInfos();
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

  const headers: HeadersInit = {};

  if (options.authorization) {
    const auth = typeof options.authorization === 'function' ? await options.authorization() : options.authorization;

    if (auth) {
      headers.Authorization = auth;
    }
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body:
      'body' in options ? (options.contentType === 'json' ? JSON.stringify(options.body) : options.body) : undefined,
  });

  if (response.ok) {
    return {
      success: true,
      data: await response.json(),
    };
  } else {
    return {
      success: false,
      error: await response.json(),
    };
  }
};

export const compactErrors = (...errors: (ApiErrorResponse | undefined | false)[]): ApiErrorResponse | undefined => {
  const flattenErrors = distinct(arrayOfNotFalsy(...errors).flatMap((error) => error.errors));
  return flattenErrors.length > 0 ? { errors: flattenErrors } : undefined;
};

export const buildApiErrorResponse = (error?: Partial<ApiError>): ApiErrorResponse => ({
  errors: [{ code: 9999, title: 'Erreur inattendue', detail: 'Erreur inattendue', ...error }],
});

export const buildApiResponseWithError = (error?: Partial<ApiError>): ApiResponse<never, ApiErrorResponse> => ({
  success: false,
  error: buildApiErrorResponse(error),
});

export const TODO = (description: string = 'Not yet implemented'): ApiResponse<never, ApiErrorResponse> => {
  return {
    success: false,
    error: buildApiErrorResponse({ code: 0, title: 'TODO', detail: description }),
  };
};
