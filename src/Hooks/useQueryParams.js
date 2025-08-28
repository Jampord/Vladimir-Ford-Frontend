// hooks/useQueryParams.js
import { useSearchParams, useLocation } from "react-router-dom";
import { useCallback } from "react";

export const useQueryParams = () => {
  try {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    const getParam = useCallback(
      (key, defaultValue = "") => {
        return searchParams.get(key) || defaultValue;
      },
      [searchParams]
    );

    const getNumericParam = useCallback(
      (key, defaultValue = 0) => {
        const value = searchParams.get(key);
        return value ? parseInt(value) : defaultValue;
      },
      [searchParams]
    );

    const setParam = useCallback(
      (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === "" || value === null || value === undefined) {
          newParams.delete(key);
        } else {
          newParams.set(key, value.toString());
        }
        setSearchParams(newParams, { replace: true });
      },
      [searchParams, setSearchParams]
    );

    const setMultipleParams = useCallback(
      (params) => {
        const newParams = new URLSearchParams(searchParams);

        Object.entries(params).forEach(([key, value]) => {
          if (value === "" || value === null || value === undefined) {
            newParams.delete(key);
          } else {
            newParams.set(key, value.toString());
          }
        });

        setSearchParams(newParams, { replace: true });
      },
      [searchParams, setSearchParams]
    );

    const getAllParams = useCallback(() => {
      return Object.fromEntries(searchParams.entries());
    }, [searchParams]);

    return {
      getParam,
      getNumericParam,
      setParam,
      setMultipleParams,
      getAllParams,
      searchParams,
      location,
    };
  } catch (error) {
    console.warn("Router context not available, using fallback implementation");

    const fallbackGetParam = (key, defaultValue = "") => defaultValue;
    const fallbackSetParam = () => {};

    return {
      getParam: fallbackGetParam,
      getNumericParam: fallbackGetParam,
      setParam: fallbackSetParam,
      setMultipleParams: fallbackSetParam,
      getAllParams: () => ({}),
      searchParams: new URLSearchParams(),
      location: { pathname: "" },
    };
  }
};
