import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const evaluationApi = createApi({
  reducerPath: "evaluationApi",
  tagTypes: ["Evaluation"],

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
    getAssetsToEvaluateApi: builder.query({
      query: (params) => `items-to-evaluate?per_page=${params.per_page}&page=${params.page}&search`,
      providesTags: ["Evaluation"],
    }),

    getAssetsToPickupApi: builder.query({
      query: (params) => `item-to-pullout?per_page=${params.per_page}&page=${params.page}`,
      providesTags: ["Evaluation"],
    }),
  }),
});

export const { useGetAssetsToEvaluateApiQuery, useGetAssetsToPickupApiQuery } = evaluationApi;
