import { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
    title:"Login Page"
}

export default function LoginPage() {
    return <LoginForm />
}