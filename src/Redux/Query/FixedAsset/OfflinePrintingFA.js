import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const printOfflineFaApi = createApi({
  reducerPath: "printFixedAssetApi",

  baseQuery: fetchBaseQuery({
    // baseUrl: `http://10.10.10.6:9000/api`,
    baseUrl: process.env.VLADIMIR_BASE_URL,
    // baseUrl: `https://pretestalpha.rdfmis.ph/server/api`,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      headers.set("Authorization", `Bearer ${token}`);
      headers.set("Accept", `application/json`);

      return headers;
    },
  }),

  endpoints: (builder) => ({
    postPrintOfflineApi: builder.mutation({
      query: (params) => ({
        url: `/fixed-asset/barcode?search=${params.search}&startDate=${params.startDate}&endDate=${params.endDate}`,
        method: "POST",
      }),
    }),
  }),
});

export const { usePostPrintOfflineApiMutation } = printOfflineFaApi;
