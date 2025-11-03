import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// State Management
import sidebarReducer from "../StateManagement/sidebar";
import toastReducer from "./toastSlice";
import confirmReducer from "./confirmSlice";
import changePasswordReducer from "../StateManagement/changePasswordSlice";
import ipSetupReducer from "../StateManagement/ipSetupSlice";
import userLoginReducer from "../StateManagement/userLogin";
import collapseCapexReducer from "./collapseCapexSlice";
import booleanStateReducer from "./booleanStateSlice";
import actionMenuReducer from "../StateManagement/actionMenuSlice";
import tabReducer from "./tabSlice";

// import drawerReducer from './drawerSlice'
// import dialogReducer from './dialogSlice'
// import tableDialogReducer from './tableDialogSlice'
// import datePickerReducer from './datePickerSlice'
// import importFileReducer from './importFileSlice'
// import exportFileReducer from './exportFileSlice'
// import scanFileReducer from './scanFileSlice'

// Query
import { changePasswordApi } from "../Query/ChangePasswordApi";
import { notificationApi } from "../Query/Notification";
// import { modulesApi } from '../Query/ModulesApi'

// Masterlist
import { sedarUsersApi } from "../Query/SedarUserApi";
import { typeOfRequestApi } from "../Query/Masterlist/TypeOfRequest";
import { capexApi } from "../Query/Masterlist/Capex";
import { subCapexApi } from "../Query/Masterlist/SubCapex";
import { warehouseApi } from "../Query/Masterlist/Warehouse";
// import { majorCategoryApi } from "../Query/Masterlist/Category/MajorCategory";
import { minorCategoryApi } from "../Query/Masterlist/Category/MinorCategory";
// import { categoryListApi } from '../Query/Masterlist/Category/CategoryList'
// import { serviceProviderApi } from '../Query/Masterlist/ServiceProviderApi'

import { fistoCompanyApi } from "../Query/Masterlist/FistoCoa/FistoCompany";
import { fistoDepartmentApi } from "../Query/Masterlist/FistoCoa/FistoDepartment";
import { fistoLocationApi } from "../Query/Masterlist/FistoCoa/FistoLocation";
import { fistoAccountTitleApi } from "../Query/Masterlist/FistoCoa/FistoAccountTitle";
import { fistoSupplierApi } from "../Query/Masterlist/FistoCoa/FistoSupplier";

import { elixirApi } from "../Query/Systems/Elixir";

import { companyApi } from "../Query/Masterlist/YmirCoa/Company";
import { businessUnitApi } from "../Query/Masterlist/YmirCoa/BusinessUnit";
import { departmentApi } from "../Query/Masterlist/YmirCoa/Department";
import { unitApi } from "../Query/Masterlist/YmirCoa/Unit";
import { subUnitApi } from "../Query/Masterlist/YmirCoa/SubUnit";
import { locationApi } from "../Query/Masterlist/YmirCoa/Location";
import { accountTitleApi } from "../Query/Masterlist/YmirCoa/AccountTitle";
import { supplierApi } from "../Query/Masterlist/YmirCoa/Supplier";
import { divisionApi } from "../Query/Masterlist/Division";
import { unitOfMeasurementApi } from "../Query/Masterlist/YmirCoa/UnitOfMeasurement";
import { smallToolsApi } from "../Query/Masterlist/YmirCoa/SmallTools";

import { ymirApi } from "../Query/Masterlist/YmirCoa/YmirApi";
import { ymirPrApi } from "../Query/Masterlist/YmirCoa/YmirPr";

// User Management
import { userAccountsApi } from "../Query/UserManagement/UserAccountsApi";
import { roleManagementApi } from "../Query/UserManagement/RoleManagementApi";

// Fixed Asset
import { fixedAssetApi } from "../Query/FixedAsset/FixedAssets";
import { additionalCostApi } from "../Query/FixedAsset/AdditionalCost";
import { printOfflineFaApi } from "../Query/FixedAsset/OfflinePrintingFA";

import { ipAddressSetupApi } from "../Query/IpAddressSetup";
import { tokenSetupApi } from "../Query/tokenSetup";
import { ipAddressPretestSetupApi } from "../Query/IpAddressSetup";

import { assetStatusApi } from "../Query/Masterlist/Status/AssetStatus";
import { cycleCountStatusApi } from "../Query/Masterlist/Status/CycleCountStatus";
import { assetMovementStatusApi } from "../Query/Masterlist/Status/AssetMovementStatus";
import { depreciationStatusApi } from "../Query/Masterlist/Status/DepreciationStatus";

