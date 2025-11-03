import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const generalLedgerReportApi = createApi({
  reducerPath: "generalLedgerReportApi",
  tagTypes: ["GeneralLedgerReport"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.VLADIMIR_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      headers.set("x-api-key", `${process.env.GL_KEY}`);
      headers.set("Accept", `application/json`);
      return headers;
    },
  }),

  endpoints: (builder) => ({
    getGeneralLedgerReportApi: builder.query({
      query: (params) =>
        `report/gl-report?adjustment_month=${params.adjustment_date}&per_page=${params.per_page}&page=${params.page}&boa=${params.boa}`,
      providesTags: ["GeneralLedgerReport"],
    }),
    getExportGeneralLedgerReportApi: builder.query({
      query: (params) => `report/gl-report?adjustment_month=${params.adjustment_date}&pagination=none`,
      providesTags: ["GeneralLedgerReport"],
    }),
  }),
});

export const { useGetGeneralLedgerReportApiQuery, useLazyGetExportGeneralLedgerReportApiQuery } =
  generalLedgerReportApi;
