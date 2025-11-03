import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const additionalCostApproversApi = createApi({
  reducerPath: "additionalCostApproversApi",
  tagTypes: ["AdditionalCostApprovers"],

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
    getAdditionalCostApproversApi: builder.query({
      query: (params) => ({ url: `/additional-cost-approver`, params }),
      providesTags: ["AdditionalCostApprovers"],
    }),

    postAdditionalCostApproversApi: builder.mutation({
      query: (data) => ({
        url: `/additional-cost-approver`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AdditionalCostApprovers"],
    }),

    arrangeAdditionalCostApproversApi: builder.mutation({
      query: ({ subunit_id, ...data }) => ({
        url: `/update-additional-cost-approver/${subunit_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AdditionalCostApprovers"],
    }),

    deleteAdditionalCostApproversApi: builder.mutation({
      query: ({ one_charging_id }) => ({
        url: `/additional-cost-approver/${one_charging_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdditionalCostApprovers"],
    }),

    getApproversApi: builder.query({
      query: () => `/setup-approver`,
      providesTags: ["AdditionalCostApprovers"],
    }),
  }),
});

export const {
  useGetAdditionalCostApproversApiQuery,
  usePostAdditionalCostApproversApiMutation,
  useArrangeAdditionalCostApproversApiMutation,
  useDeleteAdditionalCostApproversApiMutation,
  useGetApproversApiQuery,
} = additionalCostApproversApi;
