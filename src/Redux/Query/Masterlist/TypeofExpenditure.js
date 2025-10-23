import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const typeOfExpenditureApi = createApi({
  reducerPath: "typeOfExpenditureApi",
  tagTypes: ["TypeofExpenditure"],

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
    getTypeOfExpenditureApi: builder.query({
      query: (params) => ({ url: `type-of-expenditure`, params }),
      providesTags: ["TypeofExpenditure"],
    }),

    patchTypeOfExpenditureStatusApi: builder.mutation({
      query: ({ id, status }) => ({
        url: `/type-of-expenditure/archived-type-of-expenditure/${id}`,
        method: "PATCH",
        body: {
          status: status,
        },
      }),
      invalidatesTags: ["TypeofExpenditure"],
    }),

    postTypeOfExpenditureApi: builder.mutation({
      query: (data) => ({
        url: `/type-of-expenditure`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TypeofExpenditure"],
    }),

    putTypeOfExpenditureUpdateApi: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/type-of-expenditure/${id}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["TypeofExpenditure"],
    }),
  }),
});

export const {
  useGetTypeOfExpenditureApiQuery,
  useLazyGetTypeOfExpenditureApiQuery,
  usePostTypeOfExpenditureApiMutation,
  usePatchTypeOfExpenditureStatusApiMutation,
  usePutTypeOfExpenditureUpdateApiMutation,
} = typeOfExpenditureApi;
