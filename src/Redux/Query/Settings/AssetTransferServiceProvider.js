import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const assetTransferServiceProviderApi = createApi({
  reducerPath: "assetTransferServiceProviderApi",
  tagTypes: ["AssetTransferServiceProvider"],

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
    getAssetTransferServiceProviderApi: builder.query({
      query: (params) => ({ url: `/movement-warehouse-approver`, params }),
      providesTags: ["AssetTransferServiceProvider"],
    }),

    postAssetTransferServiceProviderApi: builder.mutation({
      query: (data) => ({
        url: `/movement-warehouse-approver`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AssetTransferServiceProvider"],
    }),

    arrangeAssetTransferServiceProviderApi: builder.mutation({
      query: ({ movement_warehouse_id, ...data }) => ({
        url: `/update-movement-warehouse-approver/${movement_warehouse_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AssetTransferServiceProvider"],
    }),

    deleteAssetTransferServiceProviderApi: builder.mutation({
      query: ({ movement_warehouse_id }) => ({
        url: `/movement-warehouse-approver/${movement_warehouse_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AssetTransferServiceProvider"],
    }),

    getApproversApi: builder.query({
      query: () => `/setup-approver`,
      // transformResponse: (response) => response.data,
      providesTags: ["AssetTransferServiceProvider"],
    }),
  }),
});

export const {
  useGetAssetTransferServiceProviderApiQuery,
  usePostAssetTransferServiceProviderApiMutation,
  useArrangeAssetTransferServiceProviderApiMutation,
  useDeleteAssetTransferServiceProviderApiMutation,
  useGetApproversApiQuery,
} = assetTransferServiceProviderApi;
