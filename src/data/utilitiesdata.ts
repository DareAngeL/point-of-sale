const rootPath = "/pages/utilities";

export const utilitiesList = {
  name: "Utilities",
  children: [
    {
      name: "Central Server Setup",
      url: `/pages/centralServerSetup`,
      modalName: "Central Server Setup",
      menfield: "",
      isPage: true,
    },
    {
      name: "Download and Sync Master File",
      url: `${rootPath}/downloadSyncMasterFile`,
      modalName: "Download and Sync Master File",
      menfield: "utilities_syncmasterfile",
      isPage: false,
    },
    {
      name: "Automation of Sales Transaction",
      url: `/pages/automationOfSalesTransaction`,
      modalName: "Automation of Sales Transaction",
      menfield: "",
      isPage: true,
    },
    {
      name: "Import",
      url: `${rootPath}/import`,
      modalName: "Import",
      menfield: "utilities_import",
      isPage: false,
    },
    {
      name: "Export",
      url: `${rootPath}/export`,
      modalName: "Export",
      menfield: "",
      isPage: false,
    },
    {
      name: "Regenerate Mall Files",
      url: `${rootPath}/regenerateMallFiles`,
      modalName: "Authorize User",
      menfield: "utilities_ftp",
      isPage: false,
    },
    {
      name: "Re-compute ZReading ",
      url: `${rootPath}/recomputeZReading `,
      modalName: "Re-compute ZReading ",
      menfield: "",
      isPage: false,
    },
    {
      name: "Change Password ",
      url: `${rootPath}/changePassword `,
      modalName: "Change Password ",
      menfield: "utilities_changepass",
      isPage: false,
    },
    {
      name: "Reprint Stickers",
      url: `${rootPath}/reprintStickers`,
      modalName: "Reprint Stickers",
      menfield: "utilities_reprintsticker",
      isPage: false,
    },
    {
      name: "Backup Data ",
      url: `${rootPath}/backupData `,
      modalName: "Backup Data ",
      menfield: "utilities_backup",
      isPage: false,
    },
    {
      name: "Theme Settings",
      url: `/pages/themeSettings`,
      modalName: "Theme Settings",
      menfield: "",
      isPage: true,
    },
    {
      name: "View Sent Files",
      url: `${rootPath}/viewSentFiles`,
      modalName: "View Sent Files",
      menfield: "",
      isPage: false,
    },
    {
      name: "Cancel Z-Reading",
      url: `${rootPath}/cancelZReading`,
      modalName: "Cancel Z Reading",
      menfield: "",
      isPage: false,
    },
    {
      name: "Fixes",
      url: `${rootPath}/fixes`,
    }
  ],
};
