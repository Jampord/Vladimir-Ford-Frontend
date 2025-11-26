import React, { Fragment, useEffect, useRef, useState } from "react";
import "../Style/sidebar.scss";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { openSidebar } from "../Redux/StateManagement/sidebar";
import { toggleSidebar } from "../Redux/StateManagement/sidebar";
import { notificationApi } from "../Redux/Query/Notification";

//Img
import VladimirLogoSmaller from "../Img/VladimirSmaller.png";
import MisLogo from "../Img/MIS LOGO.png";

// Components
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  Collapse,
  Divider,
  IconButton,
  Typography,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import Zoom from "@mui/material/Zoom";
import Badge from "@mui/material/Badge";

// Icons
import {
  Dashboard,
  ListAlt,
  AccountBox,
  LocalOffer,
  RecentActors,
  ManageAccountsSharp,
  Category,
  Inventory2Rounded,
  FormatListBulletedRounded,
  AssignmentIndRounded,
  ClassRounded,
  PlaylistRemoveRounded,
  SummarizeRounded,
  KeyboardDoubleArrowLeftRounded,
  SupervisorAccountRounded,
  FactCheckRounded,
  Apartment,
  LocationOn,
  Schema,
  Construction,
  Badge as badgeIcon,
  InventoryRounded,
  Groups2Rounded,
  StoreRounded,
  MonetizationOn,
  CategoryOutlined,
  BackupTableRounded,
  FactCheck,
  SettingsAccessibility,
  ManageAccounts,
  PermDataSetting,
  SettingsApplications,
  HowToReg,
  AssignmentTurnedIn,
  ExpandLessRounded,
  ExpandMoreRounded,
  Segment,
  DomainVerification,
  PostAdd,
  ShoppingBasket,
  CallReceived,
  MoveUpRounded,
  TransferWithinAStation,
  RemoveFromQueue,
  RuleFolder,
  OpenInBrowserOutlined,
  Output,
  BusinessCenter,
  Ballot,
  NoteAddRounded,
  Straighten,
  ApprovalRounded,
  MoveDown,
  HomeRepairService,
  PlaylistRemove,
  Warehouse,
  TableRows,
  MoveDownOutlined,
  Addchart,
  Troubleshoot,
  History,
  ScreenSearchDesktop,
  BadgeOutlined,
  BadgeSharp,
  CreditCard,
  Analytics,
  PriceChange,
  Radar,
  RequestQuote,
  LooksOne,
  AddToQueue,
  LocalShipping,
  Monitor,
  QueuePlayNext,
  MoveUpOutlined,
  HighlightAlt,
  DomainAdd,
  AddBox,
  Gavel,
  Unarchive,
  BorderAll,
  PriceCheck,
  Engineering,
  Gite,
} from "@mui/icons-material";
import { useGetNotificationApiQuery } from "../Redux/Query/Notification";

