export interface Map {
  title: string;
  views: number;
  viewLink: string;
  images: string[];
  tags: string[];
}

export interface MapDataRow {
  id: string;
  map: Map;
  createdAt: Date;
  author: string; // username
  authorDisplay: string; // display name
}
