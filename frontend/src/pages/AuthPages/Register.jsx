import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Register | PlayStation Rental"
        description="Register page for PlayStation Rental Application"
      />

      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
