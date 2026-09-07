export interface DialogSkeletonConfig {
  cards?: number;
  columns?: number;
  sections?: DialogSkeletonSection[];
  list?: DialogSkeletonList;
}

export interface DialogSkeletonSection {
  height?: number;
}

export interface DialogSkeletonList {
  items?: number;
  height?: number;
}