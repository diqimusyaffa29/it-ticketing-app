import { Metadata } from "next";
import RegisterForm from "./RegisterForm";


export const metadata: Metadata = {
    title: "Register Page"
}


export default function RegsisterPage() {
    return <RegisterForm />
}