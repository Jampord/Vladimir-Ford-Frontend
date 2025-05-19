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
      query: (params) => `transfer?per_page=${params.per_page}&page=${params.page}&search=${params.search}`,
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
      query: () => `fixed-asset?pagination=none&movement=transfer`,
      transformResponse: (response) => response.data,
      providesTags: ["Transfer"],
    }),

    getFixedAssetTransferCoordinatorApi: builder.query({
      query: (params) => `fixed-asset?pagination=none&movement=transfer&sub_unit_id=${params.subunit_id}`,
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
} = transferApi;
