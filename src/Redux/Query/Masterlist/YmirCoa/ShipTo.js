import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const shipToApi = createApi({
  reducerPath: "shipToApi",
  tagTypes: ["ShipTo"],

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
    getShipToApi: builder.query({
      query: (params) =>
        `ship-to?search=${params.search}&page=${params.page}&per_page=${params.per_page}&status=${params.status}`,
      providesTags: ["ShipTo"],
    }),

    getShipToAllApi: builder.query({
      query: () => `ship-to?pagination=none`,
      providesTags: ["ShipTo"],
    }),

    postShipToApi: builder.mutation({
      query: (data) => ({
        url: `/ship-to`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ShipTo"],
    }),
  }),
});

export const { useGetShipToApiQuery, useGetShipToAllApiQuery, useLazyGetShipToAllApiQuery, usePostShipToApiMutation } =
  shipToApi;
