import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const fixedAssetApi = createApi({
  reducerPath: "fixedAssetApi",
  tagTypes: ["FixedAsset"],

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
    getFixedAssetApi: builder.query({
      query: (params) =>
        `fixed-asset-search?search=${params.search}&page=${params.page}&per_page=${params.per_page}&status=${params.status}&filter=${params.filter}`,
      providesTags: ["FixedAsset"],
    }),

    getFixedAssetAllApi: builder.query({
      query: () => `fixed-asset?pagination=none`,
      transformResponse: (response) => response.data,
      providesTags: ["FixedAsset"],
    }),

    getFixedAssetAddCostAllApi: builder.query({
      query: () => `fixed-asset?pagination=none&add_cost=1`,
      transformResponse: (response) => response.data,
      providesTags: ["FixedAsset"],
    }),

    getFixedAssetSmallToolsAllApi: builder.query({
      query: (params) =>
        `/fixed-asset?pagination=none&small_tools=1&replacement=${params.replacement}&sub_unit_id=${params.sub_unit_id}`,
      transformResponse: (response) => response.data,
      providesTags: ["FixedAsset"],
    }),

    getFixedAssetIdApi: builder.query({
      query: ({ vladimir_tag_number: tagNumber, is_additional_cost, id: additionalCostID }) => {
        if (is_additional_cost) {
          return `additional-cost/${additionalCostID}`;
        }
        return `show-fixed-asset/${tagNumber}`;
      },
      providesTags: ["FixedAsset"],
    }),

    getVoucherFaApi: builder.query({
      query: (params) => `fisto-voucher?po_no=${params.po_no}&rr_no=${params.rr_no}`,
      providesTags: ["FixedAsset"],
    }),

    getReprintMemoApi: builder.query({
      query: (params) => `reprint-memo?per_page=${params.per_page}&page=${params.page}&search=${params.search}`,
      // transformResponse: (response) => response.data,
      providesTags: ["FixedAsset"],
    }),

    getDepreciationHistoryApi: builder.query({
      query: (params) => `depreciation_history/${params.vladimir_tag_number}`,
      // transformResponse: (response) => response.data,
      providesTags: ["FixedAsset"],
    }),

    getPrintViewingApi: builder.query({
      query: (params) => {
        const queryParams = [
          `search=${params.search}`,
          `per_page=${params.per_page}`,
          `page=${params.page}`,
          `isRequest=${params.isRequest}`,
          `printMemo=${params.printMemo}`,
          `smallTool=${params.smallTool}`,
        ];

        if (params.startDate) {
          queryParams.push(`startDate=${params.startDate}`);
        }

        if (params.endDate) {
          queryParams.push(`endDate=${params.endDate}`);
        }

        const queryString = queryParams.join("&");
        return `/print-barcode-show?${queryString}`;
      },
      providesTags: ["FixedAsset"],
    }),

    archiveFixedAssetStatusApi: builder.mutation({
      query: ({ id, status, remarks }) => ({
        url: `/fixed-asset/archived-fixed-asset/${id}`,
        method: "PATCH",
        body: {
          status: status,
          remarks: remarks,
        },
      }),
      invalidatesTags: ["FixedAsset"],
    }),

    postFixedAssetApi: builder.mutation({
      query: (data) => ({
        url: `/fixed-asset`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FixedAsset"],
    }),

    updateFixedAssetApi: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/fixed-asset/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FixedAsset"],
    }),

    postImportApi: builder.mutation({
      query: (data) => ({
        url: `/import-masterlist`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FixedAsset"],
    }),

    getExportApi: builder.query({
      query: (params) => ({
        url: `/export-masterlist?search=${params.search}&startDate=${params.startDate}&endDate=${params.endDate}`,
        // providesTags: ["FixedAsset"]
      }),
    }),

    getCalcDepreApi: builder.query({
      query: (params) => ({
        url: `/asset-depreciation/${params.id}?date=${params.date}`,
      }),
      providesTags: ["FixedAsset"],
    }),

    // * -------------- Stalwart / PRODUCTION Printing --------------------
    // postPrintApi: builder.mutation({
    //   query: ({ ip, ...params }) => {
    //     if (ip === `210.5.110.212`) {
    //       return {
    //         url: `http://stalwart:8069/VladimirPrinting/public/index.php/api/fixed-asset/barcode`,
    //         method: "POST",
    //         body: params,
    //       };
    //     } else {
    //       return {
    //         url: `http://127.0.0.1:80/VladimirPrinting/public/index.php/api/fixed-asset/barcode`,
    //         method: "POST",
    //         body: params,
    //       };
    //     }
    //   },
    //   invalidatesTags: ["FixedAsset"],
    // }),

    // * -------------- Local Printing --------------------
    postPrintApi: builder.mutation({
      query: (params) => {
        return {
          url: `/fixed-asset/barcode`,
          // url: `https://pretestalpha.rdfmis.ph/server/api/fixed-asset/barcode`,
          method: "POST",
          body: params,
        };
      },
      invalidatesTags: ["FixedAsset"],
    }),

    putMemoPrintApi: builder.mutation({
      query: (params) => {
        return {
          url: `/memo-print`,
          method: "PUT",
          body: params,
        };
      },
      invalidatesTags: ["FixedAsset"],
    }),

    putSmallToolsPrintableApi: builder.mutation({
      query: (params) => {
        return {
          url: `/small-tools-main-asset/not-printable`,
          method: "PUT",
          body: params,
        };
      },
      invalidatesTags: ["FixedAsset"],
    }),

    postLocalPrintApi: builder.mutation({
      query: (params) => ({
        url: `/fixed-asset/barcode`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["FixedAsset"],
    }),

    postDepreciateApi: builder.mutation({
      query: (params) => ({
        url: `/depreciate/${params.vladimir_tag_number}`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["FixedAsset"],
    }),
  }),
});

export const {
  useGetFixedAssetApiQuery,
  useLazyGetFixedAssetAllApiQuery,
  useLazyGetFixedAssetAddCostAllApiQuery,
  useGetFixedAssetAddCostAllApiQuery,
  useGetFixedAssetSmallToolsAllApiQuery,
  useLazyGetFixedAssetSmallToolsAllApiQuery,
  useGetFixedAssetAllApiQuery,
  useGetFixedAssetIdApiQuery,
  useLazyGetVoucherFaApiQuery,
  useGetReprintMemoApiQuery,
  useGetDepreciationHistoryApiQuery,
  useGetPrintViewingApiQuery,
  useLazyGetDepreciationHistoryApiQuery,
  useLazyGetCalcDepreApiQuery,
  useArchiveFixedAssetStatusApiMutation,
  usePostFixedAssetApiMutation,
  useUpdateFixedAssetApiMutation,
  usePostImportApiMutation,
  useLazyGetExportApiQuery,
  usePostPrintApiMutation,
  usePutMemoPrintApiMutation,
  usePutSmallToolsPrintableApiMutation,
  usePostLocalPrintApiMutation,

  usePostDepreciateApiMutation,
} = fixedAssetApi;
