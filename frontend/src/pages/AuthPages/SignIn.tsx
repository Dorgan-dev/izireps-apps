import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Login | PlayStation Rental"
        description="Login page for PlayStation Rental Application"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
