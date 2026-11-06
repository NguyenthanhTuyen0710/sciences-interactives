import AuthForm from "@/components/AuthForm";
export const metadata = { title: "Connexion" };
export default function Page() {
  return <div className="py-6"><AuthForm mode="login" /><p className="mx-auto mt-4 max-w-md text-center text-xs text-slate-500">Comptes de démonstration : eleve@demo.fr / demo1234 · prof@demo.fr / demo1234</p></div>;
}
