import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pulloutApi = createApi({
  reducerPath: "pulloutApi",
  tagTypes: ["Pullout"],

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
    getPulloutApi: builder.query({
      query: (params) => `pullout?per_page=${params.per_page}&page=${params.page}`,
      providesTags: ["Pullout"],
    }),

    getPulloutAllApi: builder.query({
      query: () => `pullout?pagination=none`,
      providesTags: ["Pullout"],
    }),

    getPulloutNumberApi: builder.query({
      query: (params) => `pullout/${params.pullout_number}`,
      providesTags: ["Pullout"],
    }),

    getFixedAssetPulloutAllApi: builder.query({
      query: () => `fixed-asset?pagination=none&movement=pullout`,
      transformResponse: (response) => response.data,
      providesTags: ["Pullout"],
    }),

    getPulloutApprovalApi: builder.query({
      query: (params) =>
        `pullout-approver?page=${params.page}&per_page=${params.per_page}&search=${params.search}&status=${params.status}`,
      providesTags: ["Pullout"],
    }),

    postPulloutApi: builder.mutation({
      query: (data) => ({
        url: `pullout`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Pullout"],
    }),

    archivePulloutApi: builder.mutation({
      query: (pullout_number) => ({
        url: `remove-pullout-item/${pullout_number}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pullout"],
    }),

    getNextPullout: builder.query({
      query: () => `/next-pullout`,
      providesTags: ["Pullout"],
    }),

    downloadAttachmentApi: builder.mutation({
      query: (pullout_number) => ({
        url: `pullout-attachment/${pullout_number}`,
      }),
      invalidatesTags: ["Pullout"],
    }),

    patchVoidPulloutApi: builder.mutation({
      query: (body) => ({
        url: `/void-pullout`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Pullout"],
    }),
  }),
});

export const {
  useGetPulloutApiQuery,
  useLazyGetPulloutAllApiQuery,
  useGetPulloutNumberApiQuery,
  useLazyGetFixedAssetPulloutAllApiQuery,
  useGetPulloutAllApiQuery,
  useGetPulloutApprovalApiQuery,
  usePostPulloutApiMutation,
  useArchivePulloutApiMutation,
  useLazyGetNextPulloutQuery,
  useDownloadAttachmentApiMutation,
  usePatchVoidPulloutApiMutation,
} = pulloutApi;
