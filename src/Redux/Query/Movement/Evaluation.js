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
      query: (params) => ({ url: `item-to-pullout`, params }),
      providesTags: ["Evaluation"],
    }),

    getAssetToPickupByIdApi: builder.query({
      query: (params) => `item-to-pullout-show/${params.id}`,
      providesTags: ["Evaluation"],
    }),

    patchPickupAssetApi: builder.mutation({
      query: (body) => ({
        url: `pick-up/${body.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Evaluation"],
    }),
    postEvaluateAssetApi: builder.mutation({
      query: (body) => ({
        url: `/evaluate-pullout`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Evaluation"],
    }),
    getEvaluatedPulloutAssetsApi: builder.query({
      query: (params) => ({ url: `evaluated-pullout`, params }),
      providesTags: ["Evaluation"],
    }),
    postEvaluateForReplacementAssetApi: builder.mutation({
      query: (body) => ({
        url: `/handle-for-replacement`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Evaluation"],
    }),
    patchChangeCareOfAssetApi: builder.mutation({
      query: (body) => ({
        url: `/change-care-of`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Evaluation"],
    }),
    getChangeCareOfPulloutAssetsApi: builder.query({
      query: (params) => ({ url: `change-care-of/viewing`, params }),
      providesTags: ["Evaluation"],
    }),
    patchChangeCareOfAssetConfirmationApi: builder.mutation({
      query: (body) => ({
        url: `/change-care-of/confirmation`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Evaluation"],
    }),
  }),
});

export const {
  useGetAssetsToEvaluateApiQuery,
  useGetAssetsToPickupApiQuery,
  useGetAssetToPickupByIdApiQuery,
  usePatchPickupAssetApiMutation,
  usePostEvaluateAssetApiMutation,
  useGetEvaluatedPulloutAssetsApiQuery,
  usePostEvaluateForReplacementAssetApiMutation,
  usePatchChangeCareOfAssetApiMutation,
  useGetChangeCareOfPulloutAssetsApiQuery,
  usePatchChangeCareOfAssetConfirmationApiMutation,
} = evaluationApi;
