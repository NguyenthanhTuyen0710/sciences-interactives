import AuthForm from "@/components/AuthForm";
export const metadata = { title: "Inscription" };
export default function Page() {
  return <div className="py-6"><AuthForm mode="register" /></div>;
}
