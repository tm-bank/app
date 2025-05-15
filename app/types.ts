export interface Map {
  id: number;
  created_at: Date;
  title: string;
  author: string;
  images: string[];
  tags: string[];
  tmx_link: string;
  views: number;
}
