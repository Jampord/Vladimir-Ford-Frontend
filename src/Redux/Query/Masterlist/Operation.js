import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const operationApi = createApi({
  reducerPath: "operationApi",
  tagTypes: ["Operation"],

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
    getOperationApi: builder.query({
      query: (params) => ({ url: `operation`, params }),
      providesTags: ["Operation"],
    }),

    patchOperationStatusApi: builder.mutation({
      query: ({ id, status }) => ({
        url: `/operation/archived-operation/${id}`,
        method: "PATCH",
        body: {
          status: status,
        },
      }),
      invalidatesTags: ["Operation"],
    }),

    postOperationApi: builder.mutation({
      query: (data) => ({
        url: `/operation`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Operation"],
    }),

    putOperationUpdateApi: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/operation/${id}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Operation"],
    }),
  }),
});

export const {
  useGetOperationApiQuery,
  useLazyGetOperationApiQuery,
  usePostOperationApiMutation,
  usePatchOperationStatusApiMutation,
  usePutOperationUpdateApiMutation,
} = operationApi;