const Sidebar = () => {
  const [state, setState] = useState(true);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [masterListCollapse, setMasterListCollapse] = useState(false);
  const [userManagementCollapse, setUserManagementCollapse] = useState(false);
  const [fixedAssetCollapse, setFixedAssetCollapse] = useState(false);
  const [settingsCollapse, setSettingsCollapse] = useState(false);
  const [assetRequisitionCollapse, setAssetRequisitionCollapse] = useState(false);
  const [assetMovementCollapse, setAssetMovementCollapse] = useState(false);
  const [capexCollapse, setCapexCollapse] = useState(false);
  const [approvingCollapse, setApprovingCollapse] = useState(false);
  const [monitoringCollapse, setMonitoringCollapse] = useState(false);
  const [reportCollapse, setReportCollapse] = useState(false);
  const collapseArray = [
    masterListCollapse,
    userManagementCollapse,
    settingsCollapse,
    assetRequisitionCollapse,
    assetMovementCollapse,
    monitoringCollapse,
    reportCollapse,
  ];

  const isSmallScreen = useMediaQuery("(width: 800)");
  const sidebarRef = useRef(null);

  const dispatch = useDispatch();
  const collapse = useSelector((state) => state.sidebar.open);
  const permissions = useSelector((state) => state.userLogin?.user.role.access_permission);

  const navigate = useNavigate();

  const drawer = useSelector((state) => state.booleanState.drawer);

  const handleMenuCollapse = () => {
    dispatch(toggleSidebar());
  };

  const closeCollapse = () => {
    setMasterListCollapse(false);
    setUserManagementCollapse(false);
    setSettingsCollapse(false);
    setAssetRequisitionCollapse(false);
    setAssetMovementCollapse(false);
    setCapexCollapse(false);
    setApprovingCollapse(false);
    setMonitoringCollapse(false);
    setReportCollapse(false);
    setFixedAssetCollapse(false);
  };

  // NOTIFICATION
  const { data: notifData, refetch } = useGetNotificationApiQuery(null, { refetchOnMountOrArgChange: true });
  // console.log("notif", notifData);
  // useEffect(() => {
  //   refetch();
  // }, [notifData]);

  const { pathname } = useLocation();
  const location = useLocation();
  // console.log("location", location);

  // COLLAPSE SIDEBAR
  useEffect(() => {
    if (!collapse || pathname === "/") {
      closeCollapse();
      return;
    }

    const routeStateMap = {
      masterlist: setMasterListCollapse,
      "user-management": setUserManagementCollapse,
      "fixed-asset": setFixedAssetCollapse,
      settings: setSettingsCollapse,
      "asset-requisition": setAssetRequisitionCollapse,
      "asset-movement": setAssetMovementCollapse,
      capex: setCapexCollapse,
      approving: setApprovingCollapse,
      reports: setReportCollapse,
      monitoring: setMonitoringCollapse,
    };

    const match = Object.keys(routeStateMap).find((route) => pathname.includes(route));
    if (match) {
      routeStateMap[match](true);
    }
  }, [collapse, pathname]);

  // OVERFLOW
  useEffect(() => {
    const checkOverflow = () => {
      const content = sidebarRef.current;
      if (content) {
        const overflowing = content.scrollHeight > content.clientHeight;
        setIsOverflowing(overflowing);
      }
    };

    setTimeout(() => {
      checkOverflow();
    }, 200);

    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [isSmallScreen]);

  const MENU_LIST = [
    {
      label: "Dashboard",
      icon: Dashboard,
      path: "/",
      permission: "dashboard",
      setter: closeCollapse,
    },

    {
      label: "Masterlist",
      icon: ListAlt,
      path: "/masterlist",
      permission: "masterlist",
      children: [
        // {
        //   label: "Modules",
        //   icon: DatasetRounded,
        //   path: "/masterlist/modules",
        //   permission: [],
        // },

        // * Synching
        {
          label: "One RDF Charging",
          icon: LooksOne,
          path: "/masterlist/one-rdf-charging",
          permission: "one-rdf-charging",
        },

        {
          label: "Company",
          icon: Apartment,
          path: "/masterlist/company",
          permission: "company",
        },

        {
          label: "Business Unit",
          icon: BusinessCenter,
          path: "/masterlist/business-unit",
          permission: "business-unit",
        },
        {
          label: "Department",
          icon: Schema,
          path: "/masterlist/department",
          permission: "department",
        },
        {
          label: "Unit",
          icon: Ballot,
          path: "/masterlist/unit",
          permission: "unit",
        },
        {
          label: "Sub Unit",
          icon: Segment,
          path: "/masterlist/sub-unit",
          permission: "sub-unit",
        },
        {
          label: "Location",
          icon: LocationOn,
          path: "/masterlist/location",
          permission: "location",
        },
        {
          label: "Account Title",
          icon: badgeIcon,
          path: "/masterlist/account-title",
          permission: "account-title",
        },
        {
          label: "Credit",
          icon: CreditCard,
          path: "/masterlist/credit",
          permission: "credit",
        },
        {
          label: "Supplier",
          icon: StoreRounded,
          path: "/masterlist/supplier",
          permission: "supplier",
        },
        {
          label: "Ship To",
          icon: LocalShipping,
          path: "/masterlist/ship-to",
          permission: "ship-to",
        },
        {
          label: "Unit of Measurement",
          icon: Straighten,
          path: "masterlist/unit-of-measurement",
          permission: "unit-of-measurement",
        },
        // {
        //   label: "Small Tools",
        //   icon: HomeRepairService,
        //   path: "/masterlist/small-tools",
        //   permission: "small-tools",
        // },

        // * CRUD Operations
        {
          label: "Division",
          icon: Groups2Rounded,
          path: "/masterlist/division",
          permission: "division",
        },
        {
          label: "Type of Request",
          icon: BackupTableRounded,
          path: "/masterlist/type-of-request",
          permission: "type-of-request",
        },
        {
          label: "Capex",
          icon: MonetizationOn,
          path: "/masterlist/capex",
          permission: "capex",
        },
        {
          label: "Warehouse",
          icon: Warehouse,
          path: "/masterlist/warehouse",
          permission: "warehouse",
        },
        // {
        //   label: "Service Provider",
        //   icon: Construction,
        //   path: "/masterlist/service-provider",
        //   permission: "service-provider",
        // },
        {
          label: "Category",
          icon: Category,
          path: "/masterlist/category",
          permission: "category",
        },
        {
          label: "Status Category",
          icon: FactCheck,
          path: "/masterlist/status-category",
          permission: "status-category",
        },
        {
          label: "Type of Expenditure",
          icon: BorderAll,
          path: "/masterlist/type-of-expenditure",
          permission: "type-of-expenditure",
        },
        {
          label: "Operation",
          icon: Engineering,
          path: "/masterlist/operation",
          permission: "operation",
        },
        // {
        //   label: "Enrolled Budget",
        //   icon: PriceCheck,
        //   path: "/masterlist/enrolled-budget",
        //   permission: "enrolled-budget",
        // },
        {
          label: "Movement Warehouse",
          icon: Gite,
          path: "/masterlist/movement-warehouse",
          permission: "movement-warehouse",
        },
      ],
      open: masterListCollapse,
      setter: (e) => {
        // e.preventDefault();
        setMasterListCollapse(!masterListCollapse);
        setUserManagementCollapse(false);
        setFixedAssetCollapse(false);
        setSettingsCollapse(false);
        setAssetRequisitionCollapse(false);
        setAssetMovementCollapse(false);
        setCapexCollapse(false);
        setApprovingCollapse(false);
        setMonitoringCollapse(false);
        setReportCollapse(false);
        closeCollapse;
        dispatch(openSidebar());
      },
    },

    {
      label: "User Management",
      icon: SupervisorAccountRounded,
      path: "/user-management",
      permission: "user-management",
      children: [
        {
          label: "User Accounts",
          icon: AccountBox,
          path: "/user-management/user-accounts",
          permission: "user-accounts",
        },
        {
          label: "Role Management",
          icon: ManageAccountsSharp,
          path: "/user-management/role-management",
          permission: "role-management",
        },
      ],
      open: userManagementCollapse,
      setter: (e) => {
        // e.preventDefault();
        setUserManagementCollapse(!userManagementCollapse);
        setMasterListCollapse(false);
        setSettingsCollapse(false);
        setAssetRequisitionCollapse(false);
        setAssetMovementCollapse(false);
        setCapexCollapse(false);
        setApprovingCollapse(false);
        setMonitoringCollapse(false);
        setReportCollapse(false);
        setFixedAssetCollapse(false);
        closeCollapse;
        dispatch(openSidebar());
      },
    },

    {
      label: "Asset Management",
      icon: InventoryRounded,
      path: "/fixed-asset",
      permission: "fixed-asset",
      notification: notifData?.toTagCount || notifData?.toSmallToolTagging,
      children: [
        {
          label: "Fixed Asset",
          icon: InventoryRounded,
          path: "/fixed-asset/fixed-asset",
          permission: "fixed-asset",
          notification: notifData?.toTagCount + notifData?.toSmallToolTagging,
        },
        {
          label: "Depreciation",
          icon: PriceChange,
          path: "/fixed-asset/depreciation",
          permission: "fixed-asset",
        },
      ],
      open: fixedAssetCollapse,
      // setter: closeCollapse,
      setter: (e) => {
        // e.preventDefault();
        setFixedAssetCollapse(!fixedAssetCollapse);
        setUserManagementCollapse(false);
        setMasterListCollapse(false);
        setSettingsCollapse(false);
        setAssetRequisitionCollapse(false);
        setAssetMovementCollapse(false);
        setCapexCollapse(false);
        setApprovingCollapse(false);
        setMonitoringCollapse(false);
        setReportCollapse(false);
        closeCollapse;
        dispatch(openSidebar());
      },
    },

    {
      label: "Settings",
      icon: PermDataSetting,
      path: "/settings",
      permission: "settings",
      children: [
        {
          label: "Approver Settings",
          icon: HowToReg,
          path: "/settings/approver-settings",
          permission: "approver-settings",
        },
        {
          label: "Form Settings",
          icon: SettingsApplications,
          path: "/settings/form-settings",
          permission: "form-settings",
        },

        // <Divider sx={{ mb: "10px", mx: "15px" }} />,

        {
          label: "Coordinator Settings",
          icon: ManageAccounts,
          path: "/settings/coordinator-settings",
          permission: "coordinator-settings",
        },
        {
          label: "Receiver Settings",
          icon: BadgeSharp,
          path: "/settings/receiver-settings",
          permission: "receiver-settings",
        },
      ],
      open: settingsCollapse,
      setter: (e) => {
        // e.preventDefault();
        setSettingsCollapse(!settingsCollapse);
        setUserManagementCollapse(false);
        setFixedAssetCollapse(false);
        setMasterListCollapse(false);
        setAssetRequisitionCollapse(false);
        setAssetMovementCollapse(false);
        setCapexCollapse(false);
        setApprovingCollapse(false);
        setMonitoringCollapse(false);
        setReportCollapse(false);
        closeCollapse;
        dispatch(openSidebar());
      },
    },

    {
      label: "Asset Requisition",
      icon: FactCheckRounded,
      path: "/asset-requisition",
      permission: "asset-requisition",
      notification: notifData?.toPR || notifData?.toReceive || notifData?.toRelease,
      children: [
        {
          label: "Requisition",
          icon: AssignmentTurnedIn,
          path: "/asset-requisition/requisition",
          permission: "requisition",
          setter: closeCollapse,
        },
        // {
        //   label: "Purchase Request",
        //   icon: ShoppingBasket,
        //   path: "/asset-requisition/purchase-request",
        //   permission: "purchase-request",
        //   notification: notifData?.toPR,
        //   setter: closeCollapse,
        // },
        {
          label: "Received Asset",
          icon: OpenInBrowserOutlined,
          path: "/asset-requisition/requisition-received-asset",
          permission: "requisition-received-asset",
          notification: notifData?.toReceive,
          setter: closeCollapse,
        },
        {
          label: "RR Summary",
          icon: TableRows,
          path: "/asset-requisition/requisition-rr-summary",
          permission: "requisition-rr-summary",
          setter: closeCollapse,
        },
        {
          label: "Releasing of Asset",
          icon: Output,
          path: "/asset-requisition/requisition-releasing",
          permission: "requisition-releasing",
          notification: notifData?.toRelease,
          setter: closeCollapse,
        },
        {
          label: "Releasing Monitoring",
          icon: AddToQueue,
          path: "/asset-requisition/requisition-releasing-monitoring",
          permission: "requisition-releasing-monitoring",
          setter: closeCollapse,
        },
        // {
        //   label: "Small Tools Releasing",
        //   icon: Construction,
        //   path: "/asset-requisition/small-tools-releasing",
        //   permission: "requisition-releasing",
        //   notification: notifData?.toSmallToolRelease,
        //   setter: closeCollapse,
        // },
      ],
      open: assetRequisitionCollapse,
      setter: () => {
        setAssetRequisitionCollapse(!assetRequisitionCollapse);
        setMasterListCollapse(false);
        setUserManagementCollapse(false);
        setFixedAssetCollapse(false);
        setSettingsCollapse(false);
        setAssetMovementCollapse(false);
        setCapexCollapse(false);
        setApprovingCollapse(false);
        setMonitoringCollapse(false);
        setReportCollapse(false);
        closeCollapse;
        dispatch(openSidebar());
      },
    },

    {
      label: "Asset Movement",
      icon: MoveUpRounded,
      path: "/asset-movement",
      permission: "asset-movement",
      notification:
        notifData?.toTransferReceiving ||
        notifData?.pulloutTransferReleasingCount ||
        notifData?.toPickUpCount ||
        notifData?.toEvaluateCount ||
        notifData?.toReplaceCount ||
        notifData?.spareCount ||
        notifData?.disposalCount ||
        notifData?.repairedCount ||
        notifData?.disposalReceivingCount,
      children: [
        {
          label: "Transfer",
          icon: TransferWithinAStation,
          path: "/asset-movement/transfer",
          permission: "transfer",
          setter: closeCollapse,
        },
        {
          label: "Receiving of Transfer",
          icon: MoveDownOutlined,
          path: "/asset-movement/transfer-receiving",
          permission: "transfer-receiving",
          notification: notifData?.toTransferReceiving,
          setter: closeCollapse,
        },
        {
          label: "Transfer Releasing",
          icon: CallReceived,
          path: "/asset-movement/transfer-pullout-releasing",
          permission: "transfer-pullout-releasing",
          notification: notifData?.pulloutTransferReleasingCount,
          setter: closeCollapse,
        },
        {
          label: "Pull Out",
          icon: RemoveFromQueue,
          path: "/asset-movement/pull-out",
          permission: "pull-out",
          setter: closeCollapse,
        },
        {
          label: "Evaluation",
          icon: ScreenSearchDesktop,
          path: "/asset-movement/evaluation",
          permission: "evaluation",
          notification:
            notifData?.toPickUpCount +
            notifData?.toEvaluateCount +
            notifData?.toReplaceCount +
            notifData?.spareCount +
            notifData?.disposalCount,
          setter: closeCollapse,
        },
        {
          label: "Pull Out Confirmation",
          icon: AssignmentTurnedIn,
          path: "/asset-movement/pull-out-confirmation",
          permission: "pull-out",
          notification: notifData?.repairedCount,
          setter: closeCollapse,
        },
        {
          label: "Disposal",
          icon: PlaylistRemoveRounded,
          path: "/asset-movement/disposal",
          permission: "disposal",
          setter: closeCollapse,
        },
        {
          label: "Receiving of Disposal",
          icon: HighlightAlt,
          path: "/asset-movement/disposal-receiving",
          permission: "disposal-receiving",
          notification: notifData?.disposalReceivingCount,
          setter: closeCollapse,
        },
      ],
      open: assetMovementCollapse,
      setter: () => {
        setAssetMovementCollapse(!assetMovementCollapse);
        setMasterListCollapse(false);
        setUserManagementCollapse(false);
        setFixedAssetCollapse(false);
        setSettingsCollapse(false);
        setAssetRequisitionCollapse(false);
        setCapexCollapse(false);
        setApprovingCollapse(false);
        setMonitoringCollapse(false);
        setReportCollapse(false);
        closeCollapse;
        dispatch(openSidebar());
      },
    },

    {
      label: "Capex",
      icon: DomainAdd,
      path: "/capex",
      permission: "capex-index",
      children: [
        {
          label: "Add Capex",
          icon: AddBox,
          path: "/capex/add-capex",
          permission: "add-capex",
          setter: closeCollapse,
        },
        {
          label: "Sub Capex",
          icon: Gavel,
          path: "/capex/sub-capex",
          permission: "sub-capex",
          setter: closeCollapse,
        },
        {
          label: "Additional Cost",
          icon: Unarchive,
          path: "/capex/additional-cost",
          permission: "additional-cost",
          setter: closeCollapse,
        },
        {
          label: "Add Budget",
          icon: RequestQuote,
          path: "/capex/add-budget",
          permission: "add-budget",
          setter: closeCollapse,
        },
      ],
      open: capexCollapse,
      setter: () => {
        setCapexCollapse(!capexCollapse);
        setApprovingCollapse(false);
        setMasterListCollapse(false);
        setUserManagementCollapse(false);
        setFixedAssetCollapse(false);
        setSettingsCollapse(false);
        setAssetRequisitionCollapse(false);
        setAssetMovementCollapse(false);
        setMonitoringCollapse(false);
        setReportCollapse(false);
        closeCollapse;
        dispatch(openSidebar());
      },
    },

    {
      label: "Approving",
      icon: DomainVerification,
      path: "/approving",
      permission: "approving",
      notification: permissions.includes("final-approving")
        ? notifData?.toApproveCount ||
          notifData?.toAcquisitionFaApproval ||
          notifData?.toTransferApproveCount ||
          notifData?.toTransferFaApproval ||
          notifData?.disposalApprovalCount
        : notifData?.toApproveCount || notifData?.toTransferApproveCount || notifData?.disposalApprovalCount,
      children: [
        {
          label: "Request",
          icon: ApprovalRounded,
          path: "/approving/request",
          permission: "approving-request",
          notification: permissions.includes("final-approving")
            ? notifData?.toApproveCount + notifData?.toAcquisitionFaApproval
            : notifData?.toApproveCount,
          setter: closeCollapse,
        },
        {
          label: "Transfer",
          icon: MoveDown,
          path: "/approving/transfer",
          permission: "approving-transfer",
          notification: notifData?.toTransferApproveCount + notifData?.toTransferFaApproval,
          setter: closeCollapse,
        },
        // {
        //   label: "Pull-Out",
        //   icon: HomeRepairService,
        //   path: "/approving/pull-out",
        //   permission: "approving-pull-out",
        //   setter: closeCollapse,
        // },
        {
          label: "Disposal",
          icon: PlaylistRemove,
          path: "/approving/disposal",
          permission: "approving-disposal",
          notification: notifData?.disposalApprovalCount,
          setter: closeCollapse,
        },
        // {
        //   label: "Evaluation",
        //   icon: Troubleshoot,
        //   path: "/approving/evaluation",
        //   permission: "approving-evaluation",
        //   setter: closeCollapse,
        // },
      ],
      open: approvingCollapse,
      setter: () => {
        setApprovingCollapse(!approvingCollapse);
        setMasterListCollapse(false);
        setUserManagementCollapse(false);
        setFixedAssetCollapse(false);
        setSettingsCollapse(false);
        setAssetRequisitionCollapse(false);
        setAssetMovementCollapse(false);
        setCapexCollapse(false);
        setMonitoringCollapse(false);
        setReportCollapse(false);
        closeCollapse;
        dispatch(openSidebar());
      },
    },

    {
      label: "Monitoring",
      icon: Monitor,
      path: "/monitoring",
      permission: "monitoring",
      children: [
        {
          label: "Request Monitoring",
          icon: PostAdd,
          path: "/monitoring/request-monitoring",
          permission: "request-monitoring",
          setter: closeCollapse,
        },
        {
          label: "Warehouse Monitoring",
          icon: Warehouse,
          path: "/monitoring/warehouse-monitoring",
          permission: "warehouse-monitoring",
          setter: closeCollapse,
        },
        {
          label: "Transfer Monitoring",
          icon: QueuePlayNext,
          path: "/monitoring/transfer-receiving-monitoring",
          permission: "transfer-receiving-monitoring",
          setter: closeCollapse,
        },
      ],
      open: monitoringCollapse,
      setter: () => {
        setMonitoringCollapse(!monitoringCollapse);
        setApprovingCollapse(false);
        setMasterListCollapse(false);
        setUserManagementCollapse(false);
        setFixedAssetCollapse(false);
        setSettingsCollapse(false);
        setAssetRequisitionCollapse(false);
        setAssetMovementCollapse(false);
        setCapexCollapse(false);
        setReportCollapse(false);
        closeCollapse;
        dispatch(openSidebar());
      },
    },

    {
      label: "Reports",
      icon: SummarizeRounded,
      path: "/reports",
      permission: "reports",
      children: [
        {
          label: "PR Report",
          icon: SummarizeRounded,
          path: "/reports/pr-report",
          permission: "pr-report",
          setter: closeCollapse,
        },
        {
          label: "Transfer Report",
          icon: Addchart,
          path: "/reports/transfer-report",
          permission: "transfer-report",
          setter: closeCollapse,
        },
        {
          label: "GL Report",
          icon: Analytics,
          path: "/reports/general-ledger-report",
          permission: "general-ledger-report",
          setter: closeCollapse,
        },
        {
          label: "PR Recon",
          icon: Radar,
          path: "/reports/purchase-request-recon",
          permission: "purchase-request-recon",
          setter: closeCollapse,
        },
        {
          label: "Depreciation Report",
          icon: RequestQuote,
          path: "/reports/depreciation-monthly-report",
          permission: "depreciation-monthly-report",
          setter: closeCollapse,
        },
        {
          label: "FA Report",
          icon: InventoryRounded,
          path: "/reports/fixed-assets-report",
          permission: "fixed-assets-report",
          setter: closeCollapse,
        },
      ],
      open: reportCollapse,
      setter: () => {
        setReportCollapse(!reportCollapse);
        setApprovingCollapse(false);
        setMasterListCollapse(false);
        setUserManagementCollapse(false);
        setFixedAssetCollapse(false);
        setSettingsCollapse(false);
        setAssetRequisitionCollapse(false);
        setAssetMovementCollapse(false);
        setCapexCollapse(false);
        closeCollapse;
        dispatch(openSidebar());
      },
    },

    {
      label: "Delivery Type",
      icon: LocalShipping,
      path: "/delivery-type",
      permission: "delivery-type",
      setter: closeCollapse,
      notification: notifData?.toDeliveryTypeTaggingCount,
    },
  ];

  return (
    <Box className={`sidebar ${collapse ? "" : isOverflowing === true ? "collapsed85" : "collapsed"}`}>
      <Box>
        {collapse ? (
          <IconButton
            className="sidebar__closeBtn"
            sx={{ position: "absolute", right: 10, top: 39, zIndex: 2 }}
            onClick={handleMenuCollapse}
            size="small"
          >
            <KeyboardDoubleArrowLeftRounded />
          </IconButton>
        ) : null}
        <Box className="sidebar__logo-container" onClick={() => navigate("/")} sx={{ cursor: "pointer" }}>
          <img
            src={VladimirLogoSmaller}
            alt="Vladimir Logo"
            style={{
              width: "40px",
              height: "36px",
            }}
          />

          {collapse && (
            <Typography
              color="secondary"
              sx={{
                zIndex: 0,
                fontFamily: "Josefin Sans",
                fontSize: "22px",
                letterSpacing: "2px",
                pl: 2.3,
                userSelect: "none",
              }}
            >
              VLADIMIR
            </Typography>
          )}
        </Box>
      </Box>

      <Box className="sidebar__menus" ref={sidebarRef}>
        <List>
          {MENU_LIST?.map((item) => {
            return (
              permissions.split(", ").includes(item.permission) && (
                <ListItem
                  key={item.path}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: 0,
                    px: "10px",
                  }}
                  disablePadding
                  dense
                >
                  <Tooltip title={!collapse && item.label} TransitionComponent={Zoom} placement="right" arrow>
                    <ListItemButton
                      className="sidebar__menu-btn"
                      component={NavLink}
                      to={item.path}
                      sx={{
                        width: collapse ? "225px" : "98%",
                        borderRadius: "12px",
                      }}
                      onClick={item?.setter}
                    >
                      <ListItemIcon sx={{ py: 1, minWidth: "35px" }}>
                        {item?.notification ? (
                          <Badge color="error" badgeContent={item?.notification} variant="dot">
                            <SvgIcon component={item.icon} />
                          </Badge>
                        ) : (
                          <SvgIcon component={item.icon} />
                        )}
                      </ListItemIcon>
                      {collapse && <ListItemText primary={item.label} />}
                      {collapse && Boolean(item.children?.length) && (
                        <ExpandLessRounded
                          sx={{
                            transform: item.open ? "rotate(0deg)" : "rotate(180deg)",
                            transition: "0.3s ease-in-out",
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>

                  {Boolean(item.children?.length) && (
                    <Collapse in={item.open} timeout="auto" unmountOnExit sx={{ width: "100%" }}>
                      <List component="div" sx={{ pt: 0.5 }}>
                        {item.children.map((childItem) => {
                          return (
                            permissions.split(", ").includes(childItem.permission) && (
                              <Fragment key={childItem.label}>
                                {childItem.label === "Coordinator Settings" ? (
                                  <>
                                    <Divider sx={{ mt: 1, mx: "15px", fontSize: "11px", color: "text.secondary" }}>
                                      For Asset Transfer
                                    </Divider>
                                  </>
                                ) : item?.label === "Asset Movement" && childItem.label === "Transfer" ? (
                                  <>
                                    <Divider sx={{ mt: 1, mx: "15px", fontSize: "11px", color: "text.secondary" }}>
                                      Asset Transfer
                                    </Divider>
                                  </>
                                ) : item?.label === "Asset Movement" && childItem.label === "Pull Out" ? (
                                  <>
                                    <Divider sx={{ mt: 1, mx: "15px", fontSize: "11px", color: "text.secondary" }}>
                                      Asset Pullout
                                    </Divider>
                                  </>
                                ) : item?.label === "Asset Movement" && childItem.label === "Disposal" ? (
                                  <>
                                    <Divider sx={{ mt: 1, mx: "15px", fontSize: "11px", color: "text.secondary" }}>
                                      Asset Disposal
                                    </Divider>
                                  </>
                                ) : null}
                                <ListItemButton
                                  className="sidebar__menu-btn-list"
                                  key={childItem.path}
                                  component={NavLink}
                                  to={childItem.path}
                                  sx={{
                                    width: "208px",
                                    ml: 2,
                                    borderRadius: "12px",
                                    px: 0,
                                  }}
                                  dense
                                >
                                  <ListItemIcon sx={{ pl: 2, py: 0.5 }}>
                                    <Badge badgeContent={childItem.notification} color="error">
                                      <SvgIcon component={childItem.icon} />
                                    </Badge>
                                  </ListItemIcon>
                                  <ListItemText primary={childItem.label} />
                                </ListItemButton>
                              </Fragment>
                            )
                          );
                        })}
                      </List>
                      <Divider sx={{ mb: "10px", mx: "15px" }} />
                    </Collapse>
                  )}
                </ListItem>
              )
            );
          })}
        </List>
      </Box>

      <Box className="sidebar__copyright">
        <img
          src={MisLogo}
          alt="MIS-Logo"
          style={{
            width: "50px",
            height: "50px",
          }}
        />
        {collapse && (
          <p sx={{ transition: "0.3s ease-in-out" }}>
            Powered By MIS All rights reserved <br />
            Copyrights © 2021
          </p>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
