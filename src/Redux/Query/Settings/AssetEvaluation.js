import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const assetEvaluationApi = createApi({
  reducerPath: "assetEvaluationApi",
  tagTypes: ["AssetEvaluation"],

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
    getAssetEvaluationApi: builder.query({
      query: (params) => `item-evaluation-approver?per_page=${params.per_page}&page=${params.page}`,
      providesTags: ["AssetEvaluation"],
    }),

    getAssetEvaluationAllApi: builder.query({
      query: () => `/asset-pullout-approver?pagination=none`,
      transformResponse: (response) => response.data,
      providesTags: ["AssetEvaluation"],
    }),

    postAssetEvaluationApi: builder.mutation({
      query: (data) => ({
        url: `/item-evaluation-approver`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AssetEvaluation"],
    }),

    arrangeAssetEvaluationApi: builder.mutation({
      query: ({ one_charging_id, ...data }) => ({
        url: `/update-evaluation-approver/${one_charging_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AssetEvaluation"],
    }),

    deleteAssetEvaluationApi: builder.mutation({
      query: ({ one_charging_id }) => ({
        url: `/item-evaluation-approver/${one_charging_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AssetEvaluation"],
    }),
  }),
});

export const {
  useGetAssetEvaluationApiQuery,
  useGetAssetEvaluationAllApiQuery,
  usePostAssetEvaluationApiMutation,
  useArrangeAssetEvaluationApiMutation,
  useDeleteAssetEvaluationApiMutation,
} = assetEvaluationApi;
