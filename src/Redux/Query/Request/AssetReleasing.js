import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const assetReleasingApi = createApi({
  reducerPath: "assetReleasing",
  tagTypes: ["AssetReleasing", "SmallToolsReleasing", "FixedAsset"],

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
    getAssetReleasing: builder.query({
      query: (params) =>
        `asset-release?isReleased=${params.released}&search=${params.search}&per_page=${params.per_page}&status=${params.status}&page=${params.page}`,
      providesTags: ["AssetReleasing"],
    }),

    getAssetReleasingAllApi: builder.query({
      query: () => `asset-release?pagination=none`,
      providesTags: ["AssetReleasing"],
    }),

    getByWarehouseNumberApi: builder.query({
      query: (data) => `asset-release/${data?.warehouse_number}`,
      providesTags: ["AssetReleasing"],
    }),

    putAssetReleasing: builder.mutation({
      query: (data) => ({
        url: `/release-asset`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AssetReleasing"],
    }),

    putSaveReleasing: builder.mutation({
      query: (data) => ({
        url: `/update-release-accountability`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AssetReleasing"],
    }),

    getSmallToolsReleasing: builder.query({
      query: (params) =>
        `small-tools-replacement-release?per_page=${params.per_page}&page=${params.page}&search=${params.search}&isReleased=${params.released}`,
      providesTags: ["SmallToolsReleasing"],
    }),

    putSmallToolsStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/update-small-tool-item/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SmallToolsReleasing", "FixedAsset"],
    }),

    putSmallToolsReleasing: builder.mutation({
      query: (data) => ({
        url: `/release-small-tool`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SmallToolsReleasing"],
    }),

    getExportAssetReleasing: builder.query({
      query: (params) => {
        const queryParams = [`isReleased=${params.isReleased}`];

        if (params.from) {
          queryParams.push(`from=${params.from}`);
        }

        if (params.to) {
          queryParams.push(`to=${params.to}`);
        }

        const queryString = queryParams.join("&");
        return `/asset-release?pagination=none&${queryString}`;
      },
    }),
  }),
});

export const {
  useGetAssetReleasingQuery,
  useGetAssetReleasingAllApiQuery,
  useLazyGetAssetReleasingAllApiQuery,
  useGetByWarehouseNumberApiQuery,
  useLazyGetAssetReleasingQuery,
  usePutAssetReleasingMutation,
  usePutSaveReleasingMutation,
  useGetSmallToolsReleasingQuery,
  usePutSmallToolsStatusMutation,
  usePutSmallToolsReleasingMutation,
  useLazyGetExportAssetReleasingQuery,
} = assetReleasingApi;
