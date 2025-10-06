import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const enrolledBudgetApi = createApi({
  reducerPath: "enrolledBudgetApi",
  tagTypes: ["EnrolledBudget"],

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
      providesTags: ["EnrolledBudget"],
    }),

    patchEnrolledBudgetStatusApi: builder.mutation({
      query: ({ id, status }) => ({
        url: `/enrolled-budget/archived-enrolled-budget/${id}`,
        method: "PATCH",
        body: {
          status: status,
        },
      }),
      invalidatesTags: ["EnrolledBudget"],
    }),

    postEnrolledBudgetApi: builder.mutation({
      query: (data) => ({
        url: `/enrolled-budget`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["EnrolledBudget"],
    }),
  }),
});

export const {
  useGetEnrolledBudgetApiQuery,
  useLazyGetEnrolledBudgetApiQuery,
  usePostEnrolledBudgetApiMutation,
  usePatchEnrolledBudgetStatusApiMutation,
} = enrolledBudgetApi;
