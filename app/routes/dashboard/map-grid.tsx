// "use client";

// import { Eye } from "lucide-react";
// import { Badge } from "~/components/ui/badge";
// import { Button } from "~/components/ui/button";
// import { Card, CardContent, CardFooter } from "~/components/ui/card";
// import { useAppSelector } from "~/store/store";
// import type { Map } from "~/types";
// import { deleteMap } from "~/store/db";
// import { useAuth } from "~/providers/auth-provider";
// import { Link } from "react-router";

// export function MapGrid() {
//   const maps = useAppSelector((state) => state.maps);
//   const { user } = useAuth();

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold mb-2">Your maps</h2>
//         <p className="text-muted-foreground">Browse your Trackmania tracks</p>
//       </div>
//       {maps.maps.length === 0 && (
//         <div className="flex items-center justify-center h-64">
//           <p className="text-muted-foreground">No results found</p>
//         </div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {maps.maps
//           .filter((map) => map.author == user?.id)
//           .map((item) => (
//             <SceneryCard key={item.id} item={item} />
//           ))}
//       </div>
//     </div>
//   );
// }

// function SceneryCard({ item }: { item: Map }) {
//   const { user } = useAuth();

//   return (
//     <Link to={`/map/${item.id}`}>
//       <Card className="overflow-hidden" key={item.id}>
//         <div className="relative aspect-[3/2] overflow-hidden">
//           <img
//             src={
//               "https://wgztuhhevsawvztlqsfp.supabase.co/storage/v1/object/public/images//" +
//                 item.images[0] || "placeholder.svg"
//             }
//             alt={item.title}
//             className="object-cover w-full h-full transition-transform hover:scale-105"
//           />
//         </div>

//         <CardContent className="p-4">
//           <div className="flex justify-between items-start">
//             <div>
//               <h3 className="font-medium text-base">{item.title}</h3>
//               <p className="text-sm text-muted-foreground">
//                 by {item.author_display}
//               </p>
//             </div>
//           </div>
//           <div className="flex gap-2 mt-2 flex-wrap">
//             {item.tags.map((category: string) => (
//               <Badge variant="outline" className="px-2" key={category}>
//                 {category}
//               </Badge>
//             ))}
//           </div>
//         </CardContent>
//         <div className="flex grow" />
//         <CardFooter className="pt-0 flex justify-between">
//           <div className="flex items-center gap-2">
//             <Eye className={`h-4 w-4`} />
//             <span className="text-sm text-muted-foreground">{item.views}</span>
//           </div>
//           <Button
//             variant="destructive"
//             size="sm"
//             className="gap-1"
//             onClick={() => {
//               // One last auth check
//               if (user?.id === item.author) {
//                 deleteMap(item.id);
//               }
//             }}
//           >
//             <span>Delete</span>
//           </Button>
//         </CardFooter>
//       </Card>
//     </Link>
//   );
// }
