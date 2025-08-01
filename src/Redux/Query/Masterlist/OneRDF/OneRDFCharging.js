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
      query: (params) => ({
        url: `/one-charging`,
        params,
      }),
      providesTags: ["OneRDFCharging"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetOneRDFChargingAllApiQuery, useLazyGetOneRDFChargingAllApiQuery } = oneRDFApi;
