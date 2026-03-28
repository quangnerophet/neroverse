import PostDetailClient from "@/components/PostDetailClient";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { initialPosts } from "@/lib/mockData";

export async function generateStaticParams() {
  try {
    const postsSnapshot = await getDocs(collection(db, "posts"));
    if (postsSnapshot.empty) {
      return initialPosts.map((post) => ({ id: post.id }));
    }
    return postsSnapshot.docs.map((doc) => ({
      id: doc.id,
    }));
  } catch (error) {
    console.error("Firestore fetch failed during build:", error);
    // Fallback to initialPosts to ensure build doesn't fail
    return initialPosts.map((post) => ({ id: post.id }));
  }
}

export default function PostDetailPage() {
  return <PostDetailClient />;
}
