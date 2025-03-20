import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const approvalApi = createApi({
  reducerPath: "approvalApi",
  tagTypes: ["Approval"],

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
    getApprovalApi: builder.query({
      query: (params) =>
        `asset-approval?search=${params.search}&per_page=${params.per_page}&status=${params.status}&page=${params.page}`,
      providesTags: ["Approval"],
    }),
    getFinalApprovalApi: builder.query({
      query: (params) =>
        `asset-approval?search=${params.search}&per_page=${params.per_page}&status=${params.status}&page=${params.page}&final_approval=${params.final_approval}`,
      providesTags: ["Approval"],
    }),

    getApprovalAllApi: builder.query({
      query: () => `asset-approval?pagination=none`,
      transformResponse: (response) => response.data,
      providesTags: ["Approval"],
    }),

    getApprovalIdApi: builder.query({
      query: (params) => `asset-approval/${params.transaction_number}?page=${params.page}&per_page=${params.per_page}`,
      providesTags: ["Approval"],
    }),

    patchApprovalStatusApi: builder.mutation({
      query: (body) => ({
        url: `/handle-request`,
        method: "PATCH",
        body,
      }),
      // invalidatesTags: ["Approval"],
    }),

    putFinalApprovalEditApi: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/final-approval-update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Approval"],
    }),

    getNextRequest: builder.query({
      query: (params) => `/next-request?final_approval=${params.final_approval}`,
    }),

    dlAttachment: builder.query({
      query: (params) => ({
        url: `/dl?attachment=${params.attachment}&id=${params.id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetApprovalApiQuery,
  useGetFinalApprovalApiQuery,
  useGetApprovalAllApiQuery,
  useGetApprovalIdApiQuery,
  usePatchApprovalStatusApiMutation,
  usePutFinalApprovalEditApiMutation,
  useGetNextRequestQuery,
  useLazyGetNextRequestQuery,
  useLazyDlAttachmentQuery,
} = approvalApi;
