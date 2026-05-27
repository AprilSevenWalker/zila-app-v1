import { redirect } from "next/navigation";

export default function ChoosePaymentMethodPage() {
  redirect("/payments/send");
}
