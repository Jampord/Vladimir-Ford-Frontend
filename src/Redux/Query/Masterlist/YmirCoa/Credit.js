import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const creditApi = createApi({
  reducerPath: "creditApi",
  tagTypes: ["Credit"],

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
    getCreditAll: builder.query({
      query: () => `credit?pagination=none`,
      providesTags: ["Credit"],
    }),

    getCredit: builder.query({
      query: (params) => `credit?search=${params.search}&page=${params.page}&per_page=${params.per_page}`,
      providesTags: ["Credit"],
    }),

    postCreditApi: builder.mutation({
      query: (data) => ({
        url: `/credit`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Credit"],
    }),
  }),
});

export const { useGetCreditAllQuery, useLazyGetCreditAllQuery, useGetCreditQuery, usePostCreditApiMutation } =
  creditApi;
