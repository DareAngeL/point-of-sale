export interface ReportDefinition {
  orientation: PaperOrientation;
  format: any;
  title: string;
  columns?: Array<{
    field: string;
    headerTitle: string;
    dataType: DataType;
    width?: number;
    left: number;
    align: Alignment;
    valueIfNull: string;
  }>;
}

export enum DataType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  TIME = "TIME",
}

export enum Alignment {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
  FLEXEND = "flex-end",
  FLEXSTART = "flex-start",
}

export enum PaperOrientation {
  PORTRAIT = "P",
  LANDSCAPE = "L",
}

export const PaperFormat = {
  Letter: "Letter",
  Folio: [612, 936],
};
