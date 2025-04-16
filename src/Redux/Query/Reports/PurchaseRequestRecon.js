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
      query: () => `/recon/pr-recon`,
      providesTags: ["PurchaseRequestRecon"],
    }),
  }),
});

export const { useGetPurchaseRequestReconQuery } = purchaseRequestReconApi;