import { approverSettingsApi } from "../Query/Settings/ApproverSettings";
import { unitApproversApi } from "../Query/Settings/UnitApprovers";
import { assetTransferApi } from "../Query/Settings/AssetTransfer";
import { assetPulloutApi } from "../Query/Settings/AssetPullout";
import { assetDisposalApi } from "../Query/Settings/AssetDisposal";

import { requisitionApi } from "../Query/Request/Requisition";
import { requestContainerApi } from "../Query/Request/RequestContainer";
import { purchaseRequestApi } from "../Query/Request/PurchaseRequest";

import { approvalApi } from "../Query/Approving/Approval";
import { transferApi } from "../Query/Movement/Transfer";
import { transferApprovalApi } from "../Query/Approving/TransferApproval";
import { pulloutApi } from "../Query/Movement/Pullout";
import { pulloutApprovalApi } from "../Query/Approving/PulloutApproval";
import { evaluationApi } from "../Query/Movement/Evaluation";
import { evaluationApprovalApi } from "../Query/Approving/EvaluationApproval";

import { requisitionSmsApi } from "../Query/Request/RequisitionSms";

import { assetReceivingApi } from "../Query/Request/AssetReceiving";
import { receivedReceiptApi } from "../Query/Request/ReceivedReceipt";
import { assetReleasingApi } from "../Query/Request/AssetReleasing";
import { masterlistApi } from "../Query/Masterlist/Masterlist";
import { assetMovementReportApi } from "../Query/Movement/AssetMovementReports";
import { coordinatorSettingsApi } from "../Query/Settings/CoordinatorSettings";
import { actionMenuSlice } from "./actionMenuSlice";
import { receiverSettingsApi } from "../Query/Settings/ReceiverSettings";
import { creditApi } from "../Query/Masterlist/YmirCoa/Credit";
import { generalLedgerReportApi } from "../Query/Reports/GeneralLedgerReport";
import { purchaseRequestReconApi } from "../Query/Reports/PurchaseRequestRecon";
import { oneRDFApi } from "../Query/Masterlist/OneRDF/OneRDFCharging";
import { oneRDFCoaApi } from "../Query/Masterlist/OneRDF/OneRDFCoa";
import { assetEvaluationApi } from "../Query/Settings/AssetEvaluation";
import { shipToApi } from "../Query/Masterlist/YmirCoa/ShipTo";
import { assetTransferPulloutApi } from "../Query/Settings/AssetTransferPullout";
import { disposalApi } from "../Query/Movement/Disposal";
import { typeOfExpenditureApi } from "../Query/Masterlist/TypeofExpenditure";
import { enrolledBudgetApi } from "../Query/Masterlist/EnrolledBudget";
import { capexApproversApi } from "../Query/Settings/Capex";
import { estimationApproversApi } from "../Query/Settings/Estimation";
import { subCapexApproversApi } from "../Query/Settings/SubCapex";
import { additionalCostApproversApi } from "../Query/Settings/AdditionalCost";
import { addBudgetApi } from "../Query/Capex/AddBudget";
import { addCapexApi } from "../Query/Capex/AddCapex";
import { operationApi } from "../Query/Masterlist/Operation";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    userLogin: userLoginReducer,
    toast: toastReducer,
    confirm: confirmReducer,
    changePassword: changePasswordReducer,
    ipSetup: ipSetupReducer,
    collapseCapex: collapseCapexReducer,
    booleanState: booleanStateReducer,
    actionMenu: actionMenuReducer,
    tab: tabReducer,

    // drawer: drawerReducer,
    // dialog: dialogReducer,
    // tableDialog: tableDialogReducer,
    // datePicker: datePickerReducer,
    // importFile: importFileReducer,
    // exportFile: exportFileReducer,
    // scanFile: scanFileReducer,

    [masterlistApi.reducerPath]: masterlistApi.reducer,
    [changePasswordApi.reducerPath]: changePasswordApi.reducer,
    // [modulesApi.reducerPath]: modulesApi.reducer,

    // Masterlist
    [typeOfRequestApi.reducerPath]: typeOfRequestApi.reducer,
    [capexApi.reducerPath]: capexApi.reducer,
    [subCapexApi.reducerPath]: subCapexApi.reducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
    [typeOfExpenditureApi.reducerPath]: typeOfExpenditureApi.reducer,
    [enrolledBudgetApi.reducerPath]: enrolledBudgetApi.reducer,
    [operationApi.reducerPath]: operationApi.reducer,
    [creditApi.reducerPath]: creditApi.reducer,
    // [serviceProviderApi.reducerPath]: serviceProviderApi.reducer,

    // [majorCategoryApi.reducerPath]: majorCategoryApi.reducer,
    [minorCategoryApi.reducerPath]: minorCategoryApi.reducer,
    // [categoryListApi.reducerPath]: categoryListApi.reducer,

    [fistoCompanyApi.reducerPath]: fistoCompanyApi.reducer,
    [fistoDepartmentApi.reducerPath]: fistoDepartmentApi.reducer,
    [fistoLocationApi.reducerPath]: fistoLocationApi.reducer,
    [fistoAccountTitleApi.reducerPath]: fistoAccountTitleApi.reducer,
    [fistoSupplierApi.reducerPath]: fistoSupplierApi.reducer,

    [elixirApi.reducerPath]: elixirApi.reducer,

    [ymirApi.reducerPath]: ymirApi.reducer,
    [ymirPrApi.reducerPath]: ymirPrApi.reducer,

    [oneRDFApi.reducerPath]: oneRDFApi.reducer,
    [oneRDFCoaApi.reducerPath]: oneRDFCoaApi.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    [businessUnitApi.reducerPath]: businessUnitApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [unitApi.reducerPath]: unitApi.reducer,
    [subUnitApi.reducerPath]: subUnitApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
    [accountTitleApi.reducerPath]: accountTitleApi.reducer,
    [supplierApi.reducerPath]: supplierApi.reducer,
    [shipToApi.reducerPath]: shipToApi.reducer,
    [unitOfMeasurementApi.reducerPath]: unitOfMeasurementApi.reducer,
    [smallToolsApi.reducerPath]: smallToolsApi.reducer,

    [divisionApi.reducerPath]: divisionApi.reducer,
    [ipAddressSetupApi.reducerPath]: ipAddressSetupApi.reducer,
    [tokenSetupApi.reducerPath]: tokenSetupApi.reducer,
    [ipAddressPretestSetupApi.reducerPath]: ipAddressPretestSetupApi.reducer,

    // User Management
    [userAccountsApi.reducerPath]: userAccountsApi.reducer,
    [sedarUsersApi.reducerPath]: sedarUsersApi.reducer,
    [roleManagementApi.reducerPath]: roleManagementApi.reducer,

    // Fixed Asset
    [fixedAssetApi.reducerPath]: fixedAssetApi.reducer,
    [additionalCostApi.reducerPath]: additionalCostApi.reducer,
    [printOfflineFaApi.reducerPath]: printOfflineFaApi.reducer,
    [assetStatusApi.reducerPath]: assetStatusApi.reducer,
    [cycleCountStatusApi.reducerPath]: cycleCountStatusApi.reducer,
    [assetMovementStatusApi.reducerPath]: assetMovementStatusApi.reducer,
    [depreciationStatusApi.reducerPath]: depreciationStatusApi.reducer,

    // Settings
    [approverSettingsApi.reducerPath]: approverSettingsApi.reducer,
    [unitApproversApi.reducerPath]: unitApproversApi.reducer,
    [assetTransferApi.reducerPath]: assetTransferApi.reducer,
    [assetTransferPulloutApi.reducerPath]: assetTransferPulloutApi.reducer,
    [assetPulloutApi.reducerPath]: assetPulloutApi.reducer,
    [assetEvaluationApi.reducerPath]: assetEvaluationApi.reducer,
    [assetDisposalApi.reducerPath]: assetDisposalApi.reducer,
    [capexApproversApi.reducerPath]: capexApproversApi.reducer,
    [estimationApproversApi.reducerPath]: estimationApproversApi.reducer,
    [subCapexApproversApi.reducerPath]: subCapexApproversApi.reducer,
    [additionalCostApproversApi.reducerPath]: additionalCostApproversApi.reducer,
    [coordinatorSettingsApi.reducerPath]: coordinatorSettingsApi.reducer,
    [receiverSettingsApi.reducerPath]: receiverSettingsApi.reducer,

    // Request
    [requisitionApi.reducerPath]: requisitionApi.reducer,
    [requisitionSmsApi.reducerPath]: requisitionSmsApi.reducer,
    [requestContainerApi.reducerPath]: requestContainerApi.reducer,
    [purchaseRequestApi.reducerPath]: purchaseRequestApi.reducer,

    [transferApi.reducerPath]: transferApi.reducer,
    [pulloutApi.reducerPath]: pulloutApi.reducer,
    [evaluationApi.reducerPath]: evaluationApi.reducer,
    [disposalApi.reducerPath]: disposalApi.reducer,

    //Capex
    [addBudgetApi.reducerPath]: addBudgetApi.reducer,
    [addCapexApi.reducerPath]: addCapexApi.reducer,

    // Approval
    [approvalApi.reducerPath]: approvalApi.reducer,
    [transferApprovalApi.reducerPath]: transferApprovalApi.reducer,
    [pulloutApprovalApi.reducerPath]: pulloutApprovalApi.reducer,
    [evaluationApprovalApi.reducerPath]: evaluationApprovalApi.reducer,

    [assetReceivingApi.reducerPath]: assetReceivingApi.reducer,
    [receivedReceiptApi.reducerPath]: receivedReceiptApi.reducer,
    [assetReleasingApi.reducerPath]: assetReleasingApi.reducer,

    [notificationApi.reducerPath]: notificationApi.reducer,

    //Asset Movement Reports
    [assetMovementReportApi.reducerPath]: assetMovementReportApi.reducer,
    [generalLedgerReportApi.reducerPath]: generalLedgerReportApi.reducer,
    [purchaseRequestReconApi.reducerPath]: purchaseRequestReconApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat([
      masterlistApi.middleware,
      changePasswordApi.middleware,
      // modulesApi.middleware,

      // Masterlist
      typeOfRequestApi.middleware,
      capexApi.middleware,
      subCapexApi.middleware,
      warehouseApi.middleware,
      typeOfExpenditureApi.middleware,
      enrolledBudgetApi.middleware,
      operationApi.middleware,
      creditApi.middleware,

      // serviceProviderApi.middleware,
      // majorCategoryApi.middleware,
      minorCategoryApi.middleware,
      // categoryListApi.middleware,
      fistoCompanyApi.middleware,
      // ymirBusinessUnitApi.middleware,
      fistoDepartmentApi.middleware,
      // ymirUnitApi.middleware,
      fistoLocationApi.middleware,
      fistoAccountTitleApi.middleware,
      fistoSupplierApi.middleware,

      elixirApi.middleware,

      ymirApi.middleware,
      ymirPrApi.middleware,

      oneRDFApi.middleware,
      companyApi.middleware,
      oneRDFCoaApi.middleware,
      businessUnitApi.middleware,
      departmentApi.middleware,
      unitApi.middleware,
      subUnitApi.middleware,
      locationApi.middleware,
      accountTitleApi.middleware,
      supplierApi.middleware,
      shipToApi.middleware,
      unitOfMeasurementApi.middleware,
      smallToolsApi.middleware,

      divisionApi.middleware,
      printOfflineFaApi.middleware,
      ipAddressSetupApi.middleware,
      tokenSetupApi.middleware,
      ipAddressPretestSetupApi.middleware,

      // User Management
      userAccountsApi.middleware,
      sedarUsersApi.middleware,
      roleManagementApi.middleware,

      // Fixed Asset
      fixedAssetApi.middleware,
      additionalCostApi.middleware,
      assetStatusApi.middleware,
      cycleCountStatusApi.middleware,
      assetMovementStatusApi.middleware,
      depreciationStatusApi.middleware,

      // Settings
      approverSettingsApi.middleware,
      unitApproversApi.middleware,
      assetTransferApi.middleware,
      assetTransferPulloutApi.middleware,
      assetPulloutApi.middleware,
      assetEvaluationApi.middleware,
      assetDisposalApi.middleware,
      capexApproversApi.middleware,
      estimationApproversApi.middleware,
      subCapexApproversApi.middleware,
      additionalCostApproversApi.middleware,
      coordinatorSettingsApi.middleware,
      receiverSettingsApi.middleware,

      // Request
      requisitionApi.middleware,
      requisitionSmsApi.middleware,
      requestContainerApi.middleware,
      purchaseRequestApi.middleware,

      //Capex
      addBudgetApi.middleware,
      addCapexApi.middleware,

      // Asset Movement
      transferApi.middleware,
      pulloutApi.middleware,
      evaluationApi.middleware,
      disposalApi.middleware,

      // Approval
      approvalApi.middleware,
      transferApprovalApi.middleware,
      pulloutApprovalApi.middleware,
      evaluationApprovalApi.middleware,

      assetReceivingApi.middleware,
      receivedReceiptApi.middleware,
      assetReleasingApi.middleware,

      notificationApi.middleware,

      //Asset Movement Reports
      assetMovementReportApi.middleware,
      generalLedgerReportApi.middleware,
      purchaseRequestReconApi.middleware,
    ]),
});

setupListeners(store.dispatch);
