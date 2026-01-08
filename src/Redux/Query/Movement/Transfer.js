import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const transferApi = createApi({
  reducerPath: "transferApi",
  tagTypes: ["Transfer"],

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
    getTransferApi: builder.query({
      query: (params) =>
        `transfer?per_page=${params.per_page}&page=${params.page}&search=${params.search}&status=${params.status}`,
      providesTags: ["Transfer"],
    }),

    getTransferReceiverApi: builder.query({
      query: (params) => `transfer-receiver?per_page=${params.per_page}&page=${params.page}&status=${params.status}`,
      providesTags: ["Transfer"],
    }),

    getSingleTransferReceiverApi: builder.query({
      query: (params) => `/show-receiving/${params.movement_id}`,
      providesTags: ["Transfer"],
    }),

    getTransferAllApi: builder.query({
      query: () => `asset-transfer?pagination=none`,
      providesTags: ["Transfer"],
    }),

    getTransferNumberApi: builder.query({
      query: (params) => `transfer/${params.transfer_number}`,
      providesTags: ["Transfer"],
    }),

    getTransferNumberReceiverApi: builder.query({
      query: (params) => `transfer/${params.transfer_number}?is_receiver=1`,
      providesTags: ["Transfer"],
    }),

    getFixedAssetTransferAllApi: builder.query({
      query: (params) =>
        `fixed-asset?pagination=none&movement=transfer&is_spare=${params.is_spare}&for_safe_keeping=${params.for_safe_keeping}`,
      transformResponse: (response) => response.data,
      providesTags: ["Transfer"],
    }),

    getFixedAssetTransferCoordinatorApi: builder.query({
      query: (params) =>
        `fixed-asset?pagination=none&movement=transfer&one_charging_id=${params.one_charging_id}&is_spare=${params.is_spare}&for_safe_keeping=${params.for_safe_keeping}`,
      transformResponse: (response) => response.data,
      providesTags: ["Transfer"],
    }),

    getTransferApprovalApi: builder.query({
      query: (params) =>
        `transfer-approver?page=${params.page}&per_page=${params.per_page}&search=${params.search}&status=${params.status}`,
      providesTags: ["Transfer"],
    }),

    getTransferFinalApprovalApi: builder.query({
      query: (params) =>
        `transfer-approver?page=${params.page}&per_page=${params.per_page}&search=${params.search}&status=${params.status}&final_approval=${params.final_approval}`,
      providesTags: ["Transfer"],
    }),

    postTransferApi: builder.mutation({
      query: (data) => ({
        url: `asset-transfer`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transfer"],
    }),

    archiveTransferApi: builder.mutation({
      query: (transfer_number) => ({
        url: `remove-transfer-item/${transfer_number}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transfer"],
    }),

    getNextTransfer: builder.query({
      query: (params) => `/get-next-transfer?final_approval=${params.final_approval}`,
      providesTags: ["Transfer"],
    }),

    downloadAttachmentApi: builder.mutation({
      query: (transfer_number) => ({
        url: `transfer-attachment/${transfer_number}`,
      }),
      invalidatesTags: ["Transfer"],
    }),

    patchTransferReceivingApi: builder.mutation({
      query: (body) => ({
        url: `/received-confirmation`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Transfer"],
    }),

    patchVoidTransferApi: builder.mutation({
      query: (body) => ({
        url: `/void-transfer`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Transfer"],
    }),

    patchRejectReceivingTransferApi: builder.mutation({
      query: (body) => ({
        url: `/reject-transfer`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Transfer"],
    }),

    getTransferReceivingMonitoringApi: builder.query({
      query: (params) => ({
        url: `transfer-receiver`,
        params,
      }),
      providesTags: ["Transfer"],
    }),
  }),
});

export const {
  useGetTransferApiQuery,
  useGetTransferReceiverApiQuery,
  useGetSingleTransferReceiverApiQuery,
  useLazyGetTransferAllApiQuery,
  useGetTransferNumberApiQuery,
  useLazyGetTransferNumberApiQuery,
  useGetTransferNumberReceiverApiQuery,
  useLazyGetFixedAssetTransferAllApiQuery,
  useLazyGetFixedAssetTransferCoordinatorApiQuery,
  useGetTransferAllApiQuery,
  useGetTransferApprovalApiQuery,
  useGetTransferFinalApprovalApiQuery,
  usePostTransferApiMutation,
  useArchiveTransferApiMutation,
  useLazyGetNextTransferQuery,
  useDownloadAttachmentApiMutation,
  usePatchTransferReceivingApiMutation,
  usePatchVoidTransferApiMutation,
  usePatchRejectReceivingTransferApiMutation,
  useGetTransferReceivingMonitoringApiQuery,
} = transferApi;
