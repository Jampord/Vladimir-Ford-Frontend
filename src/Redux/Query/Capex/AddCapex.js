import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const addCapexApi = createApi({
  reducerPath: "addCapexApi",
  tagTypes: ["AddCapex"],

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
    getAddCapexApi: builder.query({
      query: (params) => ({ url: `capex-requisition`, params }),
      providesTags: ["AddCapex"],
    }),

    postAddCapexApi: builder.mutation({
      query: (data) => ({
        url: `/capex-requisition`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AddCapex"],
    }),
  }),
});

export const { useGetAddCapexApiQuery, useLazyGetAddCapexApiQuery, usePostAddCapexApiMutation } = addCapexApi;
