export interface Map {
  id: string;
  title: string;
  votes: number;
  viewLink: string;
  images: string[];
  tags: string[];
  createdAt: string;
  authorId: string;
  blocks: Block[];
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  maps: Map[];
  blocks: Block[];
  votes: string[];
  admin: boolean;
}

export interface Block {
  id: string;
  title: string;
  image: string;
  tags: string[];
  votes: number;
  createdAt: string;
  authorId: string;
  bucketFileName: string;
  maps: Map[];
}
