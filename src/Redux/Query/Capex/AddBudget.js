import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const addBudgetApi = createApi({
  reducerPath: "addBudgetApi",
  tagTypes: ["AddBudget"],

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
    getEnrolledBudgetApi: builder.query({
      query: (params) => ({ url: `enrolled-budget`, params }),
      providesTags: ["AddBudget"],
    }),

    patchEnrolledBudgetStatusApi: builder.mutation({
      query: ({ id, status }) => ({
        url: `/enrolled-budget/archived-enrolled-budget/${id}`,
        method: "PATCH",
        body: {
          status: status,
        },
      }),
      invalidatesTags: ["AddBudget"],
    }),

    postEnrolledBudgetApi: builder.mutation({
      query: (data) => ({
        url: `/enrolled-budget`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AddBudget"],
    }),
    postImportEnrolledBudgetApi: builder.mutation({
      query: (data) => ({
        url: `/import-enrolled-budget`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AddBudget"],
    }),
  }),
});

export const {
  useGetEnrolledBudgetApiQuery,
  useLazyGetEnrolledBudgetApiQuery,
  usePatchEnrolledBudgetStatusApiMutation,
  usePostEnrolledBudgetApiMutation,
  usePostImportEnrolledBudgetApiMutation,
} = addBudgetApi;
