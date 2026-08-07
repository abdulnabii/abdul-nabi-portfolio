import { redirect } from "next/navigation";

export default function AutoBlogRedirectPage() {
  redirect("/admin/blogs");
}
