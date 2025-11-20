import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const deliveryTypeApi = createApi({
  reducerPath: "deliveryTypeApi",
  tagTypes: ["DeliveryType"],

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
    getDeliveryTypeApi: builder.query({
      query: (params) => ({ url: `delivery-type`, params }),
      providesTags: ["DeliveryType"],
    }),

    postDeliveryTypeApi: builder.mutation({
      query: (body) => ({
        url: `/tagging-delivery-type`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DeliveryType"],
    }),
  }),
});

export const { useGetDeliveryTypeApiQuery, usePostDeliveryTypeApiMutation } = deliveryTypeApi;
