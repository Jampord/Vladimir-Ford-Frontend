import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const receiverSettingsApi = createApi({
  reducerPath: "receiverSettingsApi",
  tagTypes: ["ReceiverSettings"],

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
    getReceiverSettingsApi: builder.query({
      query: (params) =>
        `authorized-transfer-receiver?status=${params.status}&per_page=${params.per_page}&page=${params.page}&search=${params.search}`,
      providesTags: ["ReceiverSettings"],
    }),

    getReceiverSettingsAllApi: builder.query({
      query: (params) => `/authorized-transfer-receiver?status=active&pagination=none&department=${params.department}`,
      providesTags: ["ReceiverSettings"],
    }),

    postReceiverSettingsApi: builder.mutation({
      query: (data) => ({
        url: `/authorized-transfer-receiver`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ReceiverSettings"],
    }),

    updateReceiverSettingsApi: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/authorized-transfer-receiver/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ReceiverSettings"],
    }),

    archiveReceiverSettingsApi: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/archived-authorized-transfer-receiver/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["ReceiverSettings"],
    }),
  }),
});

export const {
  useGetReceiverSettingsApiQuery,
  useGetReceiverSettingsAllApiQuery,
  useLazyGetReceiverSettingsAllApiQuery,
  usePostReceiverSettingsApiMutation,
  useUpdateReceiverSettingsApiMutation,
  useArchiveReceiverSettingsApiMutation,
} = receiverSettingsApi;
