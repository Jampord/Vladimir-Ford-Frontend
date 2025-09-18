import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const disposalApi = createApi({
  reducerPath: "disposalApi",
  tagTypes: ["Disposal"],

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
    getDisposalApi: builder.query({
      query: (params) => ({ url: `disposal`, params }),
      providesTags: ["Disposal"],
    }),

    getDisposalByIdApi: builder.query({
      query: ({ id }) => `/disposal/${id}`,
    }),
  }),
});

export const { useGetDisposalApiQuery, useGetDisposalByIdApiQuery } = disposalApi;
