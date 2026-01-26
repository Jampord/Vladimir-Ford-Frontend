import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const physicalInventoryApi = createApi({
  reducerPath: "physicalInventoryApi",
  tagTypes: ["PhysicalInventory"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.VLADIMIR_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      headers.set("x-api-key", `${process.env.GL_KEY}`);
      headers.set("Accept", `application/json`);
      return headers;
    },
  }),

  endpoints: (builder) => ({
    getPhysicalInventoryApi: builder.query({
      query: (params) => ({ url: `inventory-sessions`, params }),
      providesTags: ["PhysicalInventory"],
    }),
    getScannedItemsByIdApi: builder.query({
      query: ({ id, ...params }) => ({ url: `inventory-sessions/${id}/scanned-items`, params }),
      providesTags: ["PhysicalInventory"],
    }),
    getReportsByIdPhysicalInventoryApi: builder.query({
      query: ({ id, ...params }) => ({ url: `inventory-sessions/${id}/report`, params }),
      providesTags: ["PhysicalInventory"],
    }),
    postStartSessionApi: builder.mutation({
      query: (body) => ({
        url: `inventory-sessions/start`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PhysicalInventory"],
    }),
    postScanAssetsPhysicalInventoryApi: builder.mutation({
      query: (body) => ({
        url: `inventory-sessions/scan-asset`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PhysicalInventory"],
    }),
    putEndSessionPhysicalInventoryApi: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `inventory-sessions/${id}/end`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PhysicalInventory"],
    }),
  }),
});

export const {
  useGetPhysicalInventoryApiQuery,
  useGetScannedItemsByIdApiQuery,
  useGetReportsByIdPhysicalInventoryApiQuery,
  usePostScanAssetsPhysicalInventoryApiMutation,
  usePostStartSessionApiMutation,
  usePutEndSessionPhysicalInventoryApiMutation,
} = physicalInventoryApi;
