import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const assetTransferPulloutApi = createApi({
  reducerPath: "assetTransferPulloutApi",
  tagTypes: ["AssetTransferPullout"],

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
    getAssetTransferPulloutApi: builder.query({
      query: (params) => ({ url: `/pullout-transfer-approver`, params }),
      providesTags: ["AssetTransferPullout"],
    }),

    postAssetTransferPulloutApi: builder.mutation({
      query: (data) => ({
        url: `/pullout-transfer-approver`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AssetTransferPullout"],
    }),

    arrangeAssetTransferPulloutApi: builder.mutation({
      query: ({ one_charging_id, ...data }) => ({
        url: `/update-pullout-transfer-approver/${one_charging_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AssetTransferPullout"],
    }),

    deleteAssetTransferPulloutApi: builder.mutation({
      query: ({ one_charging_id }) => ({
        url: `/pullout-transfer-approver/${one_charging_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AssetTransferPullout"],
    }),

    getApproversApi: builder.query({
      query: () => `/setup-approver`,
      // transformResponse: (response) => response.data,
      providesTags: ["AssetTransferPullout"],
    }),
  }),
});

export const {
  useGetAssetTransferPulloutApiQuery,
  usePostAssetTransferPulloutApiMutation,
  useArrangeAssetTransferPulloutApiMutation,
  useDeleteAssetTransferPulloutApiMutation,
  useGetApproversApiQuery,
} = assetTransferPulloutApi;
