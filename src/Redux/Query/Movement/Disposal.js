import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const disposalApi = createApi({
  reducerPath: "disposalApi",
  tagTypes: ["Disposal"],

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
    getDisposalApi: builder.query({
      query: (params) => ({ url: `disposal`, params }),
      providesTags: ["Disposal"],
    }),

    getDisposalByIdApi: builder.query({
      query: ({ id }) => `/disposal/${id}`,
      providesTags: ["Disposal"],
    }),

    getDisposalApprovalApi: builder.query({
      query: (params) => ({ url: `disposal-approver`, params }),
      providesTags: ["Disposal"],
    }),

    patchDisposalApprovalStatusApi: builder.mutation({
      query: (body) => ({
        url: `/handle-disposal-movement`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Disposal"],
    }),

    getNextDisposal: builder.query({
      query: () => `/get-next-disposal`,
      providesTags: ["Disposal"],
    }),

    getDisposalReceivingApi: builder.query({
      query: (params) => ({ url: `disposal-receiver`, params }),
      providesTags: ["Disposal"],
    }),

    patchDisposalReceivingApi: builder.mutation({
      query: (body) => ({
        url: `/disposal-receiving`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Disposal"],
    }),

    deleteDisposalApi: builder.mutation({
      query: ({ id }) => ({
        url: `remove-disposal/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Disposal"],
    }),

    deleteDisposalItemApi: builder.mutation({
      query: ({ movement_id, disposal_id }) => ({
        url: `remove-disposal/${movement_id}/${disposal_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Disposal"],
    }),
  }),
});

export const {
  useGetDisposalApiQuery,
  useGetDisposalByIdApiQuery,
  useGetDisposalApprovalApiQuery,
  usePatchDisposalApprovalStatusApiMutation,
  useLazyGetNextDisposalQuery,
  useGetDisposalReceivingApiQuery,
  usePatchDisposalReceivingApiMutation,
  useDeleteDisposalApiMutation,
  useDeleteDisposalItemApiMutation,
} = disposalApi;
