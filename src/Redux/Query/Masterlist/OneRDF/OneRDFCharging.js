import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const oneRDFApi = createApi({
  reducerPath: "oneRDFChargingApi",
  tagTypes: ["OneRDFCharging"],

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.VLADIMIR_BASE_URL,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      headers.set("Authorization", `Bearer ${token}`);
      headers.set("Accept", `application/json`);

      return headers;
    },
  }),

  endpoints: (builder) => ({
    getOneRDFChargingAllApi: builder.query({
      query: (params) => {
        const queryParams = [];

        if (params.page) {
          queryParams.push(`page=${params.page}`);
        }
        if (params.per_page) {
          queryParams.push(`per_page=${params.per_page}`);
        }
        if (params.pagination) {
          queryParams.push(`pagination=${params.pagination}`);
        }
        if (params.search) {
          queryParams.push(`search=${params.search}`);
        }
        if (params.status) {
          queryParams.push(`status=${params.status}`);
        }
        if (params.user_id) {
          queryParams.push(`user_id=${params.user_id}`);
        }

        const queryString = queryParams.join("&");
        return `/one-charging?${queryString}`;
      },
      providesTags: ["OneRDFCharging"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetOneRDFChargingAllApiQuery, useLazyGetOneRDFChargingAllApiQuery } = oneRDFApi;
