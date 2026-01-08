import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const biddingApi = createApi({
  reducerPath: "biddingApi",
  tagTypes: ["Bidding"],

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
    getBiddingApi: builder.query({
      query: (params) => ({ url: `disposal-bidding`, params }),
      providesTags: ["Bidding"],
    }),
    postForBiddingApi: builder.mutation({
      query: (data) => ({
        url: `for-bidding`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Bidding"],
    }),
    postAddBookSlipApi: builder.mutation({
      query: (data) => ({
        url: `add-book-slip`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Bidding"],
    }),
    postMarkAsSoldApi: builder.mutation({
      query: (data) => ({
        url: `mark-as-sold`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Bidding"],
    }),
  }),
});

export const {
  useGetBiddingApiQuery,
  usePostForBiddingApiMutation,
  usePostAddBookSlipApiMutation,
  usePostMarkAsSoldApiMutation,
} = biddingApi;
