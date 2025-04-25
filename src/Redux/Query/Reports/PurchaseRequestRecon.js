import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const purchaseRequestReconApi = createApi({
  reducerPath: "purchaseRequestRecon",
  tagTypes: ["PurchaseRequestRecon"],

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
    getPurchaseRequestRecon: builder.query({
      query: (params) =>
        `/recon/pr-recon?year_month=${params.year_month}&per_page=${params.per_page}&page=${params.page}&pagination=${params.pagination}`,
      providesTags: ["PurchaseRequestRecon"],
    }),

    getPurchaseRequestReconExport: builder.query({
      query: (params) =>
        // `/recon/pr-recon?year_month=${params.year_month}&per_page=${params.per_page}&page=${params.page}&pagination=${params.pagination}`,
        {
          const queryParams = [`per_page=${params.per_page}`, `page=${params.page}`, `pagination=${params.pagination}`];

          if (params.year_month) {
            queryParams.push(`year_month=${params.year_month}`);
          }

          const queryString = queryParams.join("&");
          return `/recon/pr-recon?${queryString}`;
        },

      providesTags: ["PurchaseRequestRecon"],
    }),
  }),
});

export const {
  useGetPurchaseRequestReconQuery,
  useLazyGetPurchaseRequestReconQuery,
  useLazyGetPurchaseRequestReconExportQuery,
} = purchaseRequestReconApi;
