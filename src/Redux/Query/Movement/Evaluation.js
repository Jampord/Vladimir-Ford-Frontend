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
      query: (params) => ({ url: `items-to-evaluate`, params }),
      providesTags: ["Evaluation"],
    }),

    getAssetsToPickupApi: builder.query({
      query: (params) => `item-to-pullout?per_page=${params.per_page}&page=${params.page}`,
      providesTags: ["Evaluation"],
    }),

    getAssetToPickupByIdApi: builder.query({
      query: (params) => `item-to-pullout-show/${params.id}`,
      providesTags: ["Evaluation"],
    }),

    patchPickupAssetApi: builder.mutation({
      query: (params) => ({
        url: `pick-up/${params.id}`,
        method: "PATCH",
      }),
      // invalidatesTags: ["Evaluation"],
    }),
  }),
});

export const {
  useGetAssetsToEvaluateApiQuery,
  useGetAssetsToPickupApiQuery,
  useGetAssetToPickupByIdApiQuery,
  usePatchPickupAssetApiMutation,
} = evaluationApi;
