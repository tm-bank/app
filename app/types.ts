export interface Map {
  id: string;
  title: string;
  votes: number;
  viewLink: string;
  images: string[];
  tags: string[];
  createdAt: string;
  authorId: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  maps: Map[];
  votes: string[];
}
