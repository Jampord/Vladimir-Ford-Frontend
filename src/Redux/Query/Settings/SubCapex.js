import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const subCapexApproversApi = createApi({
  reducerPath: "subCapexApproversApi",
  tagTypes: ["SubCapexApprovers"],

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
    getSubCapexApproversApi: builder.query({
      query: (params) => ({ url: `/sub-capex-approver`, params }),
      providesTags: ["SubCapexApprovers"],
    }),

    postSubCapexApproversApi: builder.mutation({
      query: (data) => ({
        url: `/sub-capex-approver`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SubCapexApprovers"],
    }),

    arrangeSubCapexApproversApi: builder.mutation({
      query: ({ subunit_id, ...data }) => ({
        url: `/update-sub-capex-approver/${subunit_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SubCapexApprovers"],
    }),

    deleteSubCapexApproversApi: builder.mutation({
      query: ({ one_charging_id }) => ({
        url: `/sub-capex-approver/${one_charging_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubCapexApprovers"],
    }),

    getApproversApi: builder.query({
      query: () => `/setup-approver`,
      providesTags: ["SubCapexApprovers"],
    }),
  }),
});

export const {
  useGetSubCapexApproversApiQuery,
  usePostSubCapexApproversApiMutation,
  useArrangeSubCapexApproversApiMutation,
  useDeleteSubCapexApproversApiMutation,
  useGetApproversApiQuery,
} = subCapexApproversApi;
