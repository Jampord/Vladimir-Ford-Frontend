import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const assetMovementReportApi = createApi({
  reducerPath: "assetMovementReportApi",
  tagTypes: ["AssetMovementReport", "TransferHistoryReport"],
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
    getTransferHistoryReportApi: builder.query({
      query: (params) => {
        const queryParams = [
          `movement_type=transfer`,
          `per_page=${params.per_page}`,
          `page=${params.page}`,
          `search=${params.search}`,
        ];

        if (params.from) {
          queryParams.push(`from=${params.from}`);
        }

        if (params.to) {
          queryParams.push(`to=${params.to}`);
        }

        const queryString = queryParams.join("&");
        return `/movement-history?${queryString}`;
      },
      providesTags: ["TransferHistoryReport"],
    }),

    getTransferHistoryReportExportApi: builder.query({
      query: (params) => {
        const queryParams = [`movement_type=transfer`, `pagination=none`, `search=${params.search}`];

        if (params.from) {
          queryParams.push(`from=${params.from}`);
        }

        if (params.to) {
          queryParams.push(`to=${params.to}`);
        }

        const queryString = queryParams.join("&");
        return `/movement-history?${queryString}`;
      },
      providesTags: ["TransferHistoryReport"],
    }),
  }),
});

export const { useGetTransferHistoryReportApiQuery, useLazyGetTransferHistoryReportExportApiQuery } =
  assetMovementReportApi;
