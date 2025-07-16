import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const evaluationApprovalApi = createApi({
  reducerPath: "evaluationApprovalApi",
  tagTypes: ["EvaluationApproval"],

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
    getEvaluationApprovalApi: builder.query({
      query: (params) => ({
        url: `evaluation-approval`,
        params,
      }),
      providesTags: ["EvaluationApproval"],
    }),
    postEvaluateApprovalApi: builder.mutation({
      query: (body) => ({
        url: `/handle-evaluation-approval`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["EvaluationApproval"],
    }),
  }),
});

export const { useGetEvaluationApprovalApiQuery, usePostEvaluateApprovalApiMutation } = evaluationApprovalApi;
