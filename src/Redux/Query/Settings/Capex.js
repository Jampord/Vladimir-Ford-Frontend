import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const capexApproversApi = createApi({
  reducerPath: "capexApproversApi",
  tagTypes: ["CapexApprovers"],

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
    getCapexApproversApi: builder.query({
      query: (params) => ({ url: `/capex-approver`, params }),
      providesTags: ["CapexApprovers"],
    }),

    postCapexApproversApi: builder.mutation({
      query: (data) => ({
        url: `/capex-approver`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CapexApprovers"],
    }),

    arrangeCapexApproversApi: builder.mutation({
      query: ({ subunit_id, ...data }) => ({
        url: `/capex-approver/${subunit_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CapexApprovers"],
    }),

    deleteCapexApproversApi: builder.mutation({
      query: ({ one_charging_id }) => ({
        url: `/capex-approver/${one_charging_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CapexApprovers"],
    }),

    getApproversApi: builder.query({
      query: () => `/setup-approver`,
      providesTags: ["CapexApprovers"],
    }),
  }),
});

export const {
  useGetCapexApproversApiQuery,
  usePostCapexApproversApiMutation,
  useArrangeCapexApproversApiMutation,
  useDeleteCapexApproversApiMutation,
  useGetApproversApiQuery,
} = capexApproversApi;
