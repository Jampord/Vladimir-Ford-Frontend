import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const estimationApproversApi = createApi({
  reducerPath: "estimationApproversApi",
  tagTypes: ["EstimationApprovers"],

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
    getEstimationApproversApi: builder.query({
      query: (params) => ({ url: `/estimator-approver`, params }),
      providesTags: ["EstimationApprovers"],
    }),

    postEstimationApproversApi: builder.mutation({
      query: (data) => ({
        url: `/estimator-approver`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["EstimationApprovers"],
    }),

    arrangeEstimationApproversApi: builder.mutation({
      query: ({ subunit_id, ...data }) => ({
        url: `/update-estimator-approver/${subunit_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["EstimationApprovers"],
    }),

    deleteEstimationApproversApi: builder.mutation({
      query: ({ one_charging_id }) => ({
        url: `/estimator-approver/${one_charging_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EstimationApprovers"],
    }),

    getApproversApi: builder.query({
      query: () => `/setup-approver`,
      providesTags: ["EstimationApprovers"],
    }),
  }),
});

export const {
  useGetEstimationApproversApiQuery,
  usePostEstimationApproversApiMutation,
  useArrangeEstimationApproversApiMutation,
  useDeleteEstimationApproversApiMutation,
  useGetApproversApiQuery,
} = estimationApproversApi;
